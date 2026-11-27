# 공간을 읽는 기하

제천여자고등학교 학생을 위한 **2022 개정 기하 기말 대비 50분 × 2차시 복습** 자료입니다. 개인 기기로 개념·시각화·힌트를 확인하고 종이 활동지에 풀이를 작성합니다.

## 수업 운영

| 차시 | 범위 | 활동 |
| --- | --- | --- |
| 1 | 공간좌표, 구의 방정식, 벡터 연산·위치벡터 | 거리와 내분점 → 가상 축제 공간의 이동·구면 판단 |
| 2 | 내적, 직선·평면·구의 벡터 표현 | 각과 수직 → 이동 경로와 평면, 지름으로 정하는 구 |

각 차시 도입 5분, 개념 8분, 기본 12분, 적용 15분, 오답 토의 5분, 출구 5분입니다. 필수 8문항과 선택 도전 2문항으로 구성합니다. 선택 도전은 필수 활동 시간에 포함하지 않습니다. 정사영은 도입 복습에만 사용합니다.

학습자료는 실제 학교 기출이나 공식 학교 사이트가 아닙니다. 시설·좌표·축제 공간은 가상 설정입니다. 학교 로고, 학생 개인정보, 실제 시설 자료를 사용하지 않습니다. 학년과 교과서의 실제 시험 범위는 담당 교사가 최종 확인해야 합니다.

## 실행

Node.js 22.13 이상을 사용합니다.

```sh
npm ci
npx playwright install chromium
npm run build
npm run pdf
npm test
npm run serve
```

`http://127.0.0.1:4173`을 엽니다. Windows에서는 설치된 Chrome 또는 Edge가 있으면 PDF 생성과 검증에 사용합니다. Linux CI는 Playwright Chromium을 사용합니다.

## 수정과 산출물

- `content/counts.mjs`: 화면에 보이는 모든 개수 계산. `public/backup.js`: 학습 기록 내보내기·불러오기. `public/summary.js`, `class-summary.html`: 이름 없는 결과 요약 코드와 반 결과 모아 보기. 자세한 내용은 docs/FEEDBACK-1127.md.
- `public/readiness.js`, `public/exam-ready.js`, `public/drill/`: 나의 시험 준비(게이지·예상 점수 범위·맞춤 복습)와 변형 문제 연습. 자세한 내용은 docs/EXAM-READY.md.
- `public/mistakes.js`, `public/mistakes-page.js`, `scripts/mistakes.mjs`: 오답노트(자동 수집·이유·졸업·인쇄). 자세한 내용은 docs/MISTAKES.md.
- `content/labs.mjs`, `public/labs/`: 기하 실험실 8개(공간·벡터, Three.js). 자세한 내용은 docs/LABS.md.
- `content/bank.mjs`: 문제은행 60문항과 자동 채점 칸. `public/answer.js`: 채점용 수식 해석기.
- `content/course.mjs`: 개념, 20문항, 단계별 힌트, 정답, 풀이, 오개념, 채점 기준, 검산값. 웹과 PDF의 공통 원본입니다.
- `content/standards.json`: MCP에서 조회한 성취기준 원문·출처 위치의 스냅샷입니다.
- `public/`: 화면 스타일과 브라우저 동작입니다. 수식은 빌드 시 KaTeX로 변환합니다.
- `scripts/build.mjs`: 정적 웹 생성. 글꼴·수식 자원을 로컬 자원으로 복사합니다.
- `scripts/pdf.mjs`: 동일 콘텐츠에서 A4 PDF 7개 생성. 수식과 한글의 웹/PDF 일치를 위해 Chromium 인쇄 엔진을 사용합니다.
- `scripts/verify.mjs`: 독립 수치 검산, 성취기준·분량 확인, 반응형·기능 확인, PDF 전 페이지 렌더링·텍스트 대조입니다.
- `dist/`: 공개 사이트. `output/pdf/`: 최종 PDF. `output/qa/`: 검수 이미지와 결과(공개 저장소에서 제외).

문항을 수정하면 정답·해설·힌트·독립 검산도 함께 수정하고 build → pdf → test를 실행하세요. PDF를 생성한 뒤 전체 페이지 렌더링 결과를 눈으로 확인해야 합니다. 브라우저 자동 점검만으로 수학 설명과 인쇄 품질을 모두 보장하지 않습니다.

## PDF 목록

