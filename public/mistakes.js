'use strict';
// 오답노트 저장소. 이 브라우저(localStorage)에만 저장하고 서버로 보내지 않는다.
// 규칙: 채점에서 틀리면 자동으로 담긴다. 틀린 이유를 고르고, 틀린 날과 다른 날 다시 맞히면 "졸업"한다.
(function(root){
  const KEY='geometry-mistakes-v1';
  const REASONS=[['concept','개념을 잘못 알았다'],['condition','조건을 잘못 읽었다'],['calc','계산 실수'],['method','풀이 방법을 떠올리지 못했다']];
  const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  let clock=()=>new Date(); // 테스트에서 날짜를 바꿀 수 있도록 분리
  const today=()=>day(clock());
  function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))return v}catch{}return {}}
  function save(m){try{localStorage.setItem(KEY,JSON.stringify(m));return true}catch{return false}}
  const clean=s=>String(s??'').slice(0,300);
  const attr=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  function entry(m,id,source){return m[id]||(m[id]={id,source,added:today(),reason:'',note:'',wrongCount:0,rightCount:0,status:'open'})}
  // 채점 결과 기록. 반환값: {state:'recorded'|'graduated'|'same-day'|'need-reason'|'none', entry}
  function recordAttempt(id,correct,inputs,source='bank'){
    const m=load();let e=m[id];
    if(!correct){e=entry(m,id,source);e.status='open';delete e.graduated;e.lastWrong=today();e.wrongCount++;e.wrongInputs=(inputs||[]).map(clean).slice(0,8);save(m);return {state:'recorded',entry:e}}
    if(!e||e.status!=='open')return {state:'none',entry:e};
    e.rightCount++;e.lastRight=today();
    let state;
    if(!e.reason)state='need-reason';
    else if(e.lastWrong===today())state='same-day';
    else{e.status='graduated';e.graduated=today();state='graduated'}
    save(m);return {state,entry:e};
  }
  function setReason(id,reason,note){const m=load();const e=m[id];if(!e||!REASONS.some(([k])=>k===reason))return false;e.reason=reason;e.note=clean(note);return save(m)}
  function addManual(id,source='review'){const m=load();const e=entry(m,id,source);e.status='open';delete e.graduated;e.lastWrong=today();e.wrongCount++;save(m);return e}
  // 자동 채점이 없는 문항(기존 20문항)은 다른 날 스스로 다시 풀어 맞혔다고 표시하면 졸업한다.
  function selfCheck(id){const m=load();const e=m[id];if(!e||e.status!=='open')return {state:'none'};if(!e.reason)return {state:'need-reason',entry:e};e.rightCount++;e.lastRight=today();if(e.lastWrong===today()){save(m);return {state:'same-day',entry:e}}e.status='graduated';e.graduated=today();save(m);return {state:'graduated',entry:e}}
  function remove(id){const m=load();delete m[id];return save(m)}
  const reasonText=k=>(REASONS.find(([x])=>x===k)||[,''])[1];
  root.GeometryMistakes={KEY,REASONS,load,save,recordAttempt,setReason,addManual,selfCheck,remove,reasonText,today,_setClock:f=>{clock=f}};

  // 채점 직후 보여 줄 오답 기록 패널 (문제·실험 페이지)
  root.GeometryMistakes.feedback=function(container,id,result){
    let box=container.querySelector('.mistake-feedback');if(!box){box=document.createElement('div');box.className='mistake-feedback';container.appendChild(box)}
    const e=result.entry;box.hidden=false;
    if(result.state==='graduated'){box.className='mistake-feedback is-graduated';box.innerHTML='<p><b>🎓 오답노트에서 졸업했어요!</b> 다른 날 다시 맞혔으니 이제 내 것이 됐어요. <a href="mistakes.html">오답노트 보기</a></p>';return}
    if(result.state==='same-day'){box.className='mistake-feedback';box.innerHTML='<p>오늘 틀렸던 문제예요. <b>내일 이후에 다시 맞히면</b> 오답노트에서 졸업해요. <a href="mistakes.html">오답노트 보기</a></p>';return}
    if(result.state==='none'){box.hidden=true;return}
    const first=result.state==='recorded';
    box.className='mistake-feedback is-open';
    box.innerHTML=`<p><b>${first?'오답노트에 담았어요.':'이유를 아직 고르지 않았어요.'}</b> 틀린 이유를 골라야 나중에 졸업할 수 있어요.</p><fieldset><legend>틀린 이유</legend>${REASONS.map(([k,t])=>`<label><input type="radio" name="reason-${id}" value="${k}"${e.reason===k?' checked':''}> ${t}</label>`).join('')}</fieldset><label class="mistake-note-label">다음에는 이렇게 하겠다 (한 줄)<input type="text" maxlength="300" value="${attr(e.note)}" placeholder="예: 큰 분모가 어느 축 아래에 있는지 먼저 확인한다"></label><button type="button" class="small-button">이유 저장</button><p class="mistake-saved" role="status"></p>`;
    box.querySelector('button').addEventListener('click',()=>{const r=box.querySelector('input[type=radio]:checked');const msg=box.querySelector('.mistake-saved');if(!r){msg.textContent='틀린 이유를 하나 골라 주세요.';return}msg.textContent=setReason(id,r.value,box.querySelector('input[type=text]').value)?'저장했어요. 오답노트에서 언제든 고칠 수 있어요.':'저장할 수 없어요. 브라우저 저장 공간을 확인해 주세요.'});
  };

  // 기존 20문항의 "오답노트에 추가" 버튼
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-mistake-id]').forEach(box=>{
      const id=box.dataset.mistakeId,button=box.querySelector('button'),status=box.querySelector('[role=status]');box.hidden=false;
      const show=()=>{const e=load()[id];button.textContent=e&&e.status==='open'?'오답노트에 담겨 있어요':'틀렸다면 오답노트에 추가';button.disabled=!!(e&&e.status==='open')};
      show();
      button.addEventListener('click',()=>{const e=addManual(id,'review');show();root.GeometryMistakes.feedback(box,id,{state:'recorded',entry:e});status.textContent=''});
    });
  });
})(typeof globalThis!=='undefined'?globalThis:this);
