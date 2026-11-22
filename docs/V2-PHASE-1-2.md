# 공간을 읽는 기하 2.0 — 1·2단계 개발 결과

작성일: 2026-11-22 (한국 시간)
기준 main: 599f87fcce04d9150676b2ae082f35b1c0b21b41
개발 브랜치: develop-v2. main 병합 및 Pages 배포는 수행하지 않음.

## 기존 구조와 기능 분석

| 파일/영역 | 역할과 유지 여부 |
| --- | --- |
| content/course.mjs | 2차시, 20문항, 힌트·정답·풀이·오개념·채점 기준·검산값의 단일 원본. 수정 없음 |
| content/standards.json | 기존 7개 성취기준 원문·출처 스냅샷. 수정 없음 |
| public/app.js | localStorage 자기 점검, 초기화, 인쇄, 공간/내적 SVG 조작. 유지하고 메뉴 동작 추가 |
| public/style.css | 기존 복습 화면 스타일. 수정 없음 |
| scripts/build.mjs | 정적 HTML, 로컬 글꼴·KaTeX·PDF 복사. 플랫폼 렌더러 연결 |
| scripts/render.mjs | 한글 문서 head, 이스케이프, KaTeX 수식 변환. 수정 없음 |
| scripts/pdf.mjs | Chromium 인쇄 및 pdf-lib 합본, 7개 PDF 생성. 수정 없음 |
| scripts/verify.mjs | 독립 검산·기능·반응형·PDF 40쪽 렌더링. 유지하고 모듈·메뉴·320px 검사 추가 |
| scripts/browser.mjs | Windows Chrome/Edge 및 CI Chromium 선택. 수정 없음 |
| scripts/serve.mjs | 정적 개발 서버. 수정 없음 |
| scripts/inspect.mjs | 기존 화면 추가 검수. 수정 없음 |
| scripts/deploy.mjs | 신규 저장소 배포 보조. 수정 없음, 이번 작업에서 실행하지 않음 |
| .github/workflows/pages.yml | main 빌드→PDF→테스트→Pages 배포. 수정 없음 |
| package.json, package-lock.json | 기존 명령과 의존성. 수정 없음 |
| output/pdf/ | 기존 7종 산출물. 명령 실행으로 재생성 |
| README.md, VALIDATION.md, .gitignore | 기존 안내·검수 기록·제외 규칙. README에 v2 안내 추가 |

기존 방식은 서버와 로그인 없이 동작하는 단일 정적 페이지다. 기존 체크는 풀이 완료에 대한 자기 점검이며 자동 채점이 아니다. 해설 PDF는 공개 자료다. 실제 학교 기출·학생 자료를 추가하지 않았다.

## 이번 구현

- 네이비·화이트 플랫폼 메인 및 7개 공통 메뉴. 이차곡선 보라, 벡터 파랑, 공간도형 청록.
- 단원 카드, 실험실 입구, 문제은행·나의 학습·오답노트 안내, 교사용 자료실, 기말 복습 진입.
- 신규 개념 콘텐츠·Three.js·자동 채점·통계·오답 저장·맞춤 PDF는 준비 중이라고 표시.
- 기존 20문항/2차시/단계별 힌트/해설/자기 점검/SVG 2종/PDF 7종 유지.
- 모바일 접이식 메뉴, aria-expanded, Escape 닫기, 키보드 초점, JavaScript 미사용 시 메뉴 노출.
- 긴 수식은 좁은 화면에서 수식 영역만 가로 스크롤해 원문을 보존.
- 추가 외부 요청·분석 도구·개인정보 입력·로그인·서버 저장 없음. 기존 localStorage 키 유지.
- 상대 파일 경로와 해시 이동 사용. 서버 재작성 규칙 없이 저장소 하위 경로에서 동작.

## 추가·변경 파일

