2026-10-19 · 공방 2D 부위 조절 연결 (내부 검수)

진입: /ppolpet/docs/index.html → 상단 '2D 모션 공방' 링크
직접: /ppolpet/docs/maker-2d.html
원본 검수: /ppolpet-2d-workshop/

이번 연결
- 기존 공방 build-web.js 재실행으로 오래된 SRI 해시 불일치 복구.
- 기존 Three.js renderer 소스/얼굴/모델을 수정하지 않았다.
- 공방에서 opt-in 2D 페이지로 진입. 기본 3D 경로와 .ppol 저장 호환 유지.
- 여섯 캐릭터, 53개 캐릭터·동작 조합이 같은 shape 설정을 사용.
- 귀 길이 85~120%, 귀 너비 90~110%, 꼬리 길이 80~120%,
  꼬리 올리기 ±8px, 몸 길이/너비 90~110%.
- 100% 기본값은 원본 캔버스 직접 사용. 새 캐릭터 이미지 재생성 없음.
- 변경 시 2D 연속 메시 변형; 얼굴 영역은 비율을 유지하고 몸통과 부위만 보정.
- 엎드림은 얼굴 앞부분을 고정하고 뒤쪽 몸통/꼬리를 조절.
- 원본 가림 관계를 유지하며 가려진 파츠를 새로 그리지 않는다.
- 캐릭터의 종류를 바꾸는 부품 교체(토끼 귀, 날개, 새 꼬리 종류)는 미구현.
  현재 기능은 기존 부위의 치수/위치 조절이다. 무제한 체형 범위도 아니다.

저장
- 별도 localStorage 키 ppolpet-sprite-workshop-v2.
- 버전 2 JSON 포맷 ppolpet-sprite-custom. 저장/복원 및 설정 파일 입출력.
- 기존 3D .ppol을 덮어쓰거나 2D 파일로 오인해서 읽지 않는다.
- PNG는 현재 모습. JSON은 이 공방에서 다시 여는 설정 파일이며
  데스크톱 시메지 앱 설치 파일/동작 패키지가 아니다.

구현
- 원본 페이지의 재생기를 iframe으로 재사용하여 승인 프레임/모션을 보존한다.
- 최초 로드 시 원본의 투명도 연결 영역으로 부위 기준을 계산하고 프레임별 캐시.
- 별도 효과/후광은 가장 큰 연결 영역에서 제외.
- custom-schema.mjs: 범위 검증, 저장 스키마, 순수 변형 수식.
- deform.mjs: 연속 2D 메시, 기본값은 변형 경로를 우회.
- app.mjs: 공통 모션/설정/비교 및 브라우저 검수.
- build-web.js가 maker-2d.html을 생성. 모션 원본은 work의 기존 검수 폴더에
  의존하므로 공개 배포용 독립 번들 작업은 별도다. 공개 배포하지 않았다.

검증
- node work/ppolpet/build-web.js
- node work/ppolpet/tests/behavior.test.js
- node work/ppolpet-2d-workshop/custom-schema.test.mjs
- 브라우저 '여섯 친구 · 전체 모션 재생 검사' 및 설정 입출력 수동 검수.
- verification.json: 재생, 기본값 비교, 각 조절 항목의 픽셀 변화 기록.
- geometry-verification.json: 53개 관측 자세 x 64 극단 조합에서
  메시 뒤집힘, 보호 얼굴 폭/높이, 접지 기준점 검사. 전체 아트 품질 승인은 아님.
- 그림의 귀여움/모션 자연스러움은 최종 사용자 검수가 필요하다.

복구
releases/ppolpet-before-2d-workshop-20261019.zip
기존 ppolpet 프로젝트와 이전 preserved-motion-lab 전체 백업.

걷기 재검수 — 별빛냥 기준 적용 (2026-10-19)
- 작은 보폭 메시 보정 후보는 재생 경로에서 제외.
- 별빛냥 after.png의 4자세를 기준으로 다른 다섯 종의 새 2x2 PNG 제작.
- 실제 PNG가 바뀌며 팔 뒤/아래/앞/아래 및 다리 접촉/통과 자세를 재생.
- 별빛냥과 같은 8개 시간 슬롯, 실제 그림은 4장. 총 1.04초.
- 원본 PNG는 보존. 공방의 체크 해제로 이전 8장 걷기와 비교.
- ../ppolpet-walk-transfer/ 에 여섯 친구 동기화 반복 재생 제공.
- 각 새 시트 전체에 단일 균일 배율 사용. 머리 수평 중심과 발 접지를 정렬.
- image_gen 내장 도구 사용; 프롬프트/참조 경로: walk-review/transfer-prompts.json.
- 새 에셋: ../ppolpet-cast-review/assets/<character>/walk-starlight-v1.png.
- 복구용 재생기/매니페스트: walk-review/before-transfer/.
- 외형은 동일 원화 픽셀 복사가 아니라 원래 캐릭터를 참조한 새 걷기 원화이므로
  세부 장식과 프레임간 미세한 차이는 사용자 최종 검수 대상.
- 앉기/엎드리기/표정 원화는 이번 수정에서 변경하지 않음.
