import assert from 'node:assert/strict';
import {bankQuestions} from '../content/bank.mjs';
import fs from 'node:fs';import vm from 'node:vm';
const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('../public/answer.js',import.meta.url),'utf8'),sandbox);const {parse,grade}=sandbox.GeometryAnswer;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0), sub=(a,b)=>a.map((x,i)=>x-b[i]), add=(a,b)=>a.map((x,i)=>x+b[i]), scale=(a,k)=>a.map(x=>x*k), norm=a=>Math.sqrt(dot(a,a));
export function verifyBankMath(){
 const computed={
 'b-c01':[16/4,0,-16/4,16/4], 'b-c02':[Math.sqrt(36-20),2*Math.sqrt(36),2*Math.sqrt(20)],'b-c03':[Math.sqrt(16+9),Math.sqrt(9/16)],'b-c04':[-2,(3-1)/2,4*(3-(3-1)/2)],
 'b-c05':[3/18*12,2/8*12,12],'b-c06':[3/3,3/9,2*3/3], 'b-c07':[4/8*2,-1*2,2,4], 'b-c08':[-Math.sqrt((25-16)/9),Math.sqrt((25-16)/9),9/5,16/5],
 'b-s01':[dot([1,0,0],[0,1,0]),2-0],'b-s02':[30*Math.cos(Math.PI/3)],'b-s03':[Math.hypot(...sub([4,-2,6],[-2,1,4]))], 'b-s04':[Math.hypot(6,8)],'b-s05':[-1+2/3*9,2+2/3*(-6),0+2/3*6], 'b-s06':[-4/2,6/2,2/2,Math.sqrt(11+4+9+1)],'b-s07':[1,-2,6,Math.sqrt(25-(6-3)**2)],'b-s08':[dot([2,1,-1],[1,2,2])-2*Math.hypot(1,2,2),dot([2,1,-1],[1,2,2])+2*Math.hypot(1,2,2)],
 'b-v01':[3*2-2,3*(-1)-2*3,3-2*(-2)],'b-v02':[2*(-2),6/(-3)],'b-v03':[dot([1,2,-2],[2,1,2])], 'b-v04':[dot([1,1,0],[0,1,1]),Math.acos(1/(Math.hypot(1,1)*Math.hypot(1,1)))], 'b-v05':[2,0,-1,...sub([-1,6,2],[2,0,-1]).map(x=>x/3)],'b-v06':[2,1,-2,dot([1,2,-1],[2,1,-2])], 'b-v07':[(9-3)/2,1+2*3,3,2-3], 'b-v08':[6/16,Math.sqrt(9-36/16)],
 // 2차 확장 36문항: 문항 데이터와 독립적으로 정의·공식에서 다시 계산한다.
 'b-c09':[0,-8/4,8/4],'b-c10':[Math.sqrt(25-9),2*5,2*3],'b-c11':[Math.sqrt(16+9),Math.sqrt(16),Math.sqrt(16)/Math.sqrt(9)],'b-c12':[(10/2)**2,(10/2)**2-3**2],'b-c13':[(6/2)**2,5**2-(6/2)**2],
 'b-c14':[7-8/4,Math.sqrt(8*(7-8/4))],'b-c15':[1,-2,1+Math.sqrt(25-9),1-Math.sqrt(25-9)],'b-c16':[2*1/4,2*1*4/4],'b-c17':[Math.sqrt(4*1+1),-Math.sqrt(4*1+1)],'b-c18':[Math.sqrt(4*4-5),-Math.sqrt(4*4-5)],
 'b-c19':[2*5+2*Math.sqrt(25-9),((2*5)**2-(2*Math.sqrt(25-9))**2)/4],'b-c20':[6,(()=>{const r=[3-2*Math.SQRT2,3+2*Math.SQRT2];return Math.hypot(r[1]-r[0],(r[1]-1)-(r[0]-1))})()],
 'b-s09':[3,-2,-5,-3,-2,-5],'b-s10':[...scale(add([1,-3,2],[5,1,-4]),.5),norm(scale(add([1,-3,2],[5,1,-4]),.5))],'b-s11':[10*Math.cos(Math.PI/6)],'b-s12':[1,-2,3,dot([1,-2,3],[1,-2,3])],
 'b-s13':[(dot([3,0,-1],[3,0,-1])-dot([1,2,3],[1,2,3]))/(2*(3-1))],'b-s14':scale(add(add([1,2,-1],[3,-2,4]),[-1,3,0]),1/3),'b-s15':[Math.acos(8*Math.SQRT2/16)],'b-s16':[Math.sqrt(25-3**2),Math.sqrt(25-2**2)],
 'b-s17':[Math.hypot(2,2)/2,Math.hypot(2,Math.hypot(2,2)/2)],'b-s18':[Math.sqrt(3)/4*Math.hypot(2,2)**2,2/(Math.sqrt(3)/4*Math.hypot(2,2)**2)],'b-s19':[3,norm(sub([5,2,4],[1,-2,2])),norm(sub([5,2,4],[1,-2,2]))+3,norm(sub([5,2,4],[1,-2,2]))-3],'b-s20':[(25-13+36)/12,Math.sqrt(25-((25-13+36)/12)**2)],
 'b-v09':[norm([2,-1,2]),...scale([2,-1,2],1/norm([2,-1,2]))],'b-v10':[...sub([3,-1,2],[1,4,-2]),norm(sub([3,-1,2],[1,4,-2]))],'b-v11':[-(3*1-1*4)/2],'b-v12':[2*3*Math.cos(2*Math.PI/3),Math.sqrt(4+2*2*3*Math.cos(2*Math.PI/3)+9)],
 'b-v13':add([1,0,2],sub([4,3,1],[3,1,0])),'b-v14':[dot([1,-1,0],[0,1,-1]),Math.acos(dot([1,-1,0],[0,1,-1])/(norm([1,-1,0])*norm([0,1,-1])))],'b-v15':[dot([1,2,2],[3,0,4]),.5*Math.sqrt(dot([1,2,2],[1,2,2])*dot([3,0,4],[3,0,4])-dot([1,2,2],[3,0,4])**2)],
 'b-v16':(()=>{const a=[1,0,1],d=[1,1,1],p=[3,1,4],t=dot(sub(p,a),d)/dot(d,d),q=add(a,scale(d,t));return [...q,norm(sub(p,q))]})(),'b-v17':[Math.abs(dot([1,2,-2],[3,-1,2])-6)/norm([1,2,-2])],
 'b-v18':(()=>{const k=-(2*1-1*3)/2;return [k,3/norm([2,-1,k])]})(),'b-v19':[...scale(add([1,0,3],[3,4,-1]),.5),Math.sqrt(7+dot(sub([3,4,-1],[1,0,3]),sub([3,4,-1],[1,0,3]))/4)],'b-v20':(()=>{const a=[1,2,0],d=[1,0,1],t=-dot(a,d)/dot(d,d);return [t,norm(add(a,scale(d,t)))]})()
 };
 assert.equal(bankQuestions.length,60);assert.equal(new Set(bankQuestions.map(q=>q.id)).size,60);
 for(const q of bankQuestions){assert.ok(computed[q.id]);assert.equal(q.expected.length,computed[q.id].length);q.expected.forEach((v,i)=>near(v,computed[q.id][i]));assert.equal(q.hints.length,2);for(const key of ['prompt','answer','solution','misconception','topic'])assert.ok(q[key]);assert.ok(['original-v1','original-v2'].includes(q.provenance))}
 for(const unit of ['conics','space','vectors']){const qs=bankQuestions.filter(q=>q.unit===unit);assert.equal(qs.length,20);assert.deepEqual(['기본','적용','도전'].map(stage=>qs.filter(q=>q.stage===stage).length),[7,8,5])}
 // Independent geometric substitution checks beyond answer metadata.
 near(3**2/18+2**2/8,1);near(2*3+3*2,12);
 for(const x of [-2,0,1,5])near(x*x/8-(x/2-1)**2-1,-((x-4)**2)/8);
 for(const m of [-1,1]){const x=-9*m/5,y=16/5;near(x*x/9+y*y/16,1);near(y,m*x+5);near(90*m*90*m-4*(16+9*m*m)*81,0)}
 for(const t of [-2,0,3]){const p=[2-t,2*t,-1+t];near((p[0]-2)/(-1),p[1]/2);near(p[2]+1,t)}
 for(const k of [-4,8])near(Math.abs(2-k)/3,2);
 for(const t of [-3,0,.375,2]){near(9-12*t+16*t*t,16*(t-.375)**2+27/4);assert.ok(9-12*t+16*t*t>=27/4)}
 // 2차 확장 문항의 조건 대입 검사 (정답 데이터와 별도).
 {const [x,y]=[4,-2];near(x*x,-8*y);near(Math.hypot(x-0,y+2),Math.abs(y-2))} // c09 초점·준선 거리
 for(const [x,y] of [[0,4],[5,0],[3,16/5]]){near(x*x/25+y*y/16,1);near(Math.hypot(x-3,y)+Math.hypot(x+3,y),10)} // c12 정의
 for(const [x,y] of [[0,3],[4,3*Math.sqrt(2)]]){near(y*y/9-x*x/16,1);near(Math.abs(Math.hypot(x,y-5)-Math.hypot(x,y+5)),6)} // c13 정의
 near((2*Math.sqrt(10))**2,8*5);near(Math.hypot(5-2,2*Math.sqrt(10)),7); // c14
 for(const x of [-1,0,4,7])near((x/2+2)**2-4*x,(x/2-2)**2); // c16 중근
 for(const n of [Math.sqrt(5),-Math.sqrt(5)])near((2*n)**2-4*(5/4)*(n*n-1),0); // c17 판별식
 for(const n of [Math.sqrt(11),-Math.sqrt(11)])near((16*n)**2-4*11*(4*n*n+20),0); // c18 판별식
 {const pf=5+Math.sqrt(7),pf2=5-Math.sqrt(7);near(pf+pf2,10);near(pf*pf+pf2*pf2,64);near(pf*pf2/2,9)} // c19 실제 점 존재
 for(const x of [3-2*Math.SQRT2,3+2*Math.SQRT2])near((x-1)**2,4*x); // c20 교점
 near(Math.hypot(-1-1,0-2,0-3),Math.hypot(-1-3,0,0+1)); // s13
 near(dot([0,1,-1],[1,1,1]),0); near(dot([.5,2,-.5],[1,0,1]),0); // v16, v20 수직
 for(const p of [[2,2,5],[2,6,1],[6,2,1],[-2,2,1]]){near(dot(sub([1,0,3],p),sub([3,4,-1],p)),7)} // v19: 중심에서 반지름 4인 점
 near(dot([2,-1,.5],[1,3,2]),0); // v18 법선 수직
 for(const [y,z] of [[3,0],[0,3],[-3,0]]){near(4*4+y*y+z*z,25);near((4-6)**2+y*y+z*z,13)} // s20
 near(Math.sqrt(2)/Math.sqrt(6),Math.sqrt(3)/3); // s18 두 방법 일치
 // 자동 채점 칸: 숫자 정답은 검산된 expected 중 하나와 같아야 하고, 선택형 정답은 보기 범위 안이어야 한다.
 for(const q of bankQuestions){assert.ok(q.checks.length>=1,q.id+' 채점 칸 없음');for(const f of q.checks){assert.ok(f.label);if(f.type==='choice'){assert.ok(Number.isInteger(f.answer)&&f.answer>=0&&f.answer<f.options.length,q.id)}else{const v=parse(f.answer);assert.ok(Number.isFinite(v),q.id+' 정답식 해석 실패 '+f.answer);assert.ok(q.expected.some(e=>Math.abs(e-v)<1e-9),q.id+' 채점 정답 '+f.answer+'이 검산값에 없음');assert.equal(grade(f,f.answer),'correct')}}}
 const choice=id=>bankQuestions.find(q=>q.id===id).checks.find(f=>f.type==='choice');
 assert.equal(choice('b-s01').options[choice('b-s01').answer],'꼬인 위치에 있다');assert.equal(choice('b-v02').options[choice('b-v02').answer],'반대 방향');assert.equal(choice('b-c10').options[choice('b-c10').answer],'y축');
 // 수식 해석기
 const cases=[['3/8',.375],['-1/2',-.5],['2√3',2*Math.sqrt(3)],['3√3/2',3*Math.sqrt(3)/2],['√(5)',Math.sqrt(5)],['sqrt 11',Math.sqrt(11)],['루트2',Math.SQRT2],['2π/3',2*Math.PI/3],['pi/4',Math.PI/4],['2^3',8],['x = 4',4],['k=-4',-4],['１／２',.5],['−3',-3],['2(3+1)',8],['0.5',.5]];
 for(const [input,value] of cases)near(parse(input),value);
 for(const input of ['','abc','1.2.3','2/0','√-4','alert(1)','('.repeat(5),'1'.repeat(61)])assert.ok(Number.isNaN(parse(input)),input);
 const num={type:'number',answer:'4√5'};assert.equal(grade(num,'4√5'),'correct');assert.equal(grade(num,'√80'),'correct');assert.equal(grade(num,'8.944'),'approx');assert.equal(grade(num,'8.9'),'wrong');assert.equal(grade(num,'9'),'wrong');assert.equal(grade(num,'hello'),'invalid');assert.equal(grade(num,'  '),'empty');
 const ang={type:'angle',answer:'π/3'};assert.equal(grade(ang,'60'),'correct');assert.equal(grade(ang,'60°'),'correct');assert.equal(grade(ang,'π/3'),'correct');assert.equal(grade(ang,'120'),'wrong');
 assert.equal(grade({type:'choice',answer:2},'2'),'correct');assert.equal(grade({type:'choice',answer:2},'0'),'wrong');assert.equal(grade({type:'choice',answer:2},''),'empty');
}
export async function verifyBankUI(tab,b){
 await tab.goto('http://127.0.0.1:4175/dist/bank.html');assert.equal(await tab.locator('.bank-card').count(),60);
 for(const width of [1440,768,390,320]){await tab.setViewportSize({width,height:1000});assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await tab.locator('[name=unit]').selectOption('conics');assert.equal(await tab.locator('.bank-card:visible').count(),20);await tab.locator('[name=level]').selectOption('도전');assert.equal(await tab.locator('.bank-card:visible').count(),5);await tab.locator('[name=search]').fill('외부');assert.equal(await tab.locator('.bank-card:visible').count(),1);await tab.reload();assert.equal(await tab.locator('.bank-card:visible').count(),1);
 await tab.locator('[name=search]').fill('없는유형');assert.ok(await tab.locator('#bank-empty').isVisible());await tab.locator('button[type=reset]').click();await tab.waitForFunction(()=>document.querySelectorAll('.bank-card:not([hidden])').length===60);
 const urls=await tab.locator('.bank-card h3 a').evaluateAll(els=>els.map(e=>e.href));
 for(const url of urls){await tab.goto(url);assert.equal(await tab.locator('.question').count(),1);assert.ok(await tab.locator('form.autocheck').isVisible());assert.ok(await tab.locator('.check-field').count()>=1);assert.equal(await tab.locator('.katex-error').count(),0);await tab.locator('textarea:not([disabled])').waitFor();await tab.locator('[data-panel=hint]').click();assert.ok(await tab.locator('[data-view=hint]').isVisible());await tab.locator('[data-panel=solution]').click();assert.ok(await tab.locator('[data-view=solution]').isVisible());assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const links=await tab.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));for(const href of new Set(links)){if(href.startsWith('#'))assert.equal(await tab.locator(href).count(),1);else assert.equal((await tab.request.get(new URL(href,url).href)).status(),200)} }
 await tab.goto('http://127.0.0.1:4175/dist/practice-b-c01.html');await tab.locator('textarea').fill('초점과 준선의 거리를 비교한다.');await tab.locator('.ink-status').filter({hasText:'저장됨'}).waitFor();await tab.locator('[data-save]').check();await tab.reload();await tab.locator('textarea:not([disabled])').waitFor();assert.equal(await tab.locator('textarea').inputValue(),'초점과 준선의 거리를 비교한다.');assert.ok(await tab.locator('[data-save]').isChecked());await tab.goto('http://127.0.0.1:4175/dist/bank.html');assert.match(await tab.locator('#bank-progress').textContent(),/자기 점검 1개/);
 await tab.goto('http://127.0.0.1:4175/dist/practice-b-c02.html');const f=tab.locator('form.autocheck');await f.locator('input[name=f0]').fill('4');await f.locator('input[name=f1]').fill('10');await f.locator('input[name=f2]').fill('4√5');await f.locator('button[type=submit]').click();
 await tab.locator('.check-result').filter({hasText:'3칸 중 2칸'}).waitFor();assert.equal(await f.locator('.check-field.is-wrong').count(),1);assert.equal(await f.locator('input[name=f1]').getAttribute('aria-invalid'),'true');
 await f.locator('input[name=f1]').fill('');await f.locator('input[name=f1]').click();await f.locator('[data-key="√"]').click();assert.equal(await f.locator('input[name=f1]').inputValue(),'√');await f.locator('input[name=f1]').fill('12');await f.locator('input[name=f2]').fill('8.944');await f.locator('button[type=submit]').click();await tab.locator('.check-result').filter({hasText:'모두 맞았어요'}).waitFor();assert.match(await f.locator('.check-field').nth(2).textContent(),/근삿값/);
 await tab.reload();await tab.locator('.check-result').filter({hasText:'모두 맞았어요'}).waitFor();assert.equal(await f.locator('input[name=f1]').inputValue(),'12');
 await tab.goto('http://127.0.0.1:4175/dist/practice-b-v04.html');await tab.locator('input[name=f0]').fill('1');await tab.locator('input[name=f1]').fill('60');await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.check-result').filter({hasText:'모두 맞았어요'}).waitFor();
 await tab.goto('http://127.0.0.1:4175/dist/practice-b-s01.html');await tab.locator('input[name=f0][value="0"]').check();await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.check-result').filter({hasText:'1칸 중 0칸'}).waitFor();