신규: content/platform.mjs, content/units/conics.mjs, content/units/vectors.mjs, content/units/space.mjs, scripts/platform.mjs, public/platform.css, .github/workflows/validate.yml, docs/V2-PHASE-1-2.md.
변경: scripts/build.mjs, scripts/verify.mjs, public/app.js, README.md, output/pdf/*.pdf (7개 재생성).

플랫폼 CSS는 웹 빌드에서만 로드한다. PDF용 공통 렌더러와 인쇄 CSS는 변경하지 않아 인쇄 레이아웃에 플랫폼 스타일이 섞이지 않는다.

## 확장 계약

content/platform.mjs가 메뉴와 단원 레지스트리를 제공하고, 각 단원은 id/title/color/description/topics/concepts/labs/questionIds/status를 가진다.
- id는 영구 식별자(conics/vectors/space). 제목이나 메뉴 순서와 무관하게 유지한다.
- questionIds는 기존 course.mjs 문항을 참조한다. 본문 복제 없이 원본과 검산의 일치를 유지한다. 이번 매핑은 대표 단원 분류이며 공식 성취기준 매핑을 대체하지 않는다.
- concepts는 다음 단계에서 검증된 개념 ID를 연결할 빈 배열이다. topics는 학습 구조 초안이며 공식 성취기준 원문이라고 표시하지 않는다.
- labs는 id/href/engine/status 계약. 현재 engine=svg인 기존 탐구만 available이다.
- 향후 engine=three 모듈은 실험실 진입 시 동적 import하고 mount(container, context), dispose() 생명주기를 갖도록 구현한다. context는 unitId/conceptIds/questionIds만 전달하며 개인정보를 받지 않는다. 현재 Three.js 런타임이나 어댑터 구현은 없다.
- 단원 status=planned/partial은 단원 콘텐츠 준비 수준이다. 화면에는 사용 가능한 기존 복습과 준비 중인 신규 기능을 각각 안내한다.

## 검증 결과

Windows / Node.js v26.13.1 / 설치된 Chromium 계열 브라우저에서 실행.

| 명령 | 결과 |
| --- | --- |
| npm ci | 성공, 14개 패키지 감사에서 취약점 0개 |
| npm run build | 성공, 20문항 정적 사이트 생성 |
| npm run pdf | 성공, 7종 PDF 생성 |
| npm test | 성공, 아래 9개 검증 묶음 통과 |

1. 20문항 독립 수치 검산 및 직선·평면 조건 대입.
2. 7개 성취기준 연결, 차시별 필수 8+도전 2, 50분 구성.
3. 단원 모듈 3개 및 기존 20문항 ID 연결.
4. PDF 7개, 총 40쪽, A4 규격.
5. 1440/768/390/320px 화면과 수식 렌더링, 가로 넘침 검사.
6. 메뉴 7개, 모바일 열기/닫기/Escape, JavaScript 없는 메뉴.
7. 단계별 힌트·해설·저장/재접속·초기화·공간/내적 조작.
8. /dist/ 하위 경로의 모든 내부 이동 및 PDF HTTP 응답.
9. PDF 전체 40쪽 렌더링·한글 추출·문항 번호 대조·브라우저 오류 없음.

초기 실행에서 네트워크 제한(의존성 설치·localhost 테스트)이 있어 권한을 적용해 재실행했다. 추가한 320px 검사에서 수식의 최소 폭 문제가 발견되어 수식 스크롤을 적용한 뒤 전체 검사를 통과했다. PDF 생성기는 페이지 내용 넘침도 검사한다. 모바일 화면과 대표 PDF 접촉 시트를 눈으로 확인했으며 모든 PDF 페이지의 개별 정밀 육안 검수를 완료했다는 의미는 아니다.

검증 파일: output/qa/verification.json, site-*.png, *-contact.png, PDF 텍스트 추출 결과. QA 산출물은 기존 .gitignore로 공개 저장소에서 제외한다. develop-v2의 새 CI는 검증만 실행하고 배포 권한이 없다. GitHub 저장소 설정의 branch protection 규칙은 변경하지 않았다. main을 별도 브랜치로 보존하고 병합하지 않는 방식으로 보호했다.

## 검토 방법과 다음 단계

npm ci → npm run build → npm run pdf → npm test → npm run serve 후 http://127.0.0.1:4173 접속.
메인과 단원 카드, 모바일 메뉴를 확인하고 기말 복습에서 문제·힌트·시각화·PDF를 확인한다.

사용자 검토 후 진행할 순서:
1. 2022 개정 공식 성취기준을 단원별로 다시 확인하고 개념 설명·예시·오개념·출처를 작성한다.
2. 이차곡선 2D 탐구와 Three.js 공간 실험실을 구현하고 수학적 불변량·접근성·WebGL 미지원 대안을 검증한다.
3. 문제 스키마, 수준별 검색, 동치 답안 채점, 단계형 힌트 및 문항 독립 검산을 확장한다.
4. 개인정보 없이 브라우저 로컬 학습 상태·오답노트를 구현하고 삭제·내보내기 정책을 정한다.
5. 기존 PDF 생성기를 재사용해 맞춤형 문항 구성과 해설 출력을 구현한다.

이번 단계에는 위 신규 학습 기능을 구현하거나 작동하는 것처럼 표시하지 않았다. main 병합과 실제 Pages 반영은 사용자 검토 이후 별도 진행한다.
