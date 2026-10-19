엎드리기 연결부 보정 후보

현재: assets/seam-repair-v1.png 전체 프레임 4×2 PNG. 각 셀 512×384, 화면에서는 등비 256×192로 표시. 머리 따로 이동 없음.
생성: built-in imagegen, prompts/seam-repair.txt, 편집 입력 assets/seam-edit-input.png. 원본과 완전 동일한 픽셀은 아니며 얼굴·명암은 검수 대상.
백업: before-seam-fix/에 직전 레이어 버전 보존. 초기 미세 모션은 before/. 기존 얼굴 시트는 assets/reference.png, 정지컷 assets/source-static.svg.
재생: 낮은 지지 자세에서 앞팔 접고 엎드림, 마지막 정지 유지. 반복 시 처음으로 리셋하며 일어나기 동작은 미구현.
빌드: python3 build-frames.py 는 PNG 아틀라스 좌표 규격만 재생성. 이전 조각 합성 빌더는 before-seam-fix/build-frames.py.
