import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {counts,lessonCounts,downloadList} from '../content/counts.mjs';
import {questions,lessons} from '../content/course.mjs';
import {bankQuestions} from '../content/bank.mjs';
import {labs} from '../content/labs.mjs';
import {encode,decode,extract,isoWeek} from '../public/summary.js';
// 피드백 반영 검사: 개수 자동 계산, 기록 백업, 결과 요약 코드
export function verifyFeedback(){
 // 1) 개수는 데이터에서 계산된다
 assert.equal(counts.review,questions.length);assert.equal(counts.bank,bankQuestions.length);assert.equal(counts.labs,labs.length);assert.equal(counts.pdfs,downloadList().length);
 assert.equal(counts.reviewCore+counts.reviewChallenge,counts.review);assert.equal(lessons.reduce((s,l)=>s+lessonCounts(l.id).core,0),counts.reviewCore);
 for(const f of downloadList())assert.ok(fs.existsSync('output/pdf/'+f.file),f.file);
 const html=fs.readFileSync('dist/index.html','utf8');
 assert.ok(html.includes(`기말 집중 복습 ${counts.lessons}차시 ${counts.review}문항 · 문제은행 ${counts.bank}문항 · 실험 ${counts.labs}개 · 변형 문제 ${counts.drillTypes}유형 · PDF ${counts.pdfs}종`));
 assert.ok(html.includes(`필수 ${counts.reviewCore}문항`)&&html.includes(`선택 도전 ${counts.reviewChallenge}문항`));
 for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){const t=fs.readFileSync('dist/'+f,'utf8');assert.ok(!t.includes('단원별 개념 학습 준비 중'),f);assert.ok(!t.includes('창작 20문항'),f);assert.ok(!/예상 (기말고사 )?점수/.test(t),f)}
 // 2) 기록 백업: 정리·합치기·잘못된 파일 거부
 const store={};const sb={localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)}}};vm.createContext(sb);vm.runInContext(fs.readFileSync('public/backup.js','utf8'),sb);const B=sb.GeometryBackup;
 store['geometry-bank-grade-v1']=JSON.stringify({'b-s01':{tries:1,solved:false,inputs:['1'],at:10},'b-s02':{tries:1,solved:true,inputs:['3'],at:5}});
 store['geometry-mistakes-v1']=JSON.stringify({'b-s01':{id:'b-s01',status:'open',reason:'calc',lastWrong:'2026-11-20',wrongCount:1}});
 store['jecheon-geometry-v1']=JSON.stringify({'q-1-01':true});
 const file={app:'jecheon-geometry',version:1,data:{'geometry-bank-grade-v1':{'b-s01':{tries:2,solved:true,inputs:['5'],at:20},'b-v01':{tries:1,solved:true,inputs:['x'],at:3},'bad id!':{tries:1,solved:true}},'geometry-mistakes-v1':{'b-s01':{id:'b-s01',status:'graduated',reason:'calc',lastWrong:'2026-11-20',graduated:'2026-11-25',wrongCount:1},'b-v02':{status:'hacked'}},'jecheon-geometry-v1':{'q-1-01':false,'q-1-02':true,'q-1-03':'yes'},'evil-key':{a:1},'geometry-drill-v1':{'vec-op':{tries:5,correct:4,streak:2,done:false,extra:'<script>'}}}};
 const p=B.parse(JSON.stringify(file));assert.ok(!('evil-key' in p.data));assert.ok(!('bad id!' in p.data['geometry-bank-grade-v1']));assert.ok(!('b-v02' in p.data['geometry-mistakes-v1']));assert.deepEqual({...p.data['jecheon-geometry-v1']},{'q-1-01':false,'q-1-02':true});assert.equal(p.data['geometry-drill-v1']['vec-op'].extra,undefined);
 const changed=B.merge(p.data);const g=JSON.parse(store['geometry-bank-grade-v1']),m=JSON.parse(store['geometry-mistakes-v1']),f=JSON.parse(store['jecheon-geometry-v1']);
 assert.deepEqual(g['b-s01'],{tries:2,solved:true,inputs:['5'],at:20});assert.equal(g['b-s02'].solved,true);assert.equal(g['b-v01'].solved,true);assert.equal(m['b-s01'].status,'graduated');assert.equal(f['q-1-01'],true);assert.equal(f['q-1-02'],true);
 assert.ok(changed['geometry-bank-grade-v1']>=2);assert.deepEqual({...B.merge(p.data)},{}); // 같은 파일을 다시 합쳐도 바뀌지 않는다
 const snap=B.snapshot();assert.equal(snap.app,'jecheon-geometry');assert.equal(JSON.parse(JSON.stringify(snap)).data['geometry-bank-grade-v1']['b-s01'].tries,2);
 for(const bad of ['not json','{"app":"other","data":{}}','{"app":"jecheon-geometry","version":99,"data":{}}','x'.repeat(2e6+1)])assert.throws(()=>B.parse(bad));
 // 3) 결과 요약 코드: 왕복·변조 감지·개인정보 없음
 const s={week:isoWeek(new Date(2026,10,27)),units:{space:{attempted:12,total:24,pct:41},vectors:{attempted:9,total:24,pct:30}},stage:2,open:{projection:2,'vec-angle':1},reasons:[1,0,2,0],graduated:3,drillDone:['projection']};
 assert.equal(s.week,'2026-W48');const code=encode(s);assert.match(code,/^GEO1-[A-Za-z0-9_-]+-[0-9a-f]{4}$/);assert.deepEqual(JSON.parse(JSON.stringify(decode(code))),s);
 assert.equal(decode(code.replace(/-[0-9a-f]{4}$/,'-0000')),null);assert.equal(decode(code.slice(0,-6)+'A'+code.slice(-5)),null);assert.equal(decode('GEO1-hello-1234'),null);
 assert.deepEqual(extract(`이름 홍길동 ${code}\n${code}, 기타`),[code,code]);
 const raw=Buffer.from(code.split('-').slice(1,-1).join('-').replace(/-/g,'+').replace(/_/g,'/'),'base64').toString();assert.ok(!/name|이름|input|학번/.test(raw));
}
const base='http://127.0.0.1:4175/dist/';
export async function verifyFeedbackUI(b){
 const ctx=await b.newContext({viewport:{width:1280,height:900},acceptDownloads:true});const tab=await ctx.newPage();const errors=[];tab.on('pageerror',e=>errors.push(e.message));
 await tab.goto(base+'index.html');
 // 개념 단원: 기말 범위 먼저, 이차곡선은 다음 버전
 const cards=await tab.locator('#concepts .unit-card h3').allTextContents();assert.deepEqual(cards,['공간도형과 공간좌표','벡터','이차곡선']);assert.match(await tab.locator('#concepts .unit-card').nth(2).textContent(),/다음 버전/);assert.match(await tab.locator('#concepts .unit-card').first().textContent(),/기말고사 범위.*지금 학습할 수 있어요/s);
 for(const href of await tab.locator('#concepts .unit-links a').evaluateAll(a=>a.map(x=>x.getAttribute('href'))))if(!href.startsWith('#'))assert.equal((await tab.request.get(new URL(href,tab.url()).href)).status(),200,href);
 assert.match(await tab.locator('#labs').textContent(),/이차곡선 실험실.*다음 버전/s);
 // 학습 경로 진행 표시는 차시 기준임을 밝히고 데이터와 맞는다
 for(const l of lessons){const c=lessonCounts(l.id);assert.equal(await tab.locator(`#progress-${l.id}`).textContent(),`이 차시 필수 0/${c.core} · 도전 0/${c.challenge}`)}
 // 기록 내보내기 → 다른 기기(새 컨텍스트)에서 불러오기
 await tab.goto(base+'practice-b-s03.html');await tab.locator('form.autocheck input[name=f0]').fill('7');await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.check-result').filter({hasText:'모두 맞았어요'}).waitFor();
 await tab.goto(base+'practice-b-v02.html');await tab.locator('form.autocheck input[name=f0]').fill('3');await tab.locator('form.autocheck button[type=submit]').click();await tab.locator('.mistake-feedback').waitFor();
 await tab.goto(base+'index.html#review');await tab.waitForFunction(()=>window.examReady?.code);
 const [dl]=await Promise.all([tab.waitForEvent('download'),tab.locator('[data-backup=export]').click()]);assert.match(dl.suggestedFilename(),/^geometry-record-\d{8}\.json$/);const path='output/qa/backup-test.json';await dl.saveAs(path);assert.match(await tab.locator('.backup-status').textContent(),/채점 기록 2개.*오답노트 1개/);
 const code=await tab.evaluate(()=>window.examReady.code);assert.equal(await tab.locator('.er-code-text').inputValue(),code);assert.match(await tab.locator('.er-code-what').textContent(),/담기지 않는 것: 이름, 학번/);
 const ctx2=await b.newContext({viewport:{width:390,height:900}});const t2=await ctx2.newPage();t2.on('pageerror',e=>errors.push(e.message));await t2.goto(base+'mistakes.html');assert.ok(await t2.locator('#m-empty').isVisible());assert.ok(await t2.locator('#m-backup [data-backup=file]').count());
 await t2.locator('#m-backup [data-backup=file]').setInputFiles(path);await t2.locator('[data-backup=merge]').click();assert.match(await t2.locator('#m-backup .backup-status').textContent(),/불러왔어요/);assert.equal(await t2.locator('.m-card').count(),1);
 await t2.locator('#m-backup [data-backup=file]').setInputFiles({name:'x.json',mimeType:'application/json',buffer:Buffer.from('{"app":"nope"}')});assert.match(await t2.locator('#m-backup .backup-status').textContent(),/학습 기록 파일이 아니에요/);
 await t2.goto(base+'index.html#review');await t2.waitForFunction(()=>window.examReady);assert.equal(await t2.evaluate(()=>window.examReady.units.space.attempted),1);assert.ok(await t2.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const code2=await t2.evaluate(()=>window.examReady.code);await ctx2.close();
 // 교사용 반 결과 모아 보기
 await tab.goto(base+'class-summary.html');await tab.locator('#class-codes').fill(`응답\t${code}\n${code2}\n${code}\nGEO1-garbage00-0000`);await tab.locator('#class-run').click();
 assert.match(await tab.locator('#class-status').textContent(),/코드 1개를 읽었어요.*똑같은 코드 2개.*잘못된 코드 1개/);assert.equal(await tab.evaluate(()=>window.classSummary.n),1);
 assert.equal(await tab.locator('.class-table tbody tr').count(),1);assert.match(await tab.locator('.class-table').textContent(),/평행한 두 벡터/);assert.ok(!(await tab.locator('#class-csv').isDisabled()));
 const [csv]=await Promise.all([tab.waitForEvent('download'),tab.locator('#class-csv').click()]);assert.equal(csv.suggestedFilename(),'class-mistake-summary.csv');
 assert.equal((await tab.request.get(base+'index.html')).status(),200);await tab.goto(base+'index.html');assert.equal(await tab.locator('.teacher-entry a[href="class-summary.html"]').count(),1);
 // 인쇄할 때 백업 상자는 숨긴다
 await tab.goto(base+'mistakes.html');await tab.emulateMedia({media:'print'});assert.ok(!(await tab.locator('#m-backup').isVisible()));await tab.emulateMedia({media:'screen'});
 fs.rmSync(path,{force:true});assert.deepEqual(errors,[]);await ctx.close();
}
