import fs from 'node:fs/promises';
import {head} from './render.mjs';
import {platformHeader} from './platform.mjs';
const header=()=>platformHeader().replace(/href="#([^"]+)"/g,(_,id)=>`href="${id==='bank'?'bank.html':id==='mistakes'?'mistakes.html':'index.html#'+id}"`);
export async function buildClassSummary(){
 await fs.writeFile('dist/class-summary.html',head('반 결과 모아 보기 | 공간을 읽는 기하 2.0','<link rel="stylesheet" href="platform.css"><link rel="stylesheet" href="bank.css"><link rel="stylesheet" href="exam.css">')
 +`<body><a class="skip" href="#main">본문으로 건너뛰기</a>${header()}<main id="main" class="section-wrap class-page"><p class="eyebrow">FOR TEACHERS · CLASS SUMMARY</p><h1>이름 없이,<br>반 전체의 오답 경향 보기.</h1>
<p class="lead">학생이 "나의 시험 준비"에서 복사한 결과 요약 코드를 모아 붙여넣으면, 유형별 남은 오답과 틀린 이유를 한눈에 볼 수 있어요.</p>
<details class="class-howto"><summary>구글 폼으로 코드 모으는 방법</summary><ol><li>구글 폼을 새로 만들고 <b>단답형 질문 하나</b>("결과 요약 코드")만 둡니다. 이름·학번 질문은 넣지 않습니다.</li><li>폼 설정에서 <b>이메일 주소 수집을 끄고</b>, 응답을 1회로 제한하지 않습니다(로그인을 요구하지 않기 위해서).</li><li>학생에게 폼 링크를 안내합니다. 학생은 "나의 시험 준비 → 선생님께 결과 요약 코드 내기"에서 코드를 복사해 붙여넣습니다.</li><li>응답 시트에서 코드 열을 통째로 복사해 아래 칸에 붙여넣습니다. 다른 글자가 섞여 있어도 코드만 골라 읽어요.</li></ol><p class="work-help">코드에는 단원별 준비도, 준비 단계, 유형별 남은 오답 수, 틀린 이유 개수, 졸업 수, 변형 연습 완료 유형, 작성 주차만 들어 있어요. 이름·학번·입력한 답·정확한 날짜는 없습니다. 붙여넣은 내용은 이 브라우저에서만 계산하고 어디에도 보내지 않아요.</p></details>
<label class="class-input">결과 요약 코드 붙여넣기<textarea id="class-codes" rows="7" placeholder="GEO1-…-a1b2 형식의 코드를 여러 줄로 붙여넣으세요."></textarea></label><div class="class-actions"><button type="button" class="small-button" id="class-run">모아 보기</button><button type="button" class="small-button" id="class-csv" disabled>유형별 표 CSV로 저장</button><button type="button" class="small-button" id="class-clear">지우기</button></div><p id="class-status" role="status"></p>
<section id="class-result" aria-live="polite"></section></main>
<footer><b>공간을 읽는 기하 2.0</b><span>창작 학습 자료 · 개인정보 수집 없음</span><a href="index.html">메인으로</a></footer><script src="bank.js" defer></script><script type="module" src="class-summary.js"></script></body></html>`);
}