await tab.locator('[data-check-reset]').click();assert.equal(await tab.locator('input[name=f0]:checked').count(),0);
 await tab.goto('http://127.0.0.1:4175/dist/practice-b-s01.html');assert.equal(await tab.locator('[data-key]').count(),0);
 await tab.goto('http://127.0.0.1:4175/dist/bank.html');assert.match(await tab.locator('#bank-progress').textContent(),/맞힌 문제 2개 · 다시 도전 1개/);assert.equal(await tab.locator('#bank-meter').getAttribute('max'),'60');
 await tab.locator('[name=status]').selectOption('solved');assert.equal(await tab.locator('.bank-card:visible').count(),2);await tab.locator('[name=status]').selectOption('retry');assert.equal(await tab.locator('.bank-card:visible').count(),1);assert.match(await tab.locator('.bank-card:visible .bank-grade').textContent(),/다시 도전/);await tab.reload();assert.equal(await tab.locator('.bank-card:visible').count(),1);await tab.locator('button[type=reset]').click();
 for(const width of [390,320]){await tab.setViewportSize({width,height:900});await tab.goto('http://127.0.0.1:4175/dist/practice-b-c08.html');assert.ok(await tab.locator('form.autocheck').isVisible());assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
 const nojs=await b.newContext({javaScriptEnabled:false});const page=await nojs.newPage();await page.goto('http://127.0.0.1:4175/dist/practice-b-c01.html');assert.ok(await page.locator('[data-view=solution]').isVisible());assert.ok(await page.locator('form.autocheck').isHidden());await nojs.close();
 await tab.setViewportSize({width:1440,height:1000});await tab.screenshot({path:'output/qa/bank-desktop.png',fullPage:false});await tab.goto('http://127.0.0.1:4175/dist/practice-b-c08.html');await tab.locator('[data-panel=solution]').click();await tab.screenshot({path:'output/qa/bank-solution.png',fullPage:true});
}
