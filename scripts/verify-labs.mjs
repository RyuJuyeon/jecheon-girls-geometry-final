import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {labs} from '../content/labs.mjs';
import {bankQuestions} from '../content/bank.mjs';
import {cubeSection,classify,perimeterSides,dRange} from '../public/labs/geometry.js';
const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('../public/answer.js',import.meta.url),'utf8'),sandbox);const {parse,grade}=sandbox.GeometryAnswer;
const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),scale=(a,k)=>a.map(x=>x*k),norm=a=>Math.hypot(...a);
// 여러 평면으로 잘라 본 단면의 변의 개수 최댓값
function maxSidesFound(){let best=0;for(const n of [[1,1,1],[1,2,3],[3,2,1],[1,1,2],[2,3,5],[1,-1,2],[2,1,1],[1,3,2]]){const [lo,hi]=dRange(n);for(let i=0;i<=80;i++)best=Math.max(best,cubeSection(n,lo+(hi-lo)*i/80).length)}return best}
export function verifyLabsMath(){
 assert.equal(labs.length,8);assert.equal(new Set(labs.map(l=>l.id)).size,8);
 // 실험별 독립 계산값 (문항 데이터의 정답 문자열과 별도로 계산)
 const hex=cubeSection([1,1,1],3);
 const shortest=(()=>{const A=[1,2,3],B=[5,4,1],A2=[1,2,-3],t=3/(3+1),P=add(A2,scale(sub(B,A2),t));let best=Infinity;for(let x=0;x<=6;x+=.01)for(let y=0;y<=6;y+=.05)best=Math.min(best,norm(sub(A,[x,y,0]))+norm(sub(B,[x,y,0])));return {A2z:A2[2],min:norm(sub(A2,B)),P,best}})();
 const u=[1,2,0],v=[0,1,2],w=add(u,scale(v,2));
 const lp=(()=>{const A=[1,0,2],d=[1,1,-1],n=[1,2,1],t=(11-dot(n,A))/dot(n,d);return {t,P:add(A,scale(d,t)),k:-(1+1)/2}})();
 const cos=(a,b)=>dot(a,b)/(norm(a)*norm(b));
 const computed={
  'cube-section':[null,maxSidesFound(),dot([1,1,1],[1,1,1]),perimeterSides(hex)[0]],
  'shadow':[16*Math.cos(Math.PI/3),Math.acos(8*Math.sqrt(3)/16),4*Math.PI*Math.cos(Math.PI/3)],
  'shortest-path':[shortest.A2z,shortest.min,shortest.P[0],shortest.P[1]],
  'tangent-sphere':[Math.hypot(3,4),4,1+16],
  'vector-ops':[...w,norm(w),null],
  'boat':[Math.hypot(4,3),60/4,3*(1/4),Math.sqrt(25-9)],
  'line-plane':[lp.t,lp.P[2],null,lp.k],
  'similarity':[cos([1,2,2],[2,1,2]),cos([1,2,2],[2,4,4]),null]
 };
 for(const lab of labs){
  assert.ok(lab.steps.length>=3&&lab.facts&&lab.intro&&lab.summary,lab.id);assert.equal(computed[lab.id].length,lab.checks.length,lab.id);
  lab.checks.forEach((f,i)=>{if(f.type==='choice'){assert.ok(Number.isInteger(f.answer)&&f.answer>=0&&f.answer<f.options.length);return}const v=parse(f.answer);assert.ok(Number.isFinite(v),lab.id+' '+f.answer);near(v,computed[lab.id][i]);assert.equal(grade(f,f.answer),'correct')});
  for(const id of lab.related)assert.ok(bankQuestions.some(b=>b.id===id),lab.id+' 관련 문항 '+id);
 }
 // 선택형 정답과 실험 계산의 일치
 assert.equal(hex.length,6);assert.equal(classify(hex),'정육각형');
 const maxSides=Math.max(...[[1,1,1],[1,2,3],[3,2,1],[1,1,2],[2,3,5],[1,-1,2]].flatMap(n=>{const [lo,hi]=dRange(n);return Array.from({length:41},(_,i)=>cubeSection(n,lo+(hi-lo)*i/40).length)}));assert.equal(maxSides,6);
 assert.match(labs.find(l=>l.id==='cube-section').checks[0].options[0],/면은 6개/);assert.ok(!labs.find(l=>l.id==='cube-section').steps.join(' ').includes('칠각형'));
 near(shortest.best,6,.02);assert.ok(shortest.best>=6-1e-9);
 const sim=[[1,3,0],[6,1,2],[0,2,5]].map(b=>cos([3,0,1],b));assert.equal(sim.indexOf(Math.max(...sim)),labs.find(l=>l.id==='similarity').checks[2].answer);
 assert.equal(dot([1,2,1],[1,-1,1]),0);assert.notEqual(dot([1,2,1],[-1,0,1]),6); // line-plane k=-1에서 평행, A는 평면 밖
 for(const [n,d,k,name] of [[[1,1,1],1,3,'정삼각형'],[[0,0,1],1,4,'정사각형'],[[1,1,0],2,4,'직사각형'],[[1,1,3],4,4,'마름모'],[[2,2,1],3,4,'사다리꼴'],[[1,1,2],3,5,'오각형']]){const p=cubeSection(n,d);assert.equal(p.length,k);assert.equal(classify(p),name)}
}
const base='http://127.0.0.1:4175/dist/';
const state=tab=>tab.evaluate(()=>window.labState);
const setRange=(tab,label,value)=>tab.getByLabel(label,{exact:true}).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}))},value);
const setVector=async(tab,legend,values)=>{const inputs=tab.locator('fieldset.lab-vector',{hasText:legend}).locator('input');for(const [i,v] of values.entries())await inputs.nth(i).fill(String(v))};
export async function verifyLabsUI(tab){
 await tab.setViewportSize({width:1280,height:900});
 await tab.goto(base+'index.html');const hrefs=await tab.locator('#labs a[href^="lab-"]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));assert.equal(hrefs.length,8);
 const errors=[];tab.on('pageerror',e=>errors.push(e.message));
 for(const lab of labs){
  await tab.goto(base+`lab-${lab.id}.html`);await tab.waitForFunction(()=>window.labState);
  assert.ok(['3d','svg','fallback'].includes(await tab.locator('#lab-view').getAttribute('data-ready')),lab.id);
  assert.equal(await tab.locator('.katex-error').count(),0);assert.ok(await tab.locator('form.autocheck').isVisible());assert.equal(await tab.locator('form.autocheck .check-field').count(),lab.checks.length);
  const links=await tab.locator('main a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));for(const href of new Set(links))assert.equal((await tab.request.get(new URL(href,tab.url()).href)).status(),200,href);
  for(const width of [390,320]){await tab.setViewportSize({width,height:800});assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),lab.id+' '+width)}
  await tab.setViewportSize({width:1280,height:900});
 }
 // 조작 → 계산 결과
 await tab.goto(base+'lab-cube-section.html');await tab.waitForFunction(()=>window.labState);await setVector(tab,'법선벡터',[1,1,1]);await setRange(tab,'d (평면의 위치)',3);let s=await state(tab);assert.equal(s.sides,6);assert.equal(s.shape,'정육각형');
 await tab.getByRole('button',{name:'사다리꼴'}).click();s=await state(tab);assert.equal(s.shape,'사다리꼴');assert.match(await tab.locator('.lab-tracker').textContent(),/6각형 ✓/);
 await tab.goto(base+'lab-shadow.html');await tab.waitForFunction(()=>window.labState);await tab.getByRole('button',{name:'60°'}).click();s=await state(tab);near(s.shadow,8);await tab.getByLabel('판의 모양').selectOption('circle');s=await state(tab);near(s.shadow,2*Math.PI);
 await tab.goto(base+'lab-shortest-path.html');await tab.waitForFunction(()=>window.labState);await setRange(tab,'P의 x좌표',4);await setRange(tab,'P의 y좌표',3.5);s=await state(tab);near(s.sum,6);await tab.getByRole('checkbox',{name:/대칭이동한 점/}).check();assert.match(await tab.locator('.lab-status').textContent(),/A'P/);
 await tab.goto(base+'lab-tangent-sphere.html');await tab.waitForFunction(()=>window.labState);await tab.getByLabel('반지름 직접 입력').fill('5');s=await state(tab);assert.equal(s.tangent,true);await tab.getByLabel('접하게 할 대상').selectOption('xy');s=await state(tab);assert.equal(s.tangent,false);await tab.getByLabel('반지름 직접 입력').fill('4');assert.equal((await state(tab)).tangent,true);
 await tab.goto(base+'lab-vector-ops.html');await tab.waitForFunction(()=>window.labState);await setRange(tab,'t (v의 계수)',2);s=await state(tab);assert.deepEqual(s.w,[1,4,4]);
 await tab.goto(base+'lab-boat.html');await tab.waitForFunction(()=>window.labState);await setRange(tab,'강물의 속력',3);s=await state(tab);near(s.speed,5);near(s.minutes,15);await tab.getByRole('button',{name:'배 5, 강물 3'}).click();await setRange(tab,'뱃머리 방향 (북쪽에서 서쪽으로 + 각)',37);s=await state(tab);assert.ok(Math.abs(s.drift)<.02);assert.ok(Math.abs(s.speed-4)<.05);
 await tab.goto(base+'lab-line-plane.html');await tab.waitForFunction(()=>window.labState);await setVector(tab,'직선 위의 점 A',[1,0,2]);await setVector(tab,'방향벡터 u',[1,1,-1]);await setRange(tab,'d',11);s=await state(tab);near(s.t,4);assert.deepEqual(s.P.map(x=>Math.round(x*1e9)/1e9),[5,4,-2]);
 await tab.getByRole('button',{name:'처음 상태'}).click();await tab.getByRole('button',{name:'u를 n과 수직으로'}).click();s=await state(tab);assert.equal(s.dot,0);assert.match(s.relation,/평행/);
 await tab.goto(base+'lab-similarity.html');await tab.waitForFunction(()=>window.labState);await setVector(tab,'학생 B의 점수',[2,1,2]);s=await state(tab);near(s.cos,8/9);await tab.getByRole('button',{name:'b를 a의 2배로'}).click();near((await state(tab)).cos,1);
 // 실험 확인 문제 자동 채점
 await tab.goto(base+'lab-cube-section.html');await tab.locator('form.autocheck input[name=f0][value="0"]').check();await tab.locator('form.autocheck input[name=f1]').fill('6');await tab.locator('form.autocheck input[name=f2]').fill('3');await tab.locator('form.autocheck input[name=f3]').fill('√2');await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.check-result').filter({hasText:'모두 맞았어요'}).waitFor();
 assert.deepEqual(errors,[]);
 await tab.goto(base+'lab-cube-section.html');await tab.waitForFunction(()=>window.labState);await tab.waitForTimeout(300);await tab.locator('.lab-stage').screenshot({path:'output/qa/lab-cube.png'});
}
