import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {mistakeItems} from './mistakes.mjs';
import {bankQuestions} from '../content/bank.mjs';
import {questions} from '../content/course.mjs';
import {labs} from '../content/labs.mjs';
// 오답노트 규칙: 자동 수집 → 이유 필수 → 다른 날 다시 맞히면 졸업
export function verifyMistakeRules(){
 const store={};const sandbox={localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)}}};vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(new URL('../public/mistakes.js',import.meta.url),'utf8'),sandbox);const M=sandbox.GeometryMistakes;
 let now=new Date(2026,10,27,9);M._setClock(()=>now);
 assert.equal(M.recordAttempt('b-c01',true,['4']).state,'none'); // 처음부터 맞힌 문제는 담지 않는다
 let r=M.recordAttempt('b-c01',false,['16','-4','4']);assert.equal(r.state,'recorded');assert.equal(M.load()['b-c01'].status,'open');assert.deepEqual([...M.load()['b-c01'].wrongInputs],['16','-4','4']);
 assert.equal(M.recordAttempt('b-c01',true,[]).state,'need-reason');assert.equal(M.load()['b-c01'].status,'open');
 assert.equal(M.setReason('b-c01','hack','x'),false);assert.equal(M.setReason('b-c01','concept','표준형과 비교한다'),true);
 assert.equal(M.recordAttempt('b-c01',true,[]).state,'same-day');
 now=new Date(2026,10,28,8);r=M.recordAttempt('b-c01',true,[]);assert.equal(r.state,'graduated');assert.equal(M.load()['b-c01'].graduated,'2026-11-28');
 assert.equal(M.recordAttempt('b-c01',false,['1']).state,'recorded');assert.equal(M.load()['b-c01'].status,'open');assert.equal(M.load()['b-c01'].wrongCount,2);assert.equal(M.load()['b-c01'].reason,'concept');
 now=new Date(2026,11,1);assert.equal(M.recordAttempt('b-c01',true,[]).state,'graduated');
 // 자정 경계: 23:59에 틀리고 다음 날 00:01에 맞히면 다른 날이다
 now=new Date(2026,11,2,23,59);M.recordAttempt('b-v01',false,['0']);M.setReason('b-v01','calc','');now=new Date(2026,11,3,0,1);assert.equal(M.recordAttempt('b-v01',true,[]).state,'graduated');
 // 기존 20문항: 수동 추가와 스스로 확인
 now=new Date(2026,11,4);M.addManual('1-01');assert.equal(M.selfCheck('1-01').state,'need-reason');M.setReason('1-01','method','');assert.equal(M.selfCheck('1-01').state,'same-day');now=new Date(2026,11,5);assert.equal(M.selfCheck('1-01').state,'graduated');
 assert.equal(M.remove('1-01'),true);assert.equal(M.load()['1-01'],undefined);
 M.recordAttempt('b-s01',false,['x'.repeat(1000)]);assert.equal(M.load()['b-s01'].wrongInputs[0].length,300);
 // 손상된 저장값에서도 동작
 store[M.KEY]='{broken';assert.deepEqual(Object.keys(M.load()),[]);store[M.KEY]='[1,2]';assert.deepEqual(Object.keys(M.load()),[]);
 // 오답노트가 다루는 문항 목록
 const items=mistakeItems();assert.equal(items.length,bankQuestions.length+questions.length+labs.length);assert.equal(new Set(items.map(i=>i.id)).size,items.length);
 for(const i of items){assert.ok(i.title&&i.href&&i.prompt&&i.answer,i.id);assert.ok(['conics','space','vectors'].includes(i.unit),i.id)}
}
const base='http://127.0.0.1:4175/dist/';
const yesterday=()=>{const d=new Date(Date.now()-864e5);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export async function verifyMistakesUI(b){
 const ctx=await b.newContext({viewport:{width:1280,height:900}});const tab=await ctx.newPage();const errors=[];tab.on('pageerror',e=>errors.push(e.message));
 await tab.goto(base+'mistakes.html');assert.ok(await tab.locator('#m-empty').isVisible());
 // 1) 문제은행에서 틀리면 자동 수집 + 이유 고르기
 await tab.goto(base+'practice-b-c01.html');const f=tab.locator('form.autocheck');await f.locator('input[name=f0]').fill('16');await f.locator('input[name=f1]').fill('-4');await f.locator('input[name=f2]').fill('4');await f.locator('button[type=submit]').click();
 const fb=tab.locator('.mistake-feedback');await fb.waitFor();assert.match(await fb.textContent(),/오답노트에 담았어요/);
 await fb.locator('.mistake-feedback button, button.small-button').last().click();assert.match(await fb.locator('.mistake-saved').textContent(),/하나 골라/);
 await fb.locator('input[value=concept]').check();await fb.locator('input[type=text]').fill('계수 16을 초점으로 쓰지 않는다');await fb.locator('button.small-button').click();assert.match(await fb.locator('.mistake-saved').textContent(),/저장했어요/);
 // 같은 날 다시 맞히면 아직 졸업 아님
 await f.locator('input[name=f0]').fill('4');await f.locator('button[type=submit]').click();await tab.locator('.mistake-feedback').filter({hasText:'내일 이후'}).waitFor();
 // 2) 오답노트 페이지
 await tab.goto(base+'mistakes.html');assert.equal(await tab.locator('.m-card').count(),1);const card=tab.locator('.m-card').first();assert.match(await card.textContent(),/초점과 준선을 읽기/);assert.match(await card.locator('.m-wrong').textContent(),/16 \/ -4 \/ 4/);assert.ok(await card.locator('input[value=concept]').isChecked());assert.equal(await card.locator('.m-note input').inputValue(),'계수 16을 초점으로 쓰지 않는다');
 assert.match(await tab.locator('#m-stats').textContent(),/1남은 오답/);assert.match(await tab.locator('#m-reasons').textContent(),/개념을 잘못 알았다/);assert.equal(await tab.locator('.katex-error').count(),0);
 await card.locator('.m-solution summary').click();assert.match(await card.locator('.m-answer').textContent(),/초점/);
 // 3) 다른 날 다시 맞히면 졸업 (마지막으로 틀린 날을 어제로 바꿔 확인)
 await tab.evaluate(y=>{const m=JSON.parse(localStorage.getItem('geometry-mistakes-v1'));m['b-c01'].lastWrong=y;localStorage.setItem('geometry-mistakes-v1',JSON.stringify(m))},yesterday());
 await tab.goto(base+'practice-b-c01.html');await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.mistake-feedback').filter({hasText:'졸업했어요'}).waitFor();
 await tab.goto(base+'mistakes.html');assert.equal(await tab.locator('.m-card').count(),0);await tab.locator('[name=status]').selectOption('graduated');assert.equal(await tab.locator('.m-card.is-graduated').count(),1);assert.match(await tab.locator('.m-badge').textContent(),/졸업/);
 // 4) 이유를 고르지 않은 오답은 졸업하지 않는다 (실험 확인 문제)
 await tab.goto(base+'lab-boat.html');await tab.locator('form.autocheck input[name=f0]').fill('7');await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.mistake-feedback').waitFor();
 await tab.evaluate(y=>{const m=JSON.parse(localStorage.getItem('geometry-mistakes-v1'));m['lab-boat'].lastWrong=y;localStorage.setItem('geometry-mistakes-v1',JSON.stringify(m))},yesterday());
 await tab.reload();await tab.locator('form.autocheck input[name=f0]').fill('5');await tab.locator('form.autocheck input[name=f1]').fill('15');await tab.locator('form.autocheck input[name=f2]').fill('3/4');await tab.locator('form.autocheck input[name=f3]').fill('4');await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.mistake-feedback').filter({hasText:'이유를 아직'}).waitFor();
 await tab.goto(base+'mistakes.html');assert.equal(await tab.locator('.m-card.needs-reason').count(),1);assert.match(await tab.locator('.m-card').first().textContent(),/실험실/);
 await tab.locator('.m-card').first().locator('input[value=calc]').check();await tab.locator('.m-card').first().locator('.m-msg').filter({hasText:'저장했어요'}).waitFor();assert.equal(await tab.locator('.m-card.needs-reason').count(),0);
 // 5) 기존 복습 문항 수동 추가와 스스로 확인
 await tab.goto(base+'index.html');const add=tab.locator('[data-mistake-id="1-01"]');await add.locator('button').first().click();assert.equal(await add.locator('button').first().isDisabled(),true);await add.locator('input[value=method]').check();await add.locator('button.small-button').last().click();
 await tab.goto(base+'mistakes.html');const rc=tab.locator('.m-card',{hasText:'기말고사 집중 복습'});assert.equal(await rc.count(),1);await rc.locator('[data-act=self]').click();assert.match(await rc.locator('.m-msg').textContent(),/내일 이후/);
 // 6) 단원 필터, URL 유지, 빼기(두 번 눌러야 함)
 await tab.locator('[name=unit]').selectOption('vectors');assert.equal(await tab.locator('.m-card').count(),1);await tab.reload();assert.equal(await tab.locator('.m-card').count(),1);await tab.locator('[name=unit]').selectOption('');
 const del=tab.locator('.m-card',{hasText:'기말고사 집중 복습'}).locator('[data-act=delete]');await del.click();assert.equal(await tab.locator('.m-card',{hasText:'기말고사 집중 복습'}).count(),1);await del.click();assert.equal(await tab.locator('.m-card',{hasText:'기말고사 집중 복습'}).count(),0);
 // 7) 인쇄 양식: 이름은 인쇄 머리글에만, 저장하지 않음
 await tab.locator('.m-print-fields [name=grade]').fill('2');await tab.locator('.m-print-fields [name=class]').fill('3');await tab.locator('.m-print-fields [name=name]').fill('홍길동');
 await tab.emulateMedia({media:'print'});await tab.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
 assert.equal(await tab.locator('#m-print-who').textContent(),'2학년 3반 홍길동');assert.ok(await tab.locator('.m-print-head').isVisible());assert.ok(!(await tab.locator('.platform-header').isVisible()));assert.ok(!(await tab.locator('.m-filters').isVisible()));assert.ok(await tab.locator('.m-print-reason').first().isVisible());assert.ok(await tab.locator('.m-solution').first().evaluate(d=>d.open));
 await tab.pdf({path:'output/qa/mistakes-print.pdf',format:'A4'});await tab.emulateMedia({media:'screen'});
 assert.ok(!(await tab.evaluate(()=>Object.values(localStorage).join('').includes('홍길동'))));
 // 8) 좁은 화면
 for(const w of [390,320]){await tab.setViewportSize({width:w,height:800});assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
 await tab.setViewportSize({width:1280,height:900});await tab.screenshot({path:'output/qa/mistakes.png',fullPage:true});
 assert.deepEqual(errors,[]);await ctx.close();
}
