import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';import katex from 'katex';
import {TYPES,generate,TOPIC_TYPES,ITEM_TYPES,byId} from '../public/drill/generators.js';
import {compute,credit} from '../public/readiness.js';
import {bankQuestions} from '../content/bank.mjs';
import {questions} from '../content/course.mjs';
import {labs} from '../content/labs.mjs';
const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('../public/answer.js',import.meta.url),'utf8'),sandbox);const {parse,grade}=sandbox.GeometryAnswer;
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),scale=(a,k)=>a.map(x=>x*k),norm=a=>Math.hypot(...a),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const rad=d=>d*Math.PI/180;
// 유형별 독립 계산: 생성기 내부 정답 문자열과 별도로 params(또는 문제 문장)에서 다시 계산한다.
const expect={
 dist:p=>[norm(sub(p.B,p.A))],
 sym:p=>{const f={'xy평면':[1,1,-1],'yz평면':[-1,1,1],'zx평면':[1,-1,1],'x축':[1,-1,-1],'y축':[-1,1,-1],'z축':[-1,-1,1],'원점':[-1,-1,-1]}[p.target];return p.P.map((x,i)=>x*f[i])},
 divide:p=>scale(add(scale(p.A,p.n),scale(p.B,p.m)),1/(p.m+p.n)),
 centroid:p=>scale(add(add(p.A,p.B),p.C),1/3),
 'sphere-eq':(p,g)=>{const m=g.prompt.match(/x\^2\+y\^2\+z\^2(.*)=0/)[1];const co={x:0,y:0,z:0,c:0};for(const t of m.match(/[+-]\d+[xyz]?/g)||[]){const v=parseInt(t);const k=/[xyz]$/.test(t)?t.slice(-1):'c';co[k]+=v}const c=['x','y','z'].map(k=>-co[k]/2);return [...c,Math.sqrt(dot(c,c)-co.c)]},
 'sphere-section':p=>{const i={'xy평면':2,'yz평면':0,'zx평면':1}[p.plane],s=Math.sqrt(p.r*p.r-p.c[i]**2);return [s,Math.PI*s*s]},
 'sphere-tangent':p=>{const b=dot(p.n,p.C),l=norm(p.n);return [b-l*p.r,b+l*p.r]},
 projection:(p,g)=>g.fields[0].type==='angle'?[Math.acos(p.area/p.S)]:[p.S*Math.cos(rad(p.deg))],
 'three-perp':(p,g)=>g.fields.length===2?[Math.hypot(p.PH,p.HQ),0]:[Math.sqrt(p.PQ**2-p.PH**2)],
 skew:p=>{const n=cross(p.d1,p.d2);if(norm(n)<1e-12){assert.ok(norm(cross(sub(p.B,p.A),p.d1))>1e-9,'평행인데 같은 직선');return [0]}return [Math.abs(dot(sub(p.B,p.A),n))<1e-12?1:2]},
 'vec-op':p=>add(scale(p.a,p.p),scale(p.b,p.q)),
 'vec-parallel':p=>[p.k*p.a[p.i],p.k>0?0:1],
 'vec-perp':(p,g)=>{const b=[...p.b];b[p.i]=parse(g.fields[0].answer);assert.ok(Math.abs(dot(p.a,b))<1e-9);return [-(dot(p.a,p.b)-p.a[p.i]*p.b[p.i])/p.a[p.i]]},
 'vec-dotdef':p=>{const d=p.A*p.B*Math.cos(rad(p.deg));return [d,Math.sqrt(p.A**2+p.B**2+(p.plus?2:-2)*d)]},
 'vec-norm':p=>{const n=norm(p.a);return [n,p.a[0]/n,p.a[1]/n,p.a[2]/n]},
 'vec-angle':p=>[dot(p.a,p.b),Math.acos(dot(p.a,p.b)/(norm(p.a)*norm(p.b)))],
 'line-foot':p=>{const t=dot(sub(p.P,p.A),p.d)/dot(p.d,p.d),Q=add(p.A,scale(p.d,t));return [...Q,norm(sub(p.P,Q))]},
 'plane-eq':p=>[dot(p.n,p.A)],
 'plane-dist':p=>[Math.abs(dot(p.n,p.A)-p.k)/norm(p.n)],
 'line-plane':p=>{const t=(p.k-dot(p.n,p.A))/dot(p.n,p.d);return [t,...add(p.A,scale(p.d,t))]},
 'min-length':p=>[p.ab/p.B**2,Math.sqrt(p.A**2-p.ab**2/p.B**2)]
};
const tex=s=>{for(const m of String(s).matchAll(/\$([^$]+)\$/g))katex.renderToString(m[1],{throwOnError:true})};
export function verifyExam(){
 assert.equal(TYPES.length,21);assert.deepEqual(Object.keys(expect).sort(),TYPES.map(t=>t.id).sort());
 let count=0;
 for(const t of TYPES){const seen=new Set();
  for(let seed=1;seed<=400;seed++){const g=generate(t.id,seed);count++;
   const text=JSON.stringify(g);assert.ok(!/NaN|undefined|Infinity|\[object/.test(text),`${t.id} #${seed}: ${text.slice(0,200)}`);
   tex(g.prompt);tex(g.solution);g.hints.forEach(tex);g.fields.forEach(f=>tex(f.label));assert.equal(g.hints.length,2);
   const want=expect[t.id](g.params,g);assert.equal(want.length,g.fields.length,t.id);
   g.fields.forEach((f,i)=>{if(f.type==='choice'){assert.equal(f.answer,want[i],`${t.id} #${seed} 선택형`);return}const v=parse(f.answer);assert.ok(Number.isFinite(v),`${t.id} #${seed} ${f.answer}`);assert.ok(Math.abs(v-want[i])<1e-9,`${t.id} #${seed} 칸${i}: ${f.answer} vs ${want[i]}`);assert.equal(grade(f,f.answer),'correct')});
   seen.add(g.prompt)}
  assert.ok(seen.size>=30,`${t.id} 변형이 너무 적음(${seen.size})`);
  assert.equal(JSON.stringify(generate(t.id,77)),JSON.stringify(generate(t.id,77)));
 }
 // 문제은행 유형·복습·실험 → 변형 유형 연결
 for(const q of bankQuestions.filter(q=>q.unit!=='conics')){const ts=TOPIC_TYPES[q.unit+'|'+q.topic];assert.ok(ts&&ts.length,`${q.id} ${q.topic} 연결 없음`);ts.forEach(id=>assert.ok(byId[id]))}
 for(const q of questions)assert.ok(ITEM_TYPES[q.id]?.every(id=>byId[id]),q.id);
 for(const l of labs.filter(l=>l.unit!=='conics'))assert.ok(ITEM_TYPES['lab-'+l.id]?.every(id=>byId[id]),l.id);
 // 준비도·예상 점수
 const items=[...bankQuestions.filter(q=>q.unit!=='conics').map(q=>({id:q.id,unit:q.unit,stage:q.stage})),...labs.filter(l=>l.unit!=='conics').map(l=>({id:'lab-'+l.id,unit:l.unit,stage:'실험'}))];
 assert.equal(items.length,48);
 let r=compute({items});assert.equal(r.prediction,null);assert.equal(r.need.total,15);assert.equal(r.units.space.mastery,0);
 const all=(fn)=>Object.fromEntries(items.map((i,k)=>[i.id,fn(i,k)]));
 r=compute({items,grades:all(()=>({tries:1,solved:true}))});assert.ok(r.prediction.low>=90&&r.prediction.high===100,JSON.stringify(r.prediction));assert.equal(r.level,'탄탄해요');near(r.units.space.mastery,1);
 r=compute({items,grades:all(()=>({tries:1,solved:false}))});assert.ok(r.prediction.high<=15,JSON.stringify(r.prediction));
 // 15문항 이상이어도 한 단원이 4문항 미만이면 예측하지 않는다
 const sp=items.filter(i=>i.unit==='space').slice(0,14),ve=items.filter(i=>i.unit==='vectors').slice(0,3);
 r=compute({items,grades:Object.fromEntries([...sp,...ve].map(i=>[i.id,{tries:1,solved:true}]))});assert.equal(r.prediction,null);assert.equal(r.need.perUnit.vectors,1);
 // 남은 오답은 맞혔어도 0.5, 졸업은 1, 여러 번 만에 맞히면 0.8
 assert.equal(credit('x',{x:{tries:1,solved:true}},{x:{status:'open'}}),.5);assert.equal(credit('x',{x:{tries:3,solved:false}},{x:{status:'graduated'}}),1);assert.equal(credit('x',{x:{tries:2,solved:true}},{}),.8);assert.equal(credit('x',{},{}),null);assert.equal(credit('x',{},{x:{status:'open'}}),0);
 // 범위: 푼 문제가 많을수록 좁아지고, 항상 0~100 안
 const half=n=>{const pick=items.filter((_,k)=>k%Math.ceil(48/n)===0);const g=Object.fromEntries(pick.map((i,k)=>[i.id,{tries:1,solved:k%3!==0}]));const x=compute({items,grades:g});return x.prediction?x.prediction.high-x.prediction.low:null};
 const w16=half(16),w48=half(48);assert.ok(w16!==null&&w48!==null&&w48<w16,`${w16} ${w48}`);
 for(let s=0;s<200;s++){const g=all((i,k)=>Math.random()<.6?{tries:1+(k%3),solved:Math.random()<.7}:undefined);for(const k in g)if(!g[k])delete g[k];const x=compute({items,grades:g});if(x.prediction){assert.ok(x.prediction.low>=0&&x.prediction.high<=100&&x.prediction.low<=x.prediction.mid&&x.prediction.mid<=x.prediction.high)}}
 return count;
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const base='http://127.0.0.1:4175/dist/';
export async function verifyExamUI(b){
 const ctx=await b.newContext({viewport:{width:1280,height:900}});const tab=await ctx.newPage();const errors=[];tab.on('pageerror',e=>errors.push(e.message));
 await tab.goto(base+'index.html#review');await tab.waitForFunction(()=>window.examReady);assert.match(await tab.locator('.er-score').textContent(),/15문항 더 풀면/);assert.equal(await tab.locator('.er-gauge').count(),2);assert.ok(await tab.locator('#review-path').count());
 await tab.evaluate(()=>{const ids=JSON.parse(document.querySelector('#exam-ready-data').textContent).items.map(i=>i.id);const g={};ids.slice(0,10).forEach(id=>g[id]={tries:1,solved:true});ids.slice(24,34).forEach((id,k)=>g[id]={tries:1,solved:k%2===0});localStorage.setItem('geometry-bank-grade-v1',JSON.stringify(g));localStorage.setItem('geometry-mistakes-v1',JSON.stringify({'b-v03':{id:'b-v03',status:'open',reason:'calc',lastWrong:'2026-11-26',wrongCount:1},'2-06':{id:'2-06',status:'open',reason:'',lastWrong:'2026-11-26',wrongCount:1}}))});
 await tab.reload();await tab.waitForFunction(()=>window.examReady?.prediction);const p=await tab.evaluate(()=>window.examReady.prediction);assert.match(await tab.locator('.er-score').textContent(),new RegExp(`준비도 ${p.low}~${p.high}%`));assert.ok(!/예상 (기말고사 )?점수/.test(await tab.locator('#review').textContent()));assert.equal(await tab.locator('.er-steps li.now').count(),1);
 assert.equal(await tab.locator('.er-type').count(),2);const links=await tab.locator('.er-type .er-primary').evaluateAll(a=>a.map(x=>x.getAttribute('href')));assert.deepEqual(links.sort(),['drill.html?type=line-plane','drill.html?type=vec-perp']);
 for(const w of [390,320]){await tab.setViewportSize({width:w,height:800});assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
 await tab.setViewportSize({width:1280,height:900});await tab.locator('#review').screenshot({path:'output/qa/exam-ready.png'});
 // 변형 문제 연습: 같은 번호는 같은 문제, 정답 입력 → 연속 정답, 오답 → 초기화, 3연속 → 완료
 await tab.goto(base+'drill.html?type=vec-perp&seed=42');await tab.waitForFunction(()=>window.renderedDrill);const first=await tab.locator('.drill-prompt').textContent();await tab.reload();await tab.waitForFunction(()=>window.renderedDrill);assert.equal(await tab.locator('.drill-prompt').textContent(),first);assert.equal(await tab.locator('.katex-error').count(),0);
 const solve=async(right)=>{const fields=await tab.evaluate(()=>window.renderedDrill.fields);for(const [i,f] of fields.entries()){if(f.type==='choice')await tab.locator(`input[name=f${i}][value="${right?f.answer:(f.answer+1)%f.options.length}"]`).check();else await tab.locator(`input[name=f${i}]`).fill(right?f.answer:'12345')}await tab.locator('.drill-form button[type=submit]').click()};
 await solve(true);await tab.locator('.check-result').filter({hasText:'맞았어요'}).waitFor();assert.match(await tab.locator('#drill-stats').textContent(),/연속 정답 1/);
 await tab.locator('#drill-next').click();await solve(false);await tab.locator('.check-result').filter({hasText:'다시 확인'}).waitFor();assert.match(await tab.locator('#drill-stats').textContent(),/연속 정답 0/);
 for(let k=0;k<3;k++){await tab.locator('#drill-next').click();await solve(true);await tab.locator('.check-result').filter({hasText:'맞았어요'}).waitFor()}assert.match(await tab.locator('#drill-stats').textContent(),/연습 완료/);
 await tab.locator('#drill-type').selectOption('skew');await tab.waitForFunction(()=>window.renderedDrill.type==='skew');await solve(true);await tab.locator('.check-result').filter({hasText:'맞았어요'}).waitFor();
 for(const t of ['dist','sphere-eq','projection','line-foot','min-length','vec-dotdef']){await tab.goto(base+`drill.html?type=${t}&seed=9`);await tab.waitForFunction(()=>window.renderedDrill);assert.equal(await tab.locator('.katex-error').count(),0);await solve(true);await tab.locator('.check-result').filter({hasText:'맞았어요'}).waitFor()}
 for(const w of [390,320]){await tab.setViewportSize({width:w,height:800});assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
 await tab.goto(base+'index.html#review');await tab.waitForFunction(()=>window.examReady);assert.match(await tab.locator('.er-type',{hasText:'수직 조건'}).textContent(),/완료/);
 assert.deepEqual(errors,[]);await ctx.close();
}
