import {compute,EXAM_UNITS,MIN_TOTAL,MIN_PER_UNIT,STAGES} from './readiness.js';
import {byId,TOPIC_TYPES,ITEM_TYPES} from './drill/generators.js';
import {encode,isoWeek,REASON_KEYS} from './summary.js';
const app=document.querySelector('#exam-ready-app');
const data=JSON.parse(document.querySelector('#exam-ready-data').textContent);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const load=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))return v}catch{}return {}};
const UNIT={space:'공간도형과 공간좌표',vectors:'벡터'};
const typesOf=item=>item.topic?(TOPIC_TYPES[item.unit+'|'+item.topic]||[]):(ITEM_TYPES[item.id]||[]);
const REASON_TEXT=['개념 오해','조건 잘못 읽음','계산 실수','풀이 방법 못 떠올림'];
let lastCode='';
function summarize(r,mistakes,drill){
 const open={},reasons=[0,0,0,0];let graduated=0;
 for(const i of [...data.items,...data.review]){const m=mistakes[i.id];if(!m||!EXAM_UNITS.includes(i.unit))continue;if(m.status==='open'){const t=typesOf(i)[0];if(t)open[t]=(open[t]||0)+1}else graduated++;const k=REASON_KEYS.indexOf(m.reason);if(k>=0)reasons[k]++}
 return {week:isoWeek(),units:Object.fromEntries(EXAM_UNITS.map(u=>[u,{attempted:r.units[u].attempted,total:r.units[u].total,pct:Math.round(r.units[u].mastery*100)}])),stage:r.stage,open,reasons,graduated,drillDone:Object.keys(drill).filter(t=>drill[t]?.done&&byId[t])};
}
function render(){
 const grades=load('geometry-bank-grade-v1'),mistakes=load('geometry-mistakes-v1'),drill=load('geometry-drill-v1');
 const r=compute({items:data.items,grades,mistakes});
 const solved=id=>grades[id]?.solved===true,open=id=>mistakes[id]?.status==='open',pct=x=>Math.round(x*100);
 const parts=u=>{const list=data.items.filter(i=>i.unit===u);return `문제은행 ${list.filter(i=>i.stage!=='실험').length} · 실험 ${list.filter(i=>i.stage==='실험').length}`};
 const dots=`<ol class="er-steps" aria-label="준비 단계">${STAGES.map((s,k)=>`<li class="${r.stage>k?'on':''}${r.stage===k+1?' now':''}">${s}</li>`).join('')}</ol>`;
 const stageCard=r.prediction?`<div class="er-score"><p class="er-label">나의 준비 단계 (참고용)</p><p class="er-range"><b>${esc(r.level)}</b></p>${dots}<p class="er-level">기말 범위 준비도 ${r.prediction.low}~${r.prediction.high}% · 기말 범위 문항의 ${pct(r.prediction.coverage)}%를 풀었어요</p><p class="work-help">점수가 아니라 지금까지의 채점 기록으로 본 준비 정도예요. 더 많이 풀수록 범위가 좁아져요.</p></div>`
  :`<div class="er-score is-locked"><p class="er-label">나의 준비 단계</p><p class="er-range"><b>${Math.max(r.need.total,EXAM_UNITS.reduce((a,u)=>a+r.need.perUnit[u],0))}</b>문항 더 풀면 보여요</p><progress max="${MIN_TOTAL}" value="${Math.min(MIN_TOTAL,r.attempted)}" aria-label="준비 단계 공개까지 채점한 문항 수"></progress><p class="work-help">기말 범위에서 ${MIN_TOTAL}문항 이상, 단원마다 ${MIN_PER_UNIT}문항 이상 채점하면 준비 단계를 보여 줘요.${EXAM_UNITS.filter(u=>r.need.perUnit[u]>0).map(u=>` ${UNIT[u]} ${r.need.perUnit[u]}문항 더`).join(',')}</p></div>`;
 const gauges=`<h3 class="er-gauges-title">단원별 준비도</h3>`+EXAM_UNITS.map(u=>{const x=r.units[u];return `<div class="er-gauge"><div class="er-gauge-head"><b>${UNIT[u]}</b><span>준비도 ${pct(x.mastery)}%</span></div><div class="er-track" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(x.mastery)}" aria-label="${UNIT[u]} 준비도"><div class="er-fill ${u}" style="width:${pct(x.mastery)}%"></div></div><p class="er-sub">채점한 문항 ${x.attempted}/${x.total} (${parts(u)}) · 맞힌 문항 ${x.solved}개 · <a href="bank.html?unit=${u}&status=new">안 푼 문제 풀기</a></p></div>`}).join('');
 const openItems=[...data.items,...data.review].filter(i=>EXAM_UNITS.includes(i.unit)&&open(i.id));
 const groups=new Map();for(const i of openItems){const t=typesOf(i)[0];if(!t)continue;if(!groups.has(t))groups.set(t,[]);groups.get(t).push(i)}
 const sameType=t=>data.items.filter(q=>q.topic&&typesOf(q).includes(t)&&!solved(q.id)&&!open(q.id)).slice(0,3);
 const custom=groups.size?[...groups.entries()].map(([t,list])=>{const d=drill[t]||{streak:0,done:false},alt=sameType(t);return `<article class="er-type"><p class="meta">${UNIT[byId[t].unit]}</p><h4>${esc(byId[t].title)}</h4><p class="er-sub">남은 오답: ${list.map(i=>`<a href="${esc(i.href)}">${esc(i.title)}</a>`).join(', ')}</p><div class="er-actions"><a class="small-button er-primary" href="drill.html?type=${t}">변형 문제로 연습 ${d.done?'✓ 완료':`(연속 ${d.streak||0}/3)`}</a>${alt.length?`<span class="er-sub">같은 유형 안 푼 문제: ${alt.map(q=>`<a href="${esc(q.href)}">${esc(q.title)}</a>`).join(' · ')}</span>`:''}</div></article>`}).join('')
  :`<p class="er-empty">기말 범위에 남은 오답이 없어요. 👍 아래 추천 문제로 준비도를 채워 보세요.</p>`;
 const order=['기본','적용','실험','도전'];const weak=[...EXAM_UNITS].sort((a,b)=>r.units[a].mastery-r.units[b].mastery);
 const next=weak.flatMap(u=>data.items.filter(i=>i.unit===u&&!solved(i.id)&&!open(i.id)).sort((a,b)=>order.indexOf(a.stage)-order.indexOf(b.stage))).slice(0,4);
 const s=summarize(r,mistakes,drill);lastCode=encode(s);
 const openTotal=Object.values(s.open).reduce((a,b)=>a+b,0);
 app.innerHTML=`<div class="er-top">${stageCard}<div class="er-gauges">${gauges}</div></div>
<section class="er-custom" aria-labelledby="er-custom-title"><h3 id="er-custom-title">오답 유형 맞춤 복습</h3><p class="work-help">오답노트에 남은 문제를 유형별로 묶었어요. 같은 유형을 숫자만 바꾼 변형 문제로 3번 연속 맞혀 보세요. 그 다음 원래 문제를 다른 날 다시 풀면 오답노트에서 졸업해요.</p><div class="er-types">${custom}</div></section>
${next.length?`<section class="er-next" aria-labelledby="er-next-title"><h3 id="er-next-title">다음에 풀 문제 추천</h3><ul>${next.map(i=>`<li><a href="${esc(i.href)}">${esc(i.title)}</a> <span class="meta">${UNIT[i.unit]} · ${i.stage}</span></li>`).join('')}</ul></section>`:''}
<div class="er-tools"><section class="er-backup" id="er-backup" aria-label="학습 기록 내보내기와 불러오기"></section>
<section class="er-code" aria-labelledby="er-code-title"><h3 id="er-code-title">선생님께 결과 요약 코드 내기</h3><p class="work-help">이름 없이 아래 코드만 복사해 ${data.formUrl?'제출 링크':'선생님이 안내한 곳(구글 폼 등)'}에 붙여넣으세요. 선생님은 반 전체의 오답 경향만 볼 수 있어요.</p>
<details class="er-code-what"><summary>이 코드에 담긴 내용 보기</summary><ul><li>단원별 준비도: ${EXAM_UNITS.map(u=>`${UNIT[u]} ${s.units[u].pct}% (채점 ${s.units[u].attempted}문항)`).join(', ')}</li><li>준비 단계: ${s.stage?STAGES[s.stage-1]:'아직 없음'}</li><li>유형별 남은 오답 수: ${openTotal?Object.entries(s.open).map(([t,n])=>`${byId[t]?.title} ${n}`).join(', '):'없음'}</li><li>틀린 이유 개수: ${REASON_TEXT.map((t,k)=>`${t} ${s.reasons[k]}`).join(', ')}</li><li>오답노트 졸업 ${s.graduated}문제 · 변형 연습 완료 ${s.drillDone.length}유형 · 작성 주차 ${s.week}</li><li><b>담기지 않는 것:</b> 이름, 학번, 내가 입력한 답, 문제별 기록, 정확한 날짜</li></ul></details>
<textarea class="er-code-text" readonly rows="3" aria-label="결과 요약 코드">${esc(lastCode)}</textarea><div class="er-code-actions"><button type="button" class="small-button" id="er-copy">코드 복사</button>${data.formUrl?`<a class="small-button er-primary" href="${esc(data.formUrl)}" target="_blank" rel="noopener">제출하러 가기</a>`:''}</div><p class="er-copy-status" role="status"></p></section></div>
<p class="er-links"><a href="drill.html">변형 문제 연습 전체 보기</a><a href="mistakes.html">오답노트</a><a href="bank.html">문제은행</a></p>`;
 window.GeometryBackup?.mount(app.querySelector('#er-backup'));
 app.querySelector('#er-copy').addEventListener('click',async()=>{const st=app.querySelector('.er-copy-status');try{await navigator.clipboard.writeText(lastCode);st.textContent='복사했어요. 제출 칸에 붙여넣으세요.'}catch{const t=app.querySelector('.er-code-text');t.focus();t.select();st.textContent='코드를 선택해 두었어요. 길게 눌러 복사하세요.'}});
 window.examReady={...r,code:lastCode,summary:s};
}
render();
window.addEventListener('storage',render);window.addEventListener('pageshow',render);window.addEventListener('geometry-data-changed',()=>setTimeout(render,0));
