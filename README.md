# Bound Mission

> Make the finish visible.

Bound Mission은 막연한 일을 선명한 끝점과 작은 다음 행동으로 바꾸는 프로젝트 플래너입니다. 코디세이 A1-3 미션 제출을 위해 만든 비상업적 학습 프로토타입이며, 실제 사용 중인 Bound와 데이터·배포 환경을 완전히 분리했습니다.

## 문제와 배경

첫 프로젝트 `Away`를 만들면서 기능이 존재하는 것만으로는 실제 생활에서 계속 쓰고 싶은 제품이 되지 않는다는 의문이 생겼습니다. 그래서 완성도 높은 상용 앱의 정보 구조와 상호작용을 관찰하고, 사용자가 부담 없이 다음 행동을 고르게 만드는 원리를 분석했습니다.

Bound는 이 학습을 바탕으로 할 일 관리 흐름을 독자적인 시각 언어로 다시 만들고, 여기에 프로젝트의 성공을 정의하는 네 가지 프레임을 더했습니다.

- **Metric Goal**: 관찰 가능한 수치로 표현한 완료 기준
- **Desired Response**: 결과를 경험한 사람이 보일 반응
- **Hurdle**: 목표를 가장 직접적으로 가로막는 장애물
- **Boundary**: 해결 방향을 선명하게 만드는 실천적 경계

## 주요 기능

- **Today**: 오늘의 행동 확인, 추가, 완료, 삭제와 진행률 표시
- **Thoughts**: 정리 전 생각을 빠르게 보관하고 AI Frame 입력으로 연결
- **Projects**: 샘플 프로젝트별 목표·반응·허들·바운더리 비교
- **AI Frame**: 프로젝트 맥락을 입력하면 AI가 구조화된 프로젝트 프레임과 첫 행동을 제안
- **샘플 프레임**: 호출 한도나 네트워크 문제 중에도 가상 데이터로 전체 흐름을 안전하게 시연
- **연결된 실행 흐름**: AI 초안을 Project로 저장하고, 선택한 첫 행동을 Today로 바로 이동
- **About**: Away에서 Bound로 전환한 과정과 학습 내용을 소개
- **로컬 저장**: Today에서 수정한 샘플 데이터는 현재 브라우저에만 저장
- **실패 대응**: 빈 입력, 서버 오류, 요청 과다, 연결 실패, 시간 초과를 사용자에게 설명하고 입력은 유지

## 기술 구성

| 영역 | 사용 기술 |
| --- | --- |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python Vercel Serverless Function |
| AI | Gemini Interactions API, Structured Outputs |
| Validation | Pydantic |
| Persistence | Browser `localStorage` |
| Deployment | Vercel |

React, Vue 등의 프런트엔드 프레임워크는 사용하지 않았습니다. 브라우저는 같은 출처의 `POST /api/frame`을 호출하며 API 키는 서버 환경변수로만 관리합니다.

## 폴더 구조

```text
bound-mission/
├─ api/frame.py
├─ css/styles.css
├─ dev_server.py
├─ docs/
├─ js/app.js
├─ index.html
├─ requirements.txt
└─ vercel.json
```

## 로컬 실행

먼저 가상환경을 만들고 필요한 패키지를 설치합니다.

```bash
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

`.env.example`을 복사해 `.env.local`을 만들고 자신의 API 키를 넣은 뒤 로컬 개발 서버를 실행합니다.

```bash
copy .env.example .env.local
.venv\Scripts\python dev_server.py
```

그 뒤 `http://127.0.0.1:4173`에 접속합니다. `python -m http.server` 같은 정적 서버는 화면만 제공하므로 AI Frame은 작동하지 않습니다. Vercel CLI가 설치되어 있다면 `vercel dev`를 사용해도 됩니다.

## 환경변수

`.env.example`을 참고해 로컬 또는 Vercel 프로젝트에 다음 값을 설정합니다.

```text
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
```

`GEMINI_API_KEY`는 필수입니다. 실제 키가 들어 있는 `.env` 계열 파일은 Git에서 제외됩니다. 모델은 배포 환경에서 사용할 수 있는 Structured Outputs 지원 Gemini 모델로 변경할 수 있습니다.

## Vercel 배포

1. 이 폴더를 별도 GitHub 저장소에 올립니다.
2. Vercel에서 저장소를 가져옵니다.
3. Framework Preset은 `Other`, Root Directory는 저장소 루트로 둡니다.
4. `GEMINI_API_KEY`와 선택적인 `GEMINI_MODEL` 환경변수를 등록합니다.
5. 배포 후 Thoughts·Today·Projects·AI Frame·About과 모바일 화면을 확인합니다.

**Live demo:** 배포 후 제출 URL을 여기에 기록합니다.

## 공개 범위와 데이터

- 저장소와 데모에는 가상 샘플 데이터만 포함합니다.
- Today에서 사용자가 만든 항목은 해당 브라우저의 `localStorage`에만 저장됩니다.
- AI 입력은 응답 생성을 위해 Google Gemini API로 전송되며, 이 서버 함수는 입력 내용을 로그로 남기지 않습니다.
- 개인정보, 비밀정보, 실제 업무자료를 AI Frame에 입력하지 않도록 화면에서 안내합니다.
- 실제 생활에서 사용하는 Bound의 소스, 데이터베이스 설정, 백업 파일은 이 저장소에 포함하지 않습니다.

## 학습 목적과 출처

Bound Mission은 교육·포트폴리오 목적의 독립 프로토타입입니다. 할 일 관리 UX를 학습하는 과정에서 Cultured Code의 Things를 참고했지만, Cultured Code와 제휴하거나 승인을 받은 제품이 아니며 Things의 코드·에셋·콘텐츠를 포함하지 않습니다.

Metric Goal, Desired Response, Hurdle, Boundary 프레이밍은 교육기획자 윤소정님의 유료 생각구독 콘텐츠에서 배운 개념을 바탕으로 재해석했습니다. 구독 콘텐츠의 제목이나 원문, 유료 자료는 공개하거나 복제하지 않았습니다.

자세한 공개 고지는 [NOTICE.md](NOTICE.md), 기획 내용은 [docs/SERVICE_PLAN.md](docs/SERVICE_PLAN.md), 완성도 향상 계획은 [docs/QUALITY_UPGRADE_PLAN.md](docs/QUALITY_UPGRADE_PLAN.md), 제출 전 확인 항목은 [docs/EVIDENCE_CHECKLIST.md](docs/EVIDENCE_CHECKLIST.md)에서 확인할 수 있습니다.

## License

이 저장소는 현재 학습 결과 검토를 위한 공개 열람용입니다. 별도의 라이선스를 부여하지 않았으므로 재사용·재배포 권한이 자동으로 허용되지 않습니다.