| 파일 | 용도 | 쪽수 |
| --- | --- | --- |
| `lesson-1-concepts.pdf` | 1차시 개념 학습자료 | 2 |
| `lesson-1-worksheet.pdf` | 1차시 학생용 활동지 | 5 |
| `lesson-1-solutions.pdf` | 1차시 교사용 지도안과 해설 | 6 |
| `lesson-2-concepts.pdf` | 2차시 개념 학습자료 | 2 |
| `lesson-2-worksheet.pdf` | 2차시 학생용 활동지 | 5 |
| `lesson-2-solutions.pdf` | 2차시 교사용 지도안과 해설 | 6 |
| `student-complete.pdf` | 두 차시 학생용 개념+활동지 합본 | 14 |

학생용 합본에 해설은 포함하지 않습니다. 해설 PDF는 웹에서 누구나 내려받을 수 있습니다. 합본 내부의 쪽 번호는 차시별 개별 자료 번호를 유지합니다.

## GitHub Pages

새 공개 저장소의 기본 브랜치를 `main`으로 하고 Settings → Pages → Source를 GitHub Actions로 설정합니다. `.github/workflows/pages.yml`이 빌드·PDF 생성·검증을 통과한 결과만 배포합니다. 사이트와 PDF 링크는 상대 경로를 사용하므로 저장소 이름 하위 경로에서 작동합니다.

개인 완료 체크는 브라우저 localStorage에만 저장됩니다. 서버·로그인·점수 수집 기능은 없습니다. 체크는 정답 판정이 아닌 자기 점검입니다. 저장이 제한된 브라우저에서는 현재 화면에서만 사용합니다.

GitHub CLI 인증 후 `npm run deploy`를 실행하면 로그인 계정에 새 공개 저장소를 만들고 배포 워크플로를 시작합니다. 기존 `origin`이 있으면 덮어쓰지 않고 중단합니다. 저장소 이름이 이미 있으면 시간 접미사를 붙입니다. 이 명령은 성공한 로컬 검사 결과가 있어야 실행되며, 배포 후 Actions 성공 여부와 공개 URL의 다운로드를 별도로 확인해야 합니다.

## 근거와 이용 안내

교육부 고시 제2022-33호 [별책 8] 수학과 교육과정, 기하 PDF 165~166쪽. [korean-secondary-learning-map-mcp](https://github.com/raphysicst-create/korean-secondary-learning-map-mcp)의 `get_standard`, `get_topic`, `get_learning_roadmap`으로 확인했습니다. 범위: `12기하02-04~05`, `12기하03-01~05`.

MCP의 지도 관련 항목은 일반적인 관찰 증거·평가 관점이며, 상세 지도안·문제·단계별 발문은 자체 제작했습니다. 조회된 선수 관계에는 연결이 없었으므로 수업 순서는 공식 권장 순서가 아닌 본 자료의 설계입니다.

학습자료는 출처를 표시하여 수업에 활용할 수 있습니다. 외부 자원: Noto Sans KR(OFL), KaTeX(MIT). 각 라이선스는 배포 자원에 함께 제공합니다.

## 2.0 개발 브랜치

`develop-v2`에는 플랫폼 메인·7개 메뉴·단원 모듈 구조가 추가되어 있습니다. 기존 2차시·20문항·7종 PDF는 그대로 이용할 수 있습니다. 새 개념 학습·Three.js·문제은행 자동 채점·오답노트·맞춤 PDF는 준비 중입니다.

구조 분석, 변경 파일, 확장 계약, 검증 결과, 다음 단계는 [1·2단계 개발 보고서](docs/V2-PHASE-1-2.md)를 확인하세요. `validate.yml`은 개발 브랜치와 main 대상 PR을 검증만 하며 기존 Pages 배포 워크플로는 유지합니다. 검토 전 main에 병합하지 않습니다.

## 태블릿 손풀이 노트

`develop-v2`의 기존 20문항에서 손풀이·힌트·정답·해설 탭을 이용할 수 있습니다. 펜/마우스 필기, 지우개, 실행 취소, 문제별 기기 내 저장, PNG 내려받기를 제공합니다. 손가락 쓰기는 선택 기능이며 손글씨 자동 인식·채점은 하지 않습니다. 실제 태블릿 펜 사용성은 실기기 확인이 필요합니다. [구현·검증·저장 범위 안내](docs/HANDWRITING-NOTES.md)를 참고하세요.

## 단원별 문제은행

`bank.html`에서 새 창작 24문항을 단원·난이도·유형으로 고를 수 있습니다. 문항별 손풀이·힌트·정답·해설을 제공하며 자동 채점은 하지 않습니다. 기존 기말 복습 20문항과 PDF 7종은 유지합니다. 새 문항은 웹 전용이며 기존 PDF에 포함되지 않습니다. [자료 반영 범위·문항 구성·검증 안내](docs/QUESTION-BANK.md)를 확인하세요.
