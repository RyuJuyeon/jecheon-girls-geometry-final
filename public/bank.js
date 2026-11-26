'use strict';
(() => {
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#platform-nav');document.documentElement.classList.add('js');
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
 nav?.addEventListener('keydown',event=>{if(event.key==='Escape'){toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');toggle.focus()}});
 const key='geometry-bank-progress-v1';let saved={};try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))saved=value}catch{}
 document.querySelectorAll('[data-save]').forEach(box=>{box.checked=saved[box.dataset.save]===true;box.addEventListener('change',()=>{saved[box.dataset.save]=box.checked;const message=document.querySelector('.practice-storage');try{localStorage.setItem(key,JSON.stringify(saved));message.textContent='자기 점검을 이 브라우저에 저장했습니다. 자동 채점 결과가 아닙니다.'}catch{message.textContent='완료 기록을 저장할 수 없습니다. 현재 화면에서만 유지됩니다.'}})});
 const form=document.querySelector('.bank-filters');if(!form)return;
 const cards=[...document.querySelectorAll('.bank-card')];
 cards.forEach(card=>{card.querySelector('.bank-done').textContent=saved['q-'+card.dataset.bankId]?'풀이 확인 완료':'미확인'});
 document.querySelector('#bank-progress').textContent=`전체 24문항 중 자기 점검 ${cards.filter(c=>saved['q-'+c.dataset.bankId]===true).length}개 · 정답률이 아닙니다.`;
 const params=new URLSearchParams(location.search);for(const name of ['unit','level','search']){const input=form.elements[name];if(params.has(name))input.value=params.get(name).slice(0,80)}
 const normalize=s=>s.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
 function filter(){const unit=form.elements.unit.value,level=form.elements.level.value,query=normalize(form.elements.search.value);let count=0;cards.forEach(c=>{const show=(!unit||c.dataset.unit===unit)&&(!level||c.dataset.level===level)&&(!query||normalize(c.dataset.search).includes(query));c.hidden=!show;if(show)count++});document.querySelector('#bank-count').textContent=`전체 24문항 중 ${count}문항`;document.querySelector('#bank-empty').hidden=count>0;const url=new URL(location.href);for(const name of ['unit','level','search']){const value=form.elements[name].value;value?url.searchParams.set(name,value):url.searchParams.delete(name)}try{history.replaceState(null,'',url)}catch{}}
 form.addEventListener('submit',event=>{event.preventDefault();filter()});form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('reset',()=>{setTimeout(filter,0)});filter();
})();
