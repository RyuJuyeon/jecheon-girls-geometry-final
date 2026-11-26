import fs from 'node:fs/promises';
import {labs} from '../content/labs.mjs';
import {bankQuestions} from '../content/bank.mjs';
import {units} from '../content/platform.mjs';
import {head,esc,rich} from './render.mjs';
import {platformHeader} from './platform.mjs';
import {autocheck} from './bank.mjs';
const header=()=>platformHeader().replace(/href="#([^"]+)"/g,(_,id)=>`href="${id==='bank'?'bank.html':'index.html#'+id}"`);
const importmap='<script type="importmap">{"imports":{"three":"./assets/three/three.module.js","three/addons/":"./assets/three/addons/"}}</script>';
export async function copyThree(){
 await fs.mkdir('dist/assets/three/addons/controls',{recursive:true});
 for(const f of ['three.module.js','three.core.js'])await fs.copyFile('node_modules/three/build/'+f,'dist/assets/three/'+f);
 await fs.copyFile('node_modules/three/examples/jsm/controls/OrbitControls.js','dist/assets/three/addons/controls/OrbitControls.js');
 await fs.copyFile('node_modules/three/LICENSE','dist/assets/three/LICENSE');
}
export async function buildLabs(){
 await copyThree();
 for(const [i,lab] of labs.entries()){
  const unit=units.find(u=>u.id===lab.unit),q={id:'lab-'+lab.id,checks:lab.checks};
  const related=lab.related.map(id=>bankQuestions.find(b=>b.id===id)).filter(Boolean);
  const html=head(`${lab.title} | 기하 실험실`,'<link rel="stylesheet" href="platform.css"><link rel="stylesheet" href="notebook.css"><link rel="stylesheet" href="bank.css"><link rel="stylesheet" href="labs.css">'+importmap)
  +`<body><a class="skip" href="#main">본문으로 건너뛰기</a>${header()}<main id="main" class="section-wrap lab-page" data-lab="${lab.id}"><p class="eyebrow">GEOMETRY LAB · ${esc(unit.title)} · ${esc(lab.tag)}</p><h1>${esc(lab.title)}</h1><p class="lead">${esc(lab.summary)}</p><p class="lab-intro">${rich(lab.intro)}</p>
<section class="lab-stage" aria-label="실험 화면"><div class="lab-view" id="lab-view"><p class="lab-fallback">실험 화면을 불러오는 중입니다. JavaScript가 필요합니다.</p></div><div class="lab-panel" id="lab-panel"></div></section>
<p class="work-help">${lab.engine==='three'?'화면을 끌어서 돌리고, 두 손가락이나 마우스 휠로 확대·축소할 수 있어요. ':''}값은 오른쪽(휴대폰에서는 아래) 패널에서 바꿉니다.</p>
<section class="lab-steps"><h2>관찰하기</h2><ol>${lab.steps.map(s=>`<li>${rich(s)}</li>`).join('')}</ol></section>
<section class="lab-questions"><h2>확인하기</h2><p class="work-help">실험에서 발견한 내용으로 답해 보세요. 채점 기록은 이 브라우저에만 저장됩니다.</p>${autocheck(q)}<noscript><p>자동 채점은 JavaScript가 필요합니다.</p></noscript></section>
<section class="lab-facts"><details><summary>알게 된 사실 정리</summary><p>${rich(lab.facts)}</p></details></section>
${related.length?`<section class="lab-related"><h2>이어서 풀어 볼 문제</h2><ul>${related.map(b=>`<li><a href="practice-${b.id}.html">${esc(b.title)}</a> <span class="meta">${b.stage} · ${esc(b.topic)}</span></li>`).join('')}</ul></section>`:''}
<p class="notice">교과서의 탐구 활동 유형을 참고해 상황·수치·문장·그림을 새로 구성한 실험입니다. 교과서 본문이나 그림을 옮기지 않았습니다.</p>
<nav class="problem-navigation" aria-label="실험 이동">${i?`<a href="lab-${labs[i-1].id}.html">이전 실험</a>`:''}<a href="index.html#labs">실험실 목록</a>${i<labs.length-1?`<a href="lab-${labs[i+1].id}.html">다음 실험</a>`:''}</nav></main>
<footer><b>공간을 읽는 기하 2.0</b><span>창작 학습 자료 · 개인정보 수집 없음</span><a href="index.html">메인으로</a></footer><script src="answer.js" defer></script><script src="bank.js" defer></script><script type="module" src="labs/${lab.id}.js"></script></body></html>`;
  await fs.writeFile(`dist/lab-${lab.id}.html`,html);
 }
}
export function labCards(){
 return labs.map(lab=>{const unit=units.find(u=>u.id===lab.unit);return `<article class="feature-card lab-card ${unit.color}"><span class="status">이용 가능 · ${esc(unit.title)} · ${lab.engine==='three'?'3D':'2D'}</span><h3>${esc(lab.title)}</h3><p>${esc(lab.summary)}</p><a href="lab-${lab.id}.html">실험 열기</a></article>`}).join('');
}
