import {verifyBankMath,verifyBankUI} from './verify-bank.mjs';
import {verifyLabsMath,verifyLabsUI} from './verify-labs.mjs';
import {checkNotebooks} from './verify-notebooks.mjs';
import {units,navigation} from '../content/platform.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {spawn} from 'node:child_process';
import {PDFDocument} from 'pdf-lib';import {browser} from './browser.mjs';import {questions,lessons} from '../content/course.mjs';
const report=[];const ok=s=>{report.push(s);console.log('PASS '+s)};
// 기하적 조건을 이용한 독립 검산. 정답 데이터와 수치 비교 후 식의 조건도 검증한다.
const sub=(a,b)=>a.map((x,i)=>x-b[i]), add=(a,b)=>a.map((x,i)=>x+b[i]),scale=(a,k)=>a.map(x=>x*k),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>Math.sqrt(dot(a,a));
const calc={
 '1-01':()=>[...sub([4,6,0],[1,2,0]),norm(sub([4,6,0],[1,2,0]))],
 '1-02':()=>[norm(sub([3,3,8],[1,0,2]))],
 '1-03':()=>add([0,0,0],scale(sub([6,3,9],[0,0,0]),1/3)),
 '1-04':()=>[1,-2,3,norm(sub([5,-2,3],[1,-2,3]))],
 '1-05':()=>sub(scale([1,2,-1],2),[2,-1,3]),
 '1-06':()=>{const v=sub([4,3,2],[1,-1,2]);return [...v,...add([4,3,2],v)]},
 '1-07':()=>{const v=sub([3,3,4],[1,2,2]);return [dot(v,v),norm(v)]},
 '1-08':()=>scale(add([-1,2,0],[3,0,4]),.5),
 '1-09':()=>{const c=scale([-2,4,-6],-.5);return [...c,Math.sqrt(dot(c,c)+2)]},
 '1-10':()=>{const p=scale([6,0,0],1/3);return [...p,norm(p),norm(sub([6,0,0],p))]},
 '2-01':()=>[...sub([3,1,1],[1,0,1]),...sub([1,0,1],[3,1,1])],
 '2-02':()=>[dot([1,2,2],[2,-1,0])],
 '2-03':()=>[Math.acos(dot([1,0,0],[1,Math.sqrt(3),0])/(norm([1,0,0])*norm([1,Math.sqrt(3),0])))*180/Math.PI],
 '2-04':()=>[1,2,3,2,0,-1],
 '2-05':()=>[2,-1,1,-dot([2,-1,1],[1,0,2])],
 '2-06':()=>{const a=[1,0,0],d=[1,2,1],n=[1,1,1],t=(9-dot(n,a))/dot(n,d);return [t,...add(a,scale(d,t))]},
 '2-07':()=>{const a=[0,0,0],b=[2,4,4];return [...scale(add(a,b),.5),norm(sub(b,a))/2]},
 '2-08':()=>[2,-1,1,dot([2,-1,1],[1,1,2])],
 '2-09':()=>[-dot([1,0,-1],[2,0,1])/2],
 '2-10':()=>{const c=[1,2,2],d=[1,0,0],p=add(c,scale(d,-3)),q=add(c,scale(d,3));return [...p,...q,norm(sub(q,p))]}
};
assert.equal(questions.length,20);assert.equal(new Set(questions.map(q=>q.id)).size,20);
for(const q of questions){const actual=calc[q.id]();assert.equal(actual.length,q.expected.length);actual.forEach((n,i)=>assert.ok(Math.abs(n-q.expected[i])<1e-9,q.id+' answer mismatch'));assert.equal(q.hints.length,2);assert.ok(q.solution&&q.misconception&&q.rubric)}
for(const t of [-3,0,2]){const p=add([1,2,3],scale([2,0,-1],t));assert.equal(p[1],2);assert.equal((p[0]-1)/2,3-p[2]);}
for(const p of [[1,0,2],[0,0,4],[2,2,2]])assert.equal(dot([2,-1,1],p),4);
assert.equal(dot([1,2,-1],[2,-.5,1]),0);ok('20문항 수치 독립 검산 + 직선·평면 조건 대입');
const covered=new Set(questions.flatMap(q=>q.standards));for(const s of lessons.flatMap(l=>l.standards))assert.ok(covered.has(s));for(const l of lessons){assert.equal(questions.filter(q=>q.lesson===l.id&&q.stage!=='도전').length,8);assert.equal(questions.filter(q=>q.lesson===l.id&&q.stage==='도전').length,2);assert.equal(l.timing.reduce((s,t)=>s+Number(t.match(/(\d+)분/)[1]),0),50)}ok('7개 성취기준 연결 · 차시별 필수 8 + 도전 2 · 50분');
assert.equal(units.length,3);assert.equal(new Set(units.map(u=>u.id)).size,3);
assert.deepEqual(units.flatMap(u=>u.questionIds).sort(),questions.map(q=>q.id).sort());
for(const u of units){assert.ok(['planned','partial'].includes(u.status));for(const lab of u.labs)assert.ok(['svg','three'].includes(lab.engine));}
ok('단원 모듈 3개 · 기존 20문항 ID 연결');
verifyLabsMath();ok('실험 8개 확인 문제 독립 계산 · 정육면체 단면 분류/최대 육각형 · 최단 경로 격자 탐색 · 관련 문항 연결');
verifyBankMath();ok('창작 60문항 독립 검산 · 곡선/접선/거리/벡터 조건 대입 · 단원별 20문항(7/8/5) · 채점 정답=검산값 · 수식 해석기');
const pdfs=(await fs.readdir('output/pdf')).filter(n=>n.endsWith('.pdf'));assert.equal(pdfs.length,7);for(const file of pdfs){const pdf=await PDFDocument.load(await fs.readFile('output/pdf/'+file));assert.equal(pdf.getPageCount(),file.includes('complete')?14:file.includes('concepts')?2:file.includes('worksheet')?5:6);for(const p of pdf.getPages())assert.ok(Math.abs(p.getWidth()-595.28)<2&&Math.abs(p.getHeight()-841.89)<2)}ok('PDF 7개 · 총 40쪽 · A4 규격');
await fs.mkdir('output/qa',{recursive:true});await fs.mkdir('tmp/qa',{recursive:true});
const server=spawn(process.execPath,['scripts/serve.mjs','.'],{env:{...process.env,PORT:'4175'},stdio:'pipe'});await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject)});
const b=await browser();try{const tab=await b.newPage();const errors=[];tab.on('pageerror',e=>errors.push(e.message));const res=await tab.goto('http://127.0.0.1:4175/dist/');assert.equal(res.status(),200);await tab.evaluate(()=>document.fonts.ready);assert.equal(await tab.locator('.question').count(),20);assert.equal(await tab.locator('.katex-error').count(),0);
for(const width of [1440,768,390,320]){await tab.setViewportSize({width,height:1000});await tab.evaluate(()=>document.fonts.ready);const overflow=await tab.evaluate(()=>({page:document.documentElement.scrollWidth>window.innerWidth+1,items:[...document.querySelectorAll('.question,.concept')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.id||e.querySelector('h3')?.textContent)}));assert.ok(!overflow.page,'page overflow '+width);assert.deepEqual(overflow.items,[],'content overflow '+width);await tab.screenshot({path:`output/qa/site-${width}.png`,fullPage:width===1440});}ok('1440·768·390·320px 화면 폭 · 수식 렌더링 · 가로 넘침 없음');
assert.equal(await tab.locator('#platform-nav a').count(),7);
for(const [id] of navigation)assert.equal(await tab.locator('#'+id).count(),1);
await tab.locator('.menu-toggle').click();assert.equal(await tab.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
await tab.locator('#platform-nav a[href="#labs"]').click();assert.equal(await tab.locator('.menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(new URL(tab.url()).hash,'#labs');
await tab.locator('.menu-toggle').click();await tab.locator('#platform-nav a').first().focus();await tab.keyboard.press('Escape');assert.equal(await tab.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
const noScript=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});const staticTab=await noScript.newPage();await staticTab.goto('http://127.0.0.1:4175/dist/');assert.ok(await staticTab.locator('#platform-nav').isVisible());await noScript.close();
ok('7개 메뉴 · 모바일 열기/닫기/키보드 · JavaScript 없는 메뉴');
await tab.setViewportSize({width:1440,height:1000});await tab.locator('#tab-1-01-hint').click();await tab.locator('#q-1-01 details').first().locator('summary').first().click();await tab.locator('#q-1-01 details details summary').click();assert.ok(await tab.locator('#q-1-01 details details').evaluate(x=>x.open));await tab.locator('#tab-1-01-answer').click();await tab.locator('#q-1-01 .answer summary').click();assert.ok(await tab.locator('#q-1-01 .answer').evaluate(x=>x.open));await tab.locator('[data-save="q-1-01"]').check();await tab.reload();assert.ok(await tab.locator('[data-save="q-1-01"]').isChecked());assert.match(await tab.locator('#progress-1').textContent(),/필수 1\/8/);
await tab.locator('#height').fill('3');await tab.locator('#height').dispatchEvent('input');assert.match(await tab.locator('#space-reading').textContent(),/√34/);await tab.locator('#angle').fill('90');await tab.locator('#angle').dispatchEvent('input');assert.match(await tab.locator('#vector-reading').textContent(),/수직/);await tab.locator('#angle').fill('180');await tab.locator('#angle').dispatchEvent('input');assert.match(await tab.locator('#vector-reading').textContent(),/-6/);
tab.once('dialog',dialog=>dialog.accept());await tab.locator('#reset').click();assert.ok(!(await tab.locator('[data-save="q-1-01"]').isChecked()));await tab.reload();assert.ok(!(await tab.locator('[data-save="q-1-01"]').isChecked()));ok('힌트 2단계 · 해설 · 저장/재접속 · 초기화 · 공간/내적 시각화');
const links=await tab.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));for(const href of [...new Set(links)])if(href.startsWith('#')){assert.equal(await tab.locator(href).count(),1,href)}else if(!href.startsWith('http')){const response=await tab.request.get('http://127.0.0.1:4175/dist/'+href);assert.equal(response.status(),200,href);if(href.endsWith('.pdf'))assert.match(response.headers()['content-type'],/pdf/)}ok('모든 내부 이동과 PDF 다운로드 링크 응답 확인');
await checkNotebooks(tab,b);ok('손풀이 20개 · 필기/지우개/취소/복원/PNG · 키보드 탭 · 펜/터치 분리 · 저장 실패 안내');
await verifyLabsUI(tab);ok('실험 8개 페이지 · 3D/2D 화면 · 조작 결과(단면·정사영·최단경로·접하는 구·벡터 합·배·직선과 평면·유사도) · 실험 채점 · 좁은 화면 · 내부 링크');
await verifyBankUI(tab,b);ok('문제은행 필터/상태/검색/URL 복원 · 60개 학습 페이지/탭/채점 칸 · 자동 채점·근삿값·각도·선택형·복원 · 개별 저장');
// 실제 PDF 페이지를 PDF.js로 렌더링하고 텍스트도 추출한다. 검수 파일은 배포 폴더 밖에 둔다.
await fs.writeFile('tmp/qa/viewer.html',`<!doctype html><html><head><style>body{margin:0;background:#dbe1d8;font-family:sans-serif}.sheet{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px}canvas{width:100%;height:auto;display:block;background:white}.label{padding:6px;font-size:12px}</style></head><body><div class="sheet"></div><script type="module">import * as pdfjs from '/node_modules/pdfjs-dist/build/pdf.mjs';pdfjs.GlobalWorkerOptions.workerSrc='/node_modules/pdfjs-dist/build/pdf.worker.mjs';window.renderPDF=async function(file){document.querySelector('.sheet').innerHTML='';const pdf=await pdfjs.getDocument({url:'/dist/pdf/'+file}).promise;let texts=[];for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);texts.push((await p.getTextContent()).items.map(x=>x.str).join(' '));const box=document.createElement('div');box.innerHTML='<div class="label">'+file+' · '+i+'</div>';const canvas=document.createElement('canvas');const v=p.getViewport({scale:1.2});canvas.width=v.width;canvas.height=v.height;box.append(canvas);document.querySelector('.sheet').append(box);await p.render({canvasContext:canvas.getContext('2d'),viewport:v}).promise;}return texts;};</script></body></html>`);
await tab.goto('http://127.0.0.1:4175/tmp/qa/viewer.html');await tab.waitForFunction(()=>typeof window.renderPDF==='function');await tab.setViewportSize({width:1240,height:1000});
for(const file of pdfs){const texts=await tab.evaluate(file=>window.renderPDF(file),file);assert.ok(texts.every(t=>t.replace(/\s/g,'').includes('공간을읽는기하')),file+' missing Korean');assert.ok(!texts.some(t=>t.includes('\uFFFD')),file+' replacement glyph');if(file.includes('worksheet')||file.includes('solutions')||file.includes('complete')){const l=file.includes('lesson-1')?1:file.includes('lesson-2')?2:null;for(const q of questions.filter(q=>!l||q.lesson===l))assert.ok(texts.join(' ').includes(q.id),file+' missing '+q.id)}if(!file.includes('complete'))await tab.screenshot({path:'output/qa/'+file.replace('.pdf','-contact.png'),fullPage:true});await fs.writeFile('output/qa/'+file.replace('.pdf','.txt'),texts.join('\n\n--- PAGE ---\n\n'));}
assert.deepEqual(errors,[]);ok('PDF 전체 40쪽 렌더링 · 한글 추출 · 문항 번호 대조 · 브라우저 오류 없음');
await fs.writeFile('output/qa/verification.json',JSON.stringify({at:new Date().toISOString(),checks:report,pdfCount:7,pages:40,questions:20},null,2));
}finally{await b.close();server.kill()}
