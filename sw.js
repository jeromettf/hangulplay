// 한글 쏙쏙 오프라인 지원
// - 앱(index.html): 새 버전을 먼저 받고, 인터넷이 없으면 저장해 둔 것을 열어요
// - 포켓몬 그림·도감 정보·마을 걷기 그림: 한 번 본 것은 저장해 두고 다음부터 바로 열어요
// - 글꼴·스타일(CDN): 저장본을 먼저 쓰고 뒤에서 새로 받아 둬요
const VER = 'v6';
const APP = 'hp-app-' + VER, IMG = 'hp-img', API = 'hp-api', CDN = 'hp-cdn';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const LIMIT = { [IMG]: 2500, [API]: 1200, [CDN]: 80 };

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('hp-app-') && k !== APP).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function trim(name) {
  const c = await caches.open(name), ks = await c.keys(), over = ks.length - LIMIT[name];
  for (let i = 0; i < over; i++) await c.delete(ks[i]);
}
async function cacheFirst(req, name) {
  const c = await caches.open(name), hit = await c.match(req);
  // 그냥 본 그림(opaque)은 색칠 · 사진처럼 그림을 읽어야 하는 곳(cors)에 줄 수 없어요. 그때는 새로 받아 바꿔 둬요
  if (hit && !(req.mode === 'cors' && hit.type === 'opaque')) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trim(name); }
  return res;
}
async function staleWhileRevalidate(req, name) {
  const c = await caches.open(name), hit = await c.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trim(name); } return res; }).catch(() => hit);
  return hit || net;
}
async function networkFirst(req) {
  const c = await caches.open(APP);
  try {
    const res = await fetch(req);
    if (res.ok) c.put(req.mode === 'navigate' ? './index.html' : req, res.clone());
    return res;
  } catch (e) {
    return (await c.match(req, { ignoreSearch: true })) || (await c.match('./index.html'));
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (req.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/')) e.respondWith(networkFirst(req));
    else if (u.pathname.includes('/ow/')) e.respondWith(cacheFirst(req, IMG));   // 마을 포켓몬 걷기 그림
    else e.respondWith(caches.match(req).then(h => h || fetch(req)));
    return;
  }
  if (u.hostname === 'raw.githubusercontent.com' || u.hostname === 'play.pokemonshowdown.com') e.respondWith(cacheFirst(req, IMG));
  else if (u.hostname === 'pokeapi.co') e.respondWith(cacheFirst(req, API));
  else if (/(^|\.)(tailwindcss\.com|googleapis\.com|gstatic\.com|cloudflare\.com|jsdelivr\.net)$/.test(u.hostname)) e.respondWith(staleWhileRevalidate(req, CDN));
});
