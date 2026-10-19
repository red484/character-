# 2D 모션 공방 — 커스텀 확장 검수판

기존 승인 스프라이트를 입력으로 유지한다. 원본 선택에서는 파츠 렌더러를 통과시키지 않아 기존 픽셀을 그대로 출력한다. 공개 서비스 배포는 하지 않았다.

## 들어가는 곳

`http://127.0.0.1:8766/ppolpet/docs/maker-2d.html?character=starlight&motion=walk`

- 귀: 원본 / 고양이 / 둥근 / 짧은 토끼 / 접힌 귀
- 꼬리: 원본 / 둥근 / 말린 / 구름 꼬리. 새 귀·꼬리·소품 색을 몸색과 별도로 지정.
- 좌우 눈: 원본 / 링 / 동그란 / 웃는 / 감은 / 하트. 좌우 색, 크기, 간격, 높이.
- 머리 장식: 리본 / 꽃 / 별. 좌우 위치와 크기, 위치 미세 조절.
- 목 나비넥타이와 등 날개.
- 여섯 캐릭터의 몸색·장식색·분홍 부위 색상, 원래 명암 유지.
- 기존 귀·꼬리·몸 비율 조절, 승인된 기본 동작 재생.
- 되돌리기 / 다시 적용 / 파츠 원본 복원.
- 설정 저장·불러오기, v4 JSON 내보내기·가져오기, 현재 PNG 다운로드.

## 파일

- `part-landmarks.mjs`: 프레임의 머리·눈·몸 위치 측정.
- `parts-renderer.mjs`: 선택 부위의 원래 흔적 처리와 새 파츠 합성. 원본 이미지 파일은 수정하지 않는다.
- `parts-schema.mjs`: 허용 옵션, 조절 범위, 설정 정규화.
- `custom-schema.mjs`: 설정 v4. 기존 v2/v3를 원본 파츠로 마이그레이션.
- `assets/custom-parts-v1.png`: imagegen으로 새로 만든 투명 파츠 이미지.
- `assets/generation-prompt.txt`: 사용한 생성 프롬프트.
- `assets/parts-atlas.json`: 원본 이미지 안의 각 파츠 경계. 이미지는 다시 자르거나 덮어쓰지 않는다.

## 검수 범위와 한계

여섯 캐릭터 53개 동작의 처음·중간·마지막 프레임에서 원본 기본값 픽셀 일치와 새 파츠 적용을 검사한다. 검수판은 실제 캔버스 출력이다. 자동 검사는 귀여움이나 모든 선택 조합의 최종 승인을 의미하지 않는다.

입력 스프라이트에는 이미 얼굴과 귀가 합쳐져 있다. 따라서 새 파츠 선택 시 국소 배경 복원과 가림 처리가 필요하며, 측면·엎드리기처럼 많이 가려진 자세에서는 경계 품질을 추가로 검수해야 한다. 눈 모양을 새로 고르면 그 모양이 원본 표정보다 우선한다. 좌우 눈 선택은 화면 기준이며, 가려진 눈은 새로 만들지 않는다. 원래 모자·리본은 별도 삭제 기능이 없다.

이 설정 JSON은 이 공방에서 사용하는 데이터이며 데스크톱 시메지 실행 파일이 아니다. 기존 3D 공방 저장 키와 모델은 변경하지 않는다.

## 테스트

```
node work/ppolpet-2d-workshop/custom-schema.test.mjs
node work/ppolpet-2d-workshop/palette.test.mjs
node work/ppolpet-2d-workshop/parts-schema.test.mjs
node work/ppolpet/tests/behavior.test.js
node work/ppolpet/build-web.js
```

백업: `releases/customization-before-parts-20261019/ppolpet-2d-workshop/`
