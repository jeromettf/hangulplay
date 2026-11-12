# 한글 쏙쏙 작업 메모

- 가족끼리 쓰는 비상업용 앱입니다. 새 기능은 기존 기능에 영향이 없게 넣습니다.
- 새 친구 카드는 공부 활동(한글, 수학, 코딩, 위인 그림책)에서만 나옵니다(`RW_LEARN`). 그 밖의 놀이는 마을 선물 상자로 갑니다.
- 위인 그림책(jeromettf/history-edu)과 localStorage로 연결되어 있습니다. `index.html`의 `wbSync`, `wbItems`, 박물관 `txMuseum`의 "위인 전시실"이 그 부분입니다. 규칙은 history-edu 저장소의 `docs/BRIDGE.md`에 있고, 키 이름(`wiin_bridge_v1`, `pkmn_wiin_v1`)이나 모양을 바꾸면 두 저장소를 함께 고칩니다.
