별빛냥 · 중복 코 제거 검수
URL: http://127.0.0.1:8766/starlight-look/
현재 이미지: assets/look-v9-single-nose.png (1774×887 RGBA)

v8에는 외곽 코와 얼굴 안쪽 노란 점이 함께 남아 있었음.
이전 제거 완료 기록은 잘못된 검수였으며 before-single-nose-fix/에 보존함.
v9는 안쪽 노란 점을 제거하고 얼굴 외곽의 작은 코만 남김.
사용 중인 네 고유 자세 모두 코 영역의 노란 연결 요소가 2개에서 1개로 감소.
브라우저 전후 확대에서도 단일 코 확인. 4개 자세를 정·역순 8단계로 재생.

이미지 제작: imagegen 스킬 내장 이미지 편집, v8 참조 국소 수정.
프롬프트: prompts/look-remove-inner-nose.txt
이미지 생성 편집으로 원본의 픽셀 동일성은 보장하지 않음.
모션 타이밍과 팔 경로 코드는 유지. 다른 승인 모션143개 파일 해시 동일.

비교: 왼쪽 v8 / 오른쪽 v9. 확대 영역도 현재 프레임과 동기화.
이전 코드·설정: before-single-nose-fix/. 모든 기존 PNG 보존.
검수: verification.json / single-nose-preview.png
상태: 사용자 검수 대기. 공방·Three.js·다른 캐릭터 변경 없음.
