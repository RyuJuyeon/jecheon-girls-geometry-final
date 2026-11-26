import assert from 'node:assert/strict';
import {bankQuestions} from '../content/bank.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0), sub=(a,b)=>a.map((x,i)=>x-b[i]);
export function verifyBankMath(){
 const computed={
 'b-c01':[16/4,0,-16/4,16/4], 'b-c02':[Math.sqrt(36-20),2*Math.sqrt(36),2*Math.sqrt(20)],'b-c03':[Math.sqrt(16+9),Math.sqrt(9/16)],'b-c04':[-2,(3-1)/2,4*(3-(3-1)/2)],
 'b-c05':[3/18*12,2/8*12,12],'b-c06':[3/3,3/9,2*3/3], 'b-c07':[4/8*2,-1*2,2,4], 'b-c08':[-Math.sqrt((25-16)/9),Math.sqrt((25-16)/9),9/5,16/5],
 'b-s01':[dot([1,0,0],[0,1,0]),2-0],'b-s02':[30*Math.cos(Math.PI/3)],'b-s03':[Math.hypot(...sub([4,-2,6],[-2,1,4]))], 'b-s04':[Math.hypot(6,8)],'b-s05':[-1+2/3*9,2+2/3*(-6),0+2/3*6], 'b-s06':[-4/2,6/2,2/2,Math.sqrt(11+4+9+1)],'b-s07':[1,-2,6,Math.sqrt(25-(6-3)**2)],'b-s08':[dot([2,1,-1],[1,2,2])-2*Math.hypot(1,2,2),dot([2,1,-1],[1,2,2])+2*Math.hypot(1,2,2)],
 'b-v01':[3*2-2,3*(-1)-2*3,3-2*(-2)],'b-v02':[2*(-2),6/(-3)],'b-v03':[dot([1,2,-2],[2,1,2])], 'b-v04':[dot([1,1,0],[0,1,1]),Math.acos(1/(Math.hypot(1,1)*Math.hypot(1,1)))], 'b-v05':[2,0,-1,...sub([-1,6,2],[2,0,-1]).map(x=>x/3)],'b-v06':[2,1,-2,dot([1,2,-1],[2,1,-2])], 'b-v07':[(9-3)/2,1+2*3,3,2-3], 'b-v08':[6/16,Math.sqrt(9-36/16)]
 };
 assert.equal(bankQuestions.length,24);assert.equal(new Set(bankQuestions.map(q=>q.id)).size,24);
 for(const q of bankQuestions){assert.ok(computed[q.id]);assert.equal(q.expected.length,computed[q.id].length);q.expected.forEach((v,i)=>near(v,computed[q.id][i]));assert.equal(q.hints.length,2);for(const key of ['prompt','answer','solution','misconception','topic'])assert.ok(q[key]);assert.equal(q.provenance,'original-v1')}
 for(const unit of ['conics','space','vectors']){const qs=bankQuestions.filter(q=>q.unit===unit);assert.equal(qs.length,8);assert.deepEqual(['기본','적용','도전'].map(stage=>qs.filter(q=>q.stage===stage).length),[3,3,2])}
 // Independent geometric substitution checks beyond answer metadata.
 near(3**2/18+2**2/8,1);near(2*3+3*2,12);
 for(const x of [-2,0,1,5])near(x*x/8-(x/2-1)**2-1,-((x-4)**2)/8);
 for(const m of [-1,1]){const x=-9*m/5,y=16/5;near(x*x/9+y*y/16,1);near(y,m*x+5);near(90*m*90*m-4*(16+9*m*m)*81,0)}
 for(const t of [-2,0,3]){const p=[2-t,2*t,-1+t];near((p[0]-2)/(-1),p[1]/2);near(p[2]+1,t)}
 for(const k of [-4,8])near(Math.abs(2-k)/3,2);
 for(const t of [-3,0,.375,2]){near(9-12*t+16*t*t,16*(t-.375)**2+27/4);assert.ok(9-12*t+16*t*t>=27/4)}
}
export async function verifyBankUI(tab,b){
 await tab.goto('http://127.0.0.1:4175/dist/bank.html');assert.equal(await tab.locator('.bank-card').count(),24);
 for(const width of [1440,768,390,320]){await tab.setViewportSize({width,height:1000});assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await tab.locator('[name=unit]').selectOption('conics');assert.equal(await tab.locator('.bank-card:visible').count(),8);await tab.locator('[name=level]').selectOption('도전');assert.equal(await tab.locator('.bank-card:visible').count(),2);await tab.locator('[name=search]').fill('외부');assert.equal(await tab.locator('.bank-card:visible').count(),1);await tab.reload();assert.equal(await tab.locator('.bank-card:visible').count(),1);
 await tab.locator('[name=search]').fill('없는유형');assert.ok(await tab.locator('#bank-empty').isVisible());await tab.locator('button[type=reset]').click();await tab.waitForFunction(()=>document.querySelectorAll('.bank-card:not([hidden])').length===24);
 const urls=await tab.locator('.bank-card h3 a').evaluateAll(els=>els.map(e=>e.href));
 for(const url of urls){await tab.goto(url);assert.equal(await tab.locator('.question').count(),1);assert.equal(await tab.locator('.katex-error').count(),0);await tab.locator('textarea:not([disabled])').waitFor();await tab.locator('[data-panel=hint]').click();assert.ok(await tab.locator('[data-view=hint]').isVisible());await tab.locator('[data-panel=solution]').click();assert.ok(await tab.locator('[data-view=solution]').isVisible());assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const links=await tab.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));for(const href of new Set(links)){if(href.startsWith('#'))assert.equal(await tab.locator(href).count(),1);else assert.equal((await tab.request.get(new URL(href,url).href)).status(),200)} }
 await tab.goto('http://127.0.0.1:4175/dist/practice-b-c01.html');await tab.locator('textarea').fill('초점과 준선의 거리를 비교한다.');await tab.locator('.ink-status').filter({hasText:'저장됨'}).waitFor();await tab.locator('[data-save]').check();await tab.reload();await tab.locator('textarea:not([disabled])').waitFor();assert.equal(await tab.locator('textarea').inputValue(),'초점과 준선의 거리를 비교한다.');assert.ok(await tab.locator('[data-save]').isChecked());await tab.goto('http://127.0.0.1:4175/dist/bank.html');assert.match(await tab.locator('#bank-progress').textContent(),/자기 점검 1개/);
 const nojs=await b.newContext({javaScriptEnabled:false});const page=await nojs.newPage();await page.goto('http://127.0.0.1:4175/dist/practice-b-c01.html');assert.ok(await page.locator('[data-view=solution]').isVisible());await nojs.close();
 await tab.setViewportSize({width:1440,height:1000});await tab.screenshot({path:'output/qa/bank-desktop.png',fullPage:false});await tab.goto('http://127.0.0.1:4175/dist/practice-b-c08.html');await tab.locator('[data-panel=solution]').click();await tab.screenshot({path:'output/qa/bank-solution.png',fullPage:true});
}
