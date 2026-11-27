'use strict';
(() => {
 const M=window.GeometryMistakes;if(!M)return;
 const items=JSON.parse(document.querySelector('#m-items').textContent),byId=Object.fromEntries(items.map(i=>[i.id,i]));
 const list=document.querySelector('#m-list'),form=document.querySelector('.m-filters');
 const sources={bank:'문제은행',review:'기말고사 집중 복습',lab:'실험실'};
 const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const dateText=d=>d?d.slice(5).replace('-','월 ')+'일':'–';
 const params=new URLSearchParams(location.search);for(const n of ['status','unit'])if(params.has(n))form.elements[n].value=params.get(n);
 function answerText(item,e){const inputs=e.wrongInputs||[];if(!inputs.length)return '';return inputs.map((v,i)=>{const o=item.opts?.[i];if(o&&v!=='')return o[Number(v)]??v;return v===''?'(빈칸)':v}).join(' / ')}
 function card(e){
  const item=byId[e.id];if(!item)return '';
  const tpl=document.querySelector(`#tpl-${CSS.escape(e.id)}`)?.content;const part=c=>tpl?.querySelector(c)?.innerHTML||'';
  const open=e.status==='open',needReason=open&&!e.reason;
  const wrong=answerText(item,e);
  return `<article class="m-card ${open?'':'is-graduated'} ${needReason?'needs-reason':''}" data-id="${esc(e.id)}" data-status="${e.status}" data-unit="${item.unit}">
<div class="m-card-top"><p class="meta">${esc(item.unitTitle)} · ${esc(item.stage)} · ${sources[item.source]||''}</p>${open?'':`<span class="m-badge">🎓 졸업 ${dateText(e.graduated)}</span>`}</div>
<h3>${esc(item.title)}</h3><div class="m-prompt">${part('.m-prompt')}</div>
${wrong?`<p class="m-wrong"><b>내가 쓴 답</b> ${esc(wrong)}</p>`:''}
<p class="m-dates">처음 담은 날 ${dateText(e.added)} · 마지막으로 틀린 날 ${dateText(e.lastWrong)} · 틀린 횟수 ${e.wrongCount||1}회${e.lastRight?` · 마지막으로 맞힌 날 ${dateText(e.lastRight)}`:''}</p>
<fieldset class="m-reason"><legend>① 틀린 이유 ${needReason?'<span class="m-required">골라 주세요</span>':''}</legend>${M.REASONS.map(([k,t])=>`<label><input type="radio" name="r-${esc(e.id)}" value="${k}"${e.reason===k?' checked':''}${open?'':' disabled'}> ${t}</label>`).join('')}</fieldset>
<label class="m-note">② 다음에는 이렇게 하겠다<input type="text" maxlength="300" value="${esc(e.note)}" placeholder="예: 대입한 뒤 원래 조건을 다시 확인한다"${open?'':' disabled'}></label><p class="m-print-note">${e.note?'다짐: '+esc(e.note):''}</p><p class="m-print-reason">틀린 이유: ${esc(M.reasonText(e.reason)||'미선택')}</p>
${open?`<div class="m-actions"><a class="small-button" href="${esc(item.href)}">③ 다시 풀기</a>${item.source==='review'?'<button type="button" class="small-button" data-act="self">다시 풀어 맞혔어요</button>':''}<button type="button" class="m-delete" data-act="delete">오답노트에서 빼기</button></div><p class="m-hint">${needReason?'틀린 이유를 고르면 졸업할 수 있어요.':e.lastWrong===M.today()?'오늘 틀린 문제예요. 내일 이후에 다시 맞히면 졸업해요.':'이제 다시 풀어 맞히면 졸업해요.'}</p>`:`<div class="m-actions"><a class="small-button" href="${esc(item.href)}">한 번 더 풀어 보기</a><button type="button" class="m-delete" data-act="delete">오답노트에서 빼기</button></div>`}
<p class="m-msg" role="status"></p>
<details class="m-solution"><summary>정답과 해설</summary><div class="m-answer"><b>정답</b> ${part('.m-answer')}</div><div>${part('.m-solution')}</div>${part('.m-mis')?`<aside><b>오개념 점검</b><br>${part('.m-mis')}</aside>`:''}</details></article>`;
 }
 function summary(all){
  const open=all.filter(e=>e.status==='open'),grad=all.filter(e=>e.status==='graduated');
  const units=[...new Map(items.map(i=>[i.unit,i.unitTitle])).entries()];
  document.querySelector('#m-stats').innerHTML=`<div class="m-stat"><b>${open.length}</b><span>남은 오답</span></div><div class="m-stat good"><b>${grad.length}</b><span>졸업</span></div><div class="m-stat warn"><b>${open.filter(e=>!e.reason).length}</b><span>이유 미선택</span></div><ul class="m-units">${units.map(([u,t])=>`<li>${esc(t)} <b>${open.filter(e=>byId[e.id]?.unit===u).length}</b>개 남음</li>`).join('')}</ul>`;
  const counted=all.filter(e=>e.reason),max=Math.max(1,...M.REASONS.map(([k])=>counted.filter(e=>e.reason===k).length));
  document.querySelector('#m-reasons').innerHTML=`<h2>나는 주로 왜 틀릴까?</h2>${counted.length?M.REASONS.map(([k,t])=>{const n=counted.filter(e=>e.reason===k).length;return `<div class="m-bar"><span>${t}</span><div class="m-bar-track"><div class="m-bar-fill" style="width:${n/max*100}%"></div></div><b>${n}</b></div>`}).join('')+`<p class="work-help">${(()=>{const top=M.REASONS.map(([k,t])=>[t,counted.filter(e=>e.reason===k).length]).sort((a,b)=>b[1]-a[1])[0];return `가장 많은 이유는 "${top[0]}"예요. 다음 문제를 풀 때 이 부분을 먼저 점검해 보세요.`})()}</p>`:'<p class="work-help">틀린 이유를 고르면 여기에 나의 실수 경향이 나타나요.</p>'}`;
 }
 function render(){
  const all=Object.values(M.load()).filter(e=>byId[e.id]);
  summary(all);
  const status=form.elements.status.value,unit=form.elements.unit.value;
  const shown=all.filter(e=>(status==='all'||e.status===status)&&(!unit||byId[e.id].unit===unit)).sort((a,b)=>(a.status===b.status?0:a.status==='open'?-1:1)||String(b.lastWrong).localeCompare(String(a.lastWrong)));
  list.innerHTML=shown.map(card).join('');
  document.querySelector('#m-count').textContent=all.length?`${shown.length}개 표시 중`:'';
  document.querySelector('#m-empty').hidden=all.length>0;
  const url=new URL(location.href);status!=='open'?url.searchParams.set('status',status):url.searchParams.delete('status');unit?url.searchParams.set('unit',unit):url.searchParams.delete('unit');try{history.replaceState(null,'',url)}catch{}
 }
 list.addEventListener('change',ev=>{
  const c=ev.target.closest('.m-card');if(!c)return;const id=c.dataset.id;
  const r=c.querySelector('input[type=radio]:checked');if(!r){c.querySelector('.m-msg').textContent='틀린 이유를 먼저 골라 주세요.';return}
  M.setReason(id,r.value,c.querySelector('.m-note input').value);const keep=id;render();const again=list.querySelector(`[data-id="${CSS.escape(keep)}"] .m-msg`);if(again)again.textContent='저장했어요.';
 });
 list.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-act]');if(!b)return;const c=b.closest('.m-card'),id=c.dataset.id,msg=c.querySelector('.m-msg');
  if(b.dataset.act==='delete'){if(b.dataset.confirm!=='1'){b.dataset.confirm='1';b.textContent='한 번 더 누르면 빠져요';msg.textContent='오답노트에서 빼면 이 문제의 기록이 지워져요.';return}M.remove(id);render();document.querySelector('#m-count').textContent+=' · 한 문제를 뺐어요.';return}
  if(b.dataset.act==='self'){const res=M.selfCheck(id);if(res.state==='graduated'){render();document.querySelector('#m-count').textContent+=' · 🎓 한 문제가 졸업했어요!'}else msg.textContent=res.state==='need-reason'?'틀린 이유를 먼저 골라 주세요.':'오늘 틀린 문제는 내일 이후에 다시 풀어 확인하면 졸업해요.'}
 });
 form.addEventListener('change',render);
 // 인쇄: 이름 칸은 저장하지 않고 인쇄 머리글에만 쓴다.
 const pf=document.querySelector('.m-print-fields'),solution=document.querySelector('#m-print-solution');
 function prepare(){const v=n=>pf.querySelector(`[name=${n}]`).value.trim();const who=[v('grade')&&v('grade')+'학년',v('class')&&v('class')+'반',v('no')&&v('no')+'번',v('name')].filter(Boolean).join(' ');document.querySelector('#m-print-who').textContent=who?who:'학년 ____ 반 ____ 번호 ____ 이름 ________';const n=list.querySelectorAll('.m-card').length;document.querySelector('#m-print-meta').textContent=`인쇄한 날 ${M.today()} · ${n}문항 · ${form.elements.status.selectedOptions[0].text}`;document.body.classList.toggle('print-no-solution',!solution.checked);list.querySelectorAll('details').forEach(d=>{d.dataset.wasOpen=d.open?'1':'';if(solution.checked)d.open=true})}
 function restore(){list.querySelectorAll('details').forEach(d=>{d.open=d.dataset.wasOpen==='1'})}
 window.addEventListener('beforeprint',prepare);window.addEventListener('afterprint',restore);
 document.querySelector('#m-print').addEventListener('click',()=>{if(!list.querySelector('.m-card')){document.querySelector('#m-print-status').textContent='인쇄할 문제가 없어요. "보기"를 바꿔 보세요.';return}prepare();window.print()});
 window.addEventListener('storage',e=>{if(e.key===M.KEY)render()});window.addEventListener('geometry-data-changed',()=>render());const bk=document.querySelector('#m-backup');if(bk&&window.GeometryBackup)window.GeometryBackup.mount(bk);
 render();
})();
