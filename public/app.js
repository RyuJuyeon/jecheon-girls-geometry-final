'use strict';
const key='jecheon-geometry-v1';let saved={};
try{saved=JSON.parse(localStorage.getItem(key)||'{}');if(!saved||typeof saved!=='object')saved={};}catch{saved={};}
function progress(){for(const n of [1,2]){const boxes=[...document.querySelectorAll(`#lesson-${n} [data-save]`)];const core=boxes.filter(x=>x.closest('.question').dataset.stage!=='도전');document.querySelector(`#progress-${n}`).textContent=`필수 ${core.filter(x=>x.checked).length}/8 · 도전 ${boxes.filter(x=>x.checked).length-core.filter(x=>x.checked).length}/2`;}document.querySelector('#check-progress').textContent=`설명할 수 있는 개념 ${[...document.querySelectorAll('#check [data-save]')].filter(x=>x.checked).length} / 8`}
document.querySelectorAll('[data-save]').forEach(input=>{input.checked=saved[input.dataset.save]===true;input.addEventListener('change',()=>{saved[input.dataset.save]=input.checked;try{localStorage.setItem(key,JSON.stringify(saved))}catch{document.querySelector('#storage-note').textContent='이 브라우저에서는 저장할 수 없습니다. 현재 화면에서만 체크가 유지됩니다.'}progress()})});
document.querySelector('#reset').addEventListener('click',()=>{if(!confirm('이 기기의 완료 체크와 자기 점검을 모두 초기화할까요? 손풀이 필기는 유지됩니다.'))return;saved={};try{localStorage.removeItem(key)}catch{}document.querySelectorAll('[data-save]').forEach(x=>x.checked=false);progress()});
document.querySelector('#print').addEventListener('click',()=>window.print());progress();
const f=n=>Math.abs(n)<.00001?'0':Number(n.toFixed(2)).toString();
const project=(x,y,z)=>[210+12*(x-y),180-4*Math.sqrt(3)*(x+y)-8*Math.sqrt(3)*z];
function line(a,b,color,dash=''){return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="5 5"':''}/>`}
function space(){
const h=Number(document.querySelector('#height').value),a=project(0,0,0),b=project(3,4,h),base=project(3,4,0);
document.querySelector('#height-value').textContent=h;
document.querySelector('#space-reading').textContent=`B=(3,4,${h}) · AB=√${25+h*h} ≈ ${f(Math.sqrt(25+h*h))}. ${h===0?'B는 구면 위에 있어요.':'B는 구의 외부에 있어요.'}`;
const circle=(plane)=>Array.from({length:73},(_,i)=>{const t=i*Math.PI/36,c=5*Math.cos(t),s=5*Math.sin(t);return (i?'L':'M')+project(...(plane==='xy'?[c,s,0]:[c,0,s])).join(',')}).join('')+'Z';
document.querySelector('#space-svg').innerHTML=`<circle cx="210" cy="180" r="${60*Math.sqrt(2)}" fill="#a8c6ad22" stroke="#829f88"/><path d="${circle('xy')}" fill="none" stroke="#829f88"/><path d="${circle('xz')}" fill="none" stroke="#829f88"/>${line(project(-5,0,0),project(8,0,0),'#aab7aa')}${line(project(0,-5,0),project(0,8,0),'#aab7aa')}${line(project(0,0,-6),project(0,0,10),'#aab7aa')}${line(base,b,'#b2864c',true)}${line(a,b,'#285e50')}<g fill="#285e50"><circle cx="${a[0]}" cy="${a[1]}" r="5"/><circle cx="${b[0]}" cy="${b[1]}" r="6"/></g><g font-size="13" fill="#234c43"><text x="223" y="198">A / 중심</text><text x="${b[0]+12}" y="${b[1]-8}">B(3,4,${h})</text><text x="310" y="128">x</text><text x="100" y="128">y</text><text x="220" y="45">z</text><text x="18" y="24">반지름 5인 구 · 등각 투영</text></g>`;
}

function vector(){const deg=Number(document.querySelector('#angle').value),rad=deg*Math.PI/180;const a=[3,0],b=[2*Math.cos(rad),2*Math.sin(rad)],sum=[a[0]+b[0],b[1]],o=[135,235],p=v=>[o[0]+48*v[0],o[1]-48*v[1]];document.querySelector('#angle-value').textContent=deg+'°';document.querySelector('#vector-reading').textContent=`a·b=6cosθ=${f(6*Math.cos(rad))} · a+b=(${f(sum[0])}, ${f(sum[1])}). ${deg===90?'두 벡터는 수직이에요.':deg<90?'내적이 양수예요.':'내적이 음수예요.'}`;document.querySelector('#vector-svg').innerHTML=`<defs><marker id="va" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#285e50"/></marker><marker id="vb" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#aa7130"/></marker><marker id="vs" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#607398"/></marker></defs>${line([20,235],[400,235],'#c3cbbf')}${line([135,275],[135,40],'#c3cbbf')}${line(p(a),p(sum),'#b2b8ad',true)}${line(p(b),p(sum),'#b2b8ad',true)}<g stroke-width="3"><path d="M${o}L${p(sum)}" stroke="#607398" marker-end="url(#vs)"/><path d="M${o}L${p(a)}" stroke="#285e50" marker-end="url(#va)"/><path d="M${o}L${p(b)}" stroke="#aa7130" marker-end="url(#vb)"/></g><g font-size="13"><text x="280" y="257" fill="#285e50">a</text><text x="${p(b)[0]-10}" y="${p(b)[1]-12}" fill="#956022">b</text><text x="${p(sum)[0]+5}" y="${p(sum)[1]-18}" fill="#53698e">a+b</text><text x="18" y="27" fill="#234c43">θ=${deg}° · a 길이 3, b 길이 2</text></g>`;}
document.querySelector('#height').addEventListener('input',space);document.querySelector('#angle').addEventListener('input',vector);space();vector();

// JavaScript가 없는 환경에서도 메뉴 링크를 표시합니다.
document.documentElement.classList.add('js');
const menuToggle=document.querySelector('.menu-toggle');
const platformNav=document.querySelector('#platform-nav');
menuToggle?.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));platformNav.classList.toggle('is-open',open)});
platformNav?.addEventListener('click',event=>{if(event.target.closest('a')){menuToggle.setAttribute('aria-expanded','false');platformNav.classList.remove('is-open')}});
platformNav?.addEventListener('keydown',event=>{if(event.key==='Escape'){menuToggle.setAttribute('aria-expanded','false');platformNav.classList.remove('is-open');menuToggle.focus()}});
