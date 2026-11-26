'use strict';
(() => {
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#platform-nav');document.documentElement.classList.add('js');
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
 nav?.addEventListener('keydown',event=>{if(event.key==='Escape'){toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');toggle.focus()}});
 const load=key=>{try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))return value}catch{}return {}};
 const store=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
 // 자기 점검(기존)과 자동 채점 기록은 서로 다른 저장소에 둔다. 서버로 보내지 않는다.
 const SELF='geometry-bank-progress-v1',GRADE='geometry-bank-grade-v1';
 const saved=load(SELF),grades=load(GRADE);
 const valid=g=>g&&typeof g==='object'&&typeof g.tries==='number';
 const statusOf=id=>{const g=grades[id];return valid(g)?(g.solved===true?'solved':'retry'):'new'};
 document.querySelectorAll('[data-save]').forEach(box=>{box.checked=saved[box.dataset.save]===true;box.addEventListener('change',()=>{saved[box.dataset.save]=box.checked;const message=document.querySelector('.practice-storage');message.textContent=store(SELF,saved)?'자기 점검을 이 브라우저에 저장했습니다.':'완료 기록을 저장할 수 없습니다. 현재 화면에서만 유지됩니다.'})});

 // ---- 자동 채점 (문제 페이지) ----
 const A=window.GeometryAnswer;
 document.querySelectorAll('form.autocheck').forEach(form=>{
  if(!A)return;
  form.hidden=false;
  const id=form.dataset.check,fields=[...form.querySelectorAll('.check-field')],result=form.querySelector('.check-result');
  let lastInput=null;
  form.addEventListener('focusin',event=>{if(event.target.matches('input[type=text]'))lastInput=event.target});
  form.querySelectorAll('[data-key]').forEach(button=>button.addEventListener('click',()=>{
   const input=lastInput||form.querySelector('input[type=text]');if(!input)return;
   const s=input.selectionStart??input.value.length,e=input.selectionEnd??input.value.length,k=button.dataset.key;
   input.value=(input.value.slice(0,s)+k+input.value.slice(e)).slice(0,60);input.focus();const p=Math.min(s+k.length,input.value.length);input.setSelectionRange(p,p);clearMark(input.closest('.check-field'))}));
  const valueOf=f=>f.dataset.type==='choice'?(f.querySelector('input:checked')?.value??''):f.querySelector('input').value;
  const clearMark=f=>{f.classList.remove('is-correct','is-wrong','is-invalid');f.querySelector('.check-note').textContent='';f.querySelector('input[type=text]')?.removeAttribute('aria-invalid')};
  fields.forEach(f=>f.addEventListener('input',()=>clearMark(f)));
  const notes={correct:'정답',approx:'정답 (근삿값으로 인정)',wrong:'다시 생각해 보세요',invalid:'읽을 수 없는 식이에요. 예: 3/8, 2√3, π/3',empty:'아직 입력하지 않았어요'};
  function show(f,state){clearMark(f);f.classList.add(state==='correct'||state==='approx'?'is-correct':state==='wrong'?'is-wrong':'is-invalid');f.querySelector('.check-note').textContent=(state==='correct'||state==='approx'?'✓ ':'✗ ')+notes[state];if(state!=='correct'&&state!=='approx')f.querySelector('input[type=text]')?.setAttribute('aria-invalid','true')}
  function check(record=true){
   const states=fields.map(f=>A.grade({type:f.dataset.type,answer:f.dataset.type==='choice'?Number(f.dataset.answer):f.dataset.answer},valueOf(f)));
   if(record&&states.every(s=>s==='empty')){result.textContent='답을 하나 이상 입력한 뒤 채점하세요.';return}
   states.forEach((s,i)=>show(fields[i],s));
   const right=states.filter(s=>s==='correct'||s==='approx').length,all=right===fields.length;
   const prev=valid(grades[id])?grades[id]:{tries:0,solved:false};
   const g=record?{tries:prev.tries+1,solved:prev.solved||all,inputs:fields.map(valueOf),at:Date.now()}:prev;
   if(record){grades[id]=g;store(GRADE,grades)}
   if(all)result.textContent=`모두 맞았어요! (${fields.length}/${fields.length}) 해설 탭에서 내 풀이 근거와 비교해 보세요.`;
   else{const tip=g.tries>=3?'정답 탭과 해설 탭에서 풀이 과정을 확인해 보세요.':g.tries>=2?'힌트 탭을 열어 보세요.':'틀린 칸의 조건을 다시 확인해 보세요.';result.textContent=`${fields.length}칸 중 ${right}칸 맞았어요. ${tip}`+(g.solved?' (이전에 이미 맞힌 문제예요)':'')}
   result.className='check-result '+(all?'is-correct':'is-wrong');
  }
  form.addEventListener('submit',event=>{event.preventDefault();check(true)});
  form.querySelector('[data-check-reset]').addEventListener('click',()=>{fields.forEach(f=>{clearMark(f);f.querySelectorAll('input[type=text]').forEach(i=>i.value='');f.querySelectorAll('input[type=radio]').forEach(i=>i.checked=false)});result.textContent=grades[id]?.solved?'입력을 지웠어요. 맞힌 기록은 그대로 남아 있어요.':'입력을 지웠어요.';result.className='check-result'});
  // 재접속 시 마지막 입력과 채점 결과 복원
  const g=grades[id];
  if(valid(g)&&Array.isArray(g.inputs)&&g.inputs.length===fields.length){fields.forEach((f,i)=>{const v=String(g.inputs[i]??'').slice(0,60);if(f.dataset.type==='choice'){const r=f.querySelector(`input[value="${CSS.escape(v)}"]`);if(r)r.checked=true}else f.querySelector('input').value=v});check(false)}
 });

 // ---- 문제 목록 (bank.html) ----
 const form=document.querySelector('.bank-filters');if(!form)return;
 const cards=[...document.querySelectorAll('.bank-card')],total=cards.length;
 const labels={solved:'✓ 맞혔어요',retry:'다시 도전',new:'아직 안 풀었어요'};
 cards.forEach(card=>{const id=card.dataset.bankId,s=statusOf(id);card.dataset.status=s;const tag=card.querySelector('.bank-grade');tag.textContent=labels[s];tag.className='bank-grade is-'+s;card.querySelector('.bank-done').textContent=saved['q-'+id]?'근거 확인':''});
 const count=s=>cards.filter(c=>c.dataset.status===s).length,selfCount=cards.filter(c=>saved['q-'+c.dataset.bankId]===true).length;
 document.querySelector('#bank-progress').textContent=`전체 ${total}문항 · 맞힌 문제 ${count('solved')}개 · 다시 도전 ${count('retry')}개 · 자기 점검 ${selfCount}개`;
 const meter=document.querySelector('#bank-meter');if(meter)meter.value=count('solved');
 const names=['unit','level','status','search'];
 const params=new URLSearchParams(location.search);for(const name of names){const input=form.elements[name];if(input&&params.has(name))input.value=params.get(name).slice(0,80)}
 const normalize=s=>s.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
 function filter(){const unit=form.elements.unit.value,level=form.elements.level.value,status=form.elements.status.value,query=normalize(form.elements.search.value);let shown=0;cards.forEach(c=>{const show=(!unit||c.dataset.unit===unit)&&(!level||c.dataset.level===level)&&(!status||c.dataset.status===status)&&(!query||normalize(c.dataset.search).includes(query));c.hidden=!show;if(show)shown++});document.querySelector('#bank-count').textContent=`전체 ${total}문항 중 ${shown}문항`;document.querySelector('#bank-empty').hidden=shown>0;const url=new URL(location.href);for(const name of names){const value=form.elements[name].value;value?url.searchParams.set(name,value):url.searchParams.delete(name)}try{history.replaceState(null,'',url)}catch{}}
 form.addEventListener('submit',event=>{event.preventDefault();filter()});form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('reset',()=>{setTimeout(filter,0)});filter();
})();
