import {compute,EXAM_UNITS,MIN_TOTAL} from './readiness.js';
import {byId,TOPIC_TYPES,ITEM_TYPES} from './drill/generators.js';
const app=document.querySelector('#exam-ready-app');
const data=JSON.parse(document.querySelector('#exam-ready-data').textContent);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const load=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))return v}catch{}return {}};
const UNIT={space:'공간도형과 공간좌표',vectors:'벡터'};
const typesOf=item=>item.topic?(TOPIC_TYPES[item.unit+'|'+item.topic]||[]):(ITEM_TYPES[item.id]||[]);
function render(){
 const grades=load('geometry-bank-grade-v1'),mistakes=load('geometry-mistakes-v1'),drill=load('geometry-drill-v1');
 const r=compute({items:data.items,grades,mistakes});
 const solved=id=>grades[id]?.solved===true,open=id=>mistakes[id]?.status==='open';
 const pct=x=>Math.round(x*100);
 const score=r.prediction?`<div class="er-score"><p class="er-label">예상 기말고사 점수 (참고용)</p><p class="er-range"><b>${r.prediction.low}~${r.prediction.high}</b>점</p><p class="er-level">${esc(r.level)} · 기말 범위 문항의 ${pct(r.prediction.coverage)}%를 풀었어요</p><p class="work-help">더 많은 문제를 풀수록 범위가 좁아져 예측이 정확해져요.</p></div>`
  :`<div class="er-score is-locked"><p class="er-label">예상 기말고사 점수</p><p class="er-range"><b>${r.need.total||EXAM_UNITS.map(u=>r.need.perUnit[u]).reduce((a,b)=>a+b,0)}</b>문항 더 풀면 공개돼요</p><progress max="${MIN_TOTAL}" value="${Math.min(MIN_TOTAL,r.attempted)}" aria-label="예상 점수 공개까지 푼 문항 수"></progress><p class="work-help">기말 범위에서 ${MIN_TOTAL}문항 이상, 단원마다 4문항 이상 채점하면 예상 점수를 보여 줘요.${EXAM_UNITS.filter(u=>r.need.perUnit[u]>0).map(u=>` ${UNIT[u]} ${r.need.perUnit[u]}문항 더`).join(',')}</p></div>`;
 const gauges=EXAM_UNITS.map(u=>{const x=r.units[u];return `<div class="er-gauge"><div class="er-gauge-head"><b>${UNIT[u]}</b><span>숙련도 ${pct(x.mastery)}%</span></div><div class="er-track" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(x.mastery)}" aria-label="${UNIT[u]} 숙련도"><div class="er-fill ${u}" style="width:${pct(x.mastery)}%"></div></div><p class="er-sub">채점한 문항 ${x.attempted}/${x.total} · 맞힌 문항 ${x.solved}개 · <a href="bank.html?unit=${u}&status=new">안 푼 문제 풀기</a></p></div>`}).join('');
 // 오답 유형 맞춤 복습: 남은 오답을 변형 문제 유형으로 묶는다
 const openItems=[...data.items,...data.review].filter(i=>EXAM_UNITS.includes(i.unit)&&open(i.id));
 const groups=new Map();for(const i of openItems){const t=typesOf(i)[0];if(!t)continue;if(!groups.has(t))groups.set(t,[]);groups.get(t).push(i)}
 const sameType=t=>data.items.filter(q=>q.topic&&typesOf(q).includes(t)&&!solved(q.id)&&!open(q.id)).slice(0,3);
 const custom=groups.size?[...groups.entries()].map(([t,list])=>{const d=drill[t]||{streak:0,done:false},alt=sameType(t);return `<article class="er-type"><p class="meta">${UNIT[byId[t].unit]}</p><h4>${esc(byId[t].title)}</h4><p class="er-sub">남은 오답: ${list.map(i=>`<a href="${esc(i.href)}">${esc(i.title)}</a>`).join(', ')}</p><div class="er-actions"><a class="small-button er-primary" href="drill.html?type=${t}">변형 문제로 연습 ${d.done?'✓ 완료':`(연속 ${d.streak||0}/3)`}</a>${alt.length?`<span class="er-sub">같은 유형 안 푼 문제: ${alt.map(q=>`<a href="${esc(q.href)}">${esc(q.title)}</a>`).join(' · ')}</span>`:''}</div></article>`}).join('')
  :`<p class="er-empty">기말 범위에 남은 오답이 없어요. 👍 아래 추천 문제로 게이지를 채워 보세요.</p>`;
 // 다음 추천: 숙련도가 낮은 단원부터, 기본 → 적용 → 도전 순으로 안 푼 문제
 const order=['기본','적용','실험','도전'];const weak=[...EXAM_UNITS].sort((a,b)=>r.units[a].mastery-r.units[b].mastery);
 const next=weak.flatMap(u=>data.items.filter(i=>i.unit===u&&!solved(i.id)&&!open(i.id)).sort((a,b)=>order.indexOf(a.stage)-order.indexOf(b.stage))).slice(0,4);
 app.innerHTML=`<div class="er-top">${score}<div class="er-gauges">${gauges}</div></div>
<section class="er-custom" aria-labelledby="er-custom-title"><h3 id="er-custom-title">오답 유형 맞춤 복습</h3><p class="work-help">오답노트에 남은 문제를 유형별로 묶었어요. 같은 유형을 숫자만 바꾼 변형 문제로 3번 연속 맞혀 보세요. 그 다음 원래 문제를 다른 날 다시 풀면 오답노트에서 졸업해요.</p><div class="er-types">${custom}</div></section>
${next.length?`<section class="er-next" aria-labelledby="er-next-title"><h3 id="er-next-title">다음에 풀 문제 추천</h3><ul>${next.map(i=>`<li><a href="${esc(i.href)}">${esc(i.title)}</a> <span class="meta">${UNIT[i.unit]} · ${i.stage}</span></li>`).join('')}</ul></section>`:''}
<p class="er-links"><a href="drill.html">변형 문제 연습 전체 보기</a><a href="mistakes.html">오답노트</a><a href="bank.html">문제은행</a></p>`;
 window.examReady=r;
}
render();
window.addEventListener('storage',render);window.addEventListener('pageshow',render);
