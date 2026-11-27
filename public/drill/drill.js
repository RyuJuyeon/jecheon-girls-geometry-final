import {TYPES,byId,generate,TOPIC_TYPES} from './generators.js';
const A=window.GeometryAnswer,K=window.katex;
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const math=s=>String(s).split(/(\$[^$]+\$)/g).map(x=>x.startsWith('$')&&x.length>2?(K?K.renderToString(x.slice(1,-1),{throwOnError:false}):esc(x.slice(1,-1))):esc(x)).join('');
const KEY='geometry-drill-v1';const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))return v}catch{}return {}};const save=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}};
const bank=JSON.parse(document.querySelector('#drill-bank').textContent);
const params=new URLSearchParams(location.search);
let type=byId[params.get('type')]?params.get('type'):TYPES[0].id,seed=Number(params.get('seed'))||Math.floor(Math.random()*1e9)+1;
const select=document.querySelector('#drill-type'),root=document.querySelector('#drill-problem');
select.innerHTML=[['space','공간도형과 공간좌표'],['vectors','벡터']].map(([u,t])=>`<optgroup label="${t}">${TYPES.filter(x=>x.unit===u).map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join('')}</optgroup>`).join('');
select.addEventListener('change',()=>{type=select.value;seed=Math.floor(Math.random()*1e9)+1;show()});
document.querySelector('#drill-next').addEventListener('click',()=>{seed=Math.floor(Math.random()*1e9)+1;show()});
function stat(){const s=load()[type]||{tries:0,correct:0,streak:0,done:false};return s}
function renderStats(){const s=stat();document.querySelector('#drill-stats').innerHTML=`<span>푼 변형 문제 <b>${s.tries}</b></span><span>정답 <b>${s.correct}</b></span><span>연속 정답 <b>${s.streak}</b>${s.done?' · <b class="drill-done">이 유형 연습 완료 ✓</b>':' / 3'}</span>`}
function show(){
 select.value=type;const g=generate(type,seed);
 const url=new URL(location.href);url.searchParams.set('type',type);url.searchParams.set('seed',seed);try{history.replaceState(null,'',url)}catch{}
 const related=bank.filter(q=>(TOPIC_TYPES[q.unit+'|'+q.topic]||[]).includes(type));
 root.innerHTML=`<article class="drill-card"><p class="meta">${g.unit==='space'?'공간도형과 공간좌표':'벡터'} · 변형 문제 · 번호 ${seed}</p><h2>${esc(g.title)}</h2><p class="drill-prompt">${math(g.prompt)}</p>
<form class="autocheck drill-form" novalidate><h5>답 입력하고 채점</h5><p class="work-help">분수는 <code>3/8</code>, 루트는 <code>2√3</code>, 원주율은 <code>π</code>로 입력하세요. 변형 문제는 오답노트에 저장되지 않아요.</p>${g.fields.some(f=>f.type!=='choice')?`<div class="check-keys" role="group" aria-label="기호 입력">${['√','π','/','-','(',')'].map(k=>`<button type="button" data-key="${k}" aria-label="${k} 입력">${k}</button>`).join('')}</div>`:''}
<div class="check-fields">${g.fields.map((f,i)=>f.type==='choice'?`<fieldset class="check-field" data-i="${i}"><legend>${math(f.label)}</legend><div class="check-options">${f.options.map((o,j)=>`<label><input type="radio" name="f${i}" value="${j}"> ${esc(o)}</label>`).join('')}</div><p class="check-note"></p></fieldset>`:`<div class="check-field" data-i="${i}"><label for="d-f${i}">${math(f.label)}</label><input id="d-f${i}" name="f${i}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="60"><p class="check-note"></p></div>`).join('')}</div>
<div class="check-actions"><button type="submit" class="small-button">채점하기</button></div><p class="check-result" role="status" aria-live="polite"></p></form>
<details class="drill-hint"><summary>힌트 1</summary><p>${math(g.hints[0])}</p><details><summary>힌트 2</summary><p>${math(g.hints[1])}</p></details></details>
<details class="drill-solution"><summary>정답과 풀이</summary><p><b>정답</b> ${g.fields.map(f=>f.type==='choice'?esc(f.options[f.answer]):esc(f.answer)).join(' / ')}</p><p>${math(g.solution)}</p></details>
${related.length?`<p class="drill-related">같은 유형의 문제은행 문항: ${related.map(q=>`<a href="practice-${q.id}.html">${esc(q.title)}</a>`).join(' · ')}</p>`:''}</article>`;
 const form=root.querySelector('form');let last=null;let graded=false;
 form.addEventListener('focusin',e=>{if(e.target.matches('input[type=text]'))last=e.target});
 form.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>{const i=last||form.querySelector('input[type=text]');if(!i)return;const s=i.selectionStart??i.value.length;i.value=(i.value.slice(0,s)+b.dataset.key+i.value.slice(i.selectionEnd??s)).slice(0,60);i.focus()}));
 form.addEventListener('submit',e=>{e.preventDefault();
  const fields=[...form.querySelectorAll('.check-field')];const states=fields.map((el,i)=>{const f=g.fields[i];const v=f.type==='choice'?(el.querySelector('input:checked')?.value??''):el.querySelector('input').value;return A.grade(f,v)});
  const res=form.querySelector('.check-result');if(states.every(s=>s==='empty')){res.textContent='답을 입력한 뒤 채점하세요.';return}
  states.forEach((s,i)=>{const el=fields[i],ok=s==='correct'||s==='approx';el.classList.remove('is-correct','is-wrong','is-invalid');el.classList.add(ok?'is-correct':s==='wrong'?'is-wrong':'is-invalid');el.querySelector('.check-note').textContent=ok?(s==='approx'?'✓ 정답 (근삿값)':'✓ 정답'):s==='wrong'?'✗ 다시 생각해 보세요':s==='empty'?'✗ 비어 있어요':'✗ 읽을 수 없는 식이에요'});
  const all=states.every(s=>s==='correct'||s==='approx');res.className='check-result '+(all?'is-correct':'is-wrong');
  if(!graded){graded=true;const st=load(),s=st[type]||{tries:0,correct:0,streak:0,done:false};s.tries++;if(all){s.correct++;s.streak++;if(s.streak>=3)s.done=true}else s.streak=0;st[type]=s;save(st);renderStats()}
  const s=stat();res.textContent=all?(s.streak>=3?`맞았어요! 연속 ${s.streak}개 정답 — 이 유형은 연습 완료예요. "다음 변형 문제"로 더 풀거나 다른 유형을 골라 보세요.`:`맞았어요! 연속 정답 ${s.streak}/3. "다음 변형 문제"를 눌러 이어서 풀어 보세요.`):'틀린 칸을 다시 확인해 보세요. 기록은 처음 채점한 결과로 남아요. 힌트와 풀이를 보고 다음 변형 문제로 다시 도전하세요.';
 });
 renderStats();window.renderedDrill={type,seed,fields:g.fields};
}
show();
