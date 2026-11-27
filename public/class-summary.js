import {decode,extract} from './summary.js';
import {byId} from './drill/generators.js';
import {STAGES} from './readiness.js';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const UNIT={space:'공간도형과 공간좌표',vectors:'벡터'},REASON=['개념을 잘못 알았다','조건을 잘못 읽었다','계산 실수','풀이 방법을 떠올리지 못했다'];
let rows=[];
const bar=(n,max,label)=>`<div class="m-bar"><span>${label}</span><div class="m-bar-track"><div class="m-bar-fill" style="width:${max?n/max*100:0}%"></div></div><b>${n}</b></div>`;
function run(){
 const found=extract($('#class-codes').value),unique=[...new Set(found)],list=unique.map(decode),ok=list.filter(Boolean);
 const bad=list.length-ok.length,dup=found.length-unique.length;
 $('#class-status').textContent=found.length?`코드 ${ok.length}개를 읽었어요.${dup?` 똑같은 코드 ${dup}개는 한 번만 셌어요.`:''}${bad?` 손상되었거나 잘못된 코드 ${bad}개는 뺐어요.`:''}`:'붙여넣은 내용에서 결과 요약 코드를 찾지 못했어요.';
 if(!ok.length){$('#class-result').innerHTML='';$('#class-csv').disabled=true;window.classSummary={n:0};return}
 const n=ok.length,avg=u=>Math.round(ok.reduce((s,x)=>s+x.units[u].pct,0)/n),avgA=u=>(ok.reduce((s,x)=>s+x.units[u].attempted,0)/n).toFixed(1);
 const stages=[0,1,2,3,4].map(k=>ok.filter(x=>x.stage===k).length);
 const types={};for(const x of ok)for(const [t,c] of Object.entries(x.open)){types[t]??={students:0,total:0,done:0};types[t].students++;types[t].total+=c}
 for(const x of ok)for(const t of x.drillDone){types[t]??={students:0,total:0,done:0};types[t].done++}
 rows=Object.entries(types).filter(([t])=>byId[t]).sort((a,b)=>b[1].students-a[1].students||b[1].total-a[1].total);
 const reasons=[0,1,2,3].map(k=>ok.reduce((s,x)=>s+x.reasons[k],0)),maxR=Math.max(...reasons),maxS=Math.max(1,...rows.map(r=>r[1].students));
 const weeks=[...new Set(ok.map(x=>x.week).filter(Boolean))].sort();
 $('#class-result').innerHTML=`<div class="class-cards"><div class="m-stat"><b>${n}</b><span>제출한 코드</span></div>${['space','vectors'].map(u=>`<div class="m-stat"><b>${avg(u)}%</b><span>${UNIT[u]} 평균 준비도 · 평균 ${avgA(u)}문항 채점</span></div>`).join('')}<div class="m-stat warn"><b>${ok.reduce((s,x)=>s+Object.values(x.open).reduce((a,b)=>a+b,0),0)}</b><span>남은 오답 합계 · 졸업 ${ok.reduce((s,x)=>s+x.graduated,0)}</span></div></div>
<div class="class-grid"><section><h2>유형별 남은 오답</h2><p class="work-help">남은 오답이 있는 학생이 많은 유형부터 보여요. 수업에서 다시 다룰 유형을 고를 때 참고하세요.</p>${rows.length?`<table class="class-table"><thead><tr><th scope="col">유형</th><th scope="col">단원</th><th scope="col">학생 수</th><th scope="col">오답 수</th><th scope="col">변형 연습 완료</th></tr></thead><tbody>${rows.map(([t,v])=>`<tr><th scope="row"><a href="drill.html?type=${t}">${esc(byId[t].title)}</a></th><td>${UNIT[byId[t].unit]}</td><td><span class="class-meter" style="--w:${v.students/maxS*100}%">${v.students}</span></td><td>${v.total}</td><td>${v.done}</td></tr>`).join('')}</tbody></table>`:'<p>남은 오답이 없어요.</p>'}</section>
<section><h2>틀린 이유</h2>${maxR?reasons.map((c,k)=>bar(c,maxR,REASON[k])).join(''):'<p class="work-help">이유가 기록된 오답이 없어요.</p>'}<h2>준비 단계 분포</h2>${bar(stages[0],n,'아직 단계 없음 (문항 부족)')}${STAGES.map((s,k)=>bar(stages[k+1],n,s)).join('')}<p class="work-help">작성 주차: ${weeks.join(', ')||'–'}</p></section></div>`;
 $('#class-csv').disabled=!rows.length;window.classSummary={n,rows,reasons,stages};
}
$('#class-run').addEventListener('click',run);
$('#class-clear').addEventListener('click',()=>{$('#class-codes').value='';$('#class-result').innerHTML='';$('#class-status').textContent='';$('#class-csv').disabled=true});
$('#class-csv').addEventListener('click',()=>{const csv='﻿유형,단원,남은 오답 학생 수,남은 오답 수,변형 연습 완료 학생 수\n'+rows.map(([t,v])=>[byId[t].title,UNIT[byId[t].unit],v.students,v.total,v.done].join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='class-mistake-summary.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)});
