import fs from 'node:fs/promises';
import {bankQuestions} from '../content/bank.mjs';
import {questions} from '../content/course.mjs';
import {labs} from '../content/labs.mjs';
import {units} from '../content/platform.mjs';
import {head,esc,rich} from './render.mjs';
import {platformHeader} from './platform.mjs';
const header=()=>platformHeader().replace(/href="#([^"]+)"/g,(_,id)=>`href="${id==='bank'?'bank.html':id==='mistakes'?'mistakes.html':'index.html#'+id}"`);
const unitOf=id=>units.find(u=>u.questionIds.includes(id))?.id||'space';
const titleOf=id=>units.find(u=>u.id===id)?.title||'';
// 오답노트가 보여 줄 모든 문항: 문제은행 60, 기존 복습 20, 실험 확인 문제 8
export function mistakeItems(){
 const items=[];
 for(const q of bankQuestions)items.push({id:q.id,source:'bank',unit:q.unit,stage:q.stage,title:q.title,href:`practice-${q.id}.html`,opts:q.checks.map(f=>f.type==='choice'?f.options:null),prompt:rich(q.prompt),answer:rich(q.answer),solution:rich(q.solution),misconception:rich(q.misconception)});
 for(const q of questions)items.push({id:q.id,source:'review',unit:unitOf(q.id),stage:q.stage,title:q.title,href:`index.html#q-${q.id}`,opts:[],prompt:rich(q.prompt),answer:rich(q.answer),solution:rich(q.solution),misconception:rich(q.misconception)});
 for(const l of labs)items.push({id:'lab-'+l.id,source:'lab',unit:l.unit,stage:'실험',title:l.title+' (실험 확인 문제)',href:`lab-${l.id}.html`,opts:l.checks.map(f=>f.type==='choice'?f.options:null),prompt:`<ol>${l.checks.map(f=>`<li>${rich(f.label)}</li>`).join('')}</ol>`,answer:`<ol>${l.checks.map(f=>`<li>${f.type==='choice'?esc(f.options[f.answer]):esc(f.answer)}</li>`).join('')}</ol>`,solution:rich(l.facts),misconception:''});
 return items;
}
export async function buildMistakes(){
 const items=mistakeItems();
 const meta=items.map(({prompt,answer,solution,misconception,...m})=>({...m,unitTitle:titleOf(m.unit)}));
 const templates=items.map(i=>`<template id="tpl-${esc(i.id)}"><div class="m-prompt">${i.prompt}</div><div class="m-answer">${i.answer}</div><div class="m-solution">${i.solution}</div><div class="m-mis">${i.misconception}</div></template>`).join('');
 const html=head('오답노트 | 공간을 읽는 기하 2.0','<link rel="stylesheet" href="platform.css"><link rel="stylesheet" href="bank.css"><link rel="stylesheet" href="mistakes.css"><link rel="stylesheet" href="exam.css">')
 +`<body><a class="skip" href="#main">본문으로 건너뛰기</a>${header()}<main id="main" class="section-wrap mistakes-page">
<div class="m-print-head" aria-hidden="true"><h1>기하 오답노트</h1><p id="m-print-who"></p><p id="m-print-meta"></p></div>
<p class="eyebrow">MISTAKE NOTEBOOK</p><h1>틀린 문제가<br>내 것이 되는 오답노트.</h1>
<p class="lead">채점에서 틀린 문제는 자동으로 여기에 모여요. <b>① 틀린 이유 고르기 → ② 다짐 한 줄 쓰기 → ③ 다른 날 다시 풀어 맞히기</b>를 하면 졸업합니다.</p>
<p class="notice">기록은 이 브라우저에만 저장되며 서버로 보내지 않습니다. 기기를 바꾸거나 브라우저 데이터를 지우면 사라질 수 있으니, 제출하거나 보관하려면 아래에서 인쇄하거나 PDF로 저장하세요.</p>
<section class="m-summary" aria-label="오답 현황"><div class="m-stats" id="m-stats"></div><div class="m-reasons" id="m-reasons"></div></section>
<form class="m-filters" role="search"><label>보기<select name="status"><option value="open">남은 오답</option><option value="graduated">졸업한 문제</option><option value="all">전체</option></select></label><label>단원<select name="unit"><option value="">전체 단원</option>${units.map(u=>`<option value="${u.id}">${u.title}</option>`).join('')}</select></label></form>
<p id="m-count" role="status"></p>
<section id="m-list" class="m-list" aria-label="오답 목록"></section>
<div id="m-empty" class="m-empty" hidden><p><b>아직 오답노트가 비어 있어요.</b></p><p><a href="bank.html">문제은행</a>이나 <a href="index.html#labs">실험실</a>에서 문제를 풀고 채점해 보세요. 틀린 문제는 자동으로 여기에 담겨요. 기말고사 집중 복습 문제는 문제 아래 "오답노트에 추가" 버튼으로 담을 수 있어요.</p></div>
<section class="m-backup" id="m-backup" aria-label="학습 기록 내보내기와 불러오기"></section><section class="m-print" aria-labelledby="m-print-title"><h2 id="m-print-title">제출용 인쇄 · PDF 저장</h2><p class="work-help">아래 칸은 인쇄할 때만 쓰이고 저장되지 않아요. 인쇄 창에서 "PDF로 저장"을 고르면 파일로 저장할 수 있어요.</p>
<div class="m-print-fields"><label>학년<input name="grade" maxlength="4" autocomplete="off"></label><label>반<input name="class" maxlength="4" autocomplete="off"></label><label>번호<input name="no" maxlength="4" autocomplete="off"></label><label>이름<input name="name" maxlength="20" autocomplete="off"></label></div>
<label class="lab-toggle"><input type="checkbox" id="m-print-solution" checked> 정답과 해설 함께 인쇄</label><button type="button" id="m-print" class="small-button">지금 보이는 목록 인쇄 · PDF 저장</button><p id="m-print-status" role="status"></p></section>
</main><footer><b>공간을 읽는 기하 2.0</b><span>창작 학습 자료 · 개인정보 수집 없음</span><a href="index.html">메인으로</a></footer>
<script type="application/json" id="m-items">${JSON.stringify(meta).replace(/</g,'\\u003c')}</script>${templates}
<script src="mistakes.js" defer></script><script src="backup.js" defer></script><script src="bank.js" defer></script><script src="mistakes-page.js" defer></script></body></html>`;
 await fs.writeFile('dist/mistakes.html',html);
}
