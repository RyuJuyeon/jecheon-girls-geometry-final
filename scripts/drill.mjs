import fs from 'node:fs/promises';
import {bankQuestions} from '../content/bank.mjs';
import {head} from './render.mjs';
import {platformHeader} from './platform.mjs';
const header=()=>platformHeader().replace(/href="#([^"]+)"/g,(_,id)=>`href="${id==='bank'?'bank.html':id==='mistakes'?'mistakes.html':'index.html#'+id}"`);
export async function buildDrill(){
 const bank=bankQuestions.filter(q=>q.unit!=='conics').map(q=>({id:q.id,unit:q.unit,topic:q.topic,title:q.title}));
 await fs.writeFile('dist/drill.html',head('변형 문제 연습 | 공간을 읽는 기하 2.0','<link rel="stylesheet" href="platform.css"><link rel="stylesheet" href="bank.css"><link rel="stylesheet" href="exam.css">')
 +`<body><a class="skip" href="#main">본문으로 건너뛰기</a>${header()}<main id="main" class="section-wrap drill-page"><p class="eyebrow">VARIANT PRACTICE</p><h1>같은 유형,<br>새로운 숫자로 한 번 더.</h1><p class="lead">틀린 유형을 숫자만 바꾼 새 문제로 연습해요. 한 유형에서 3문제를 연속으로 맞히면 연습 완료예요.</p>
<div class="drill-bar"><label>문제 유형<select id="drill-type"></select></label><button type="button" id="drill-next" class="small-button">다음 변형 문제</button><a href="index.html#review">나의 시험 준비로 돌아가기</a></div><p id="drill-stats" class="drill-stats" role="status"></p>
<section id="drill-problem" aria-live="polite"><noscript><p>변형 문제는 JavaScript가 필요합니다.</p></noscript></section>
<p class="notice">변형 문제는 컴퓨터가 유형별 규칙에 따라 숫자를 바꿔 만든 연습 문제입니다. 연습 기록은 이 브라우저에만 저장되고, 준비도 계산에는 포함하지 않습니다.</p></main>
<footer><b>공간을 읽는 기하 2.0</b><span>창작 학습 자료 · 개인정보 수집 없음</span><a href="index.html">메인으로</a></footer>
<script type="application/json" id="drill-bank">${JSON.stringify(bank).replace(/</g,'\\u003c')}</script><script src="assets/katex/katex.min.js" defer></script><script src="answer.js" defer></script><script src="bank.js" defer></script><script type="module" src="drill/drill.js"></script></body></html>`);
}
