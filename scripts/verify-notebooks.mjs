import assert from 'node:assert/strict';
export async function checkNotebooks(tab,b){
  await tab.setViewportSize({width:1440,height:1000});
  assert.equal(await tab.locator('.workspace').count(),20);
  assert.equal(await tab.locator('[role="tab"]').count(),80);
  await tab.locator('#tab-1-01-write').click();
  const q=tab.locator('#q-1-01'),canvas=q.locator('canvas'),status=q.locator('.ink-status');
  await q.locator('textarea').fill('거리의 제곱 = 3² + 4²');
  await status.filter({hasText:'저장됨'}).waitFor();
  await canvas.scrollIntoViewIfNeeded();let box=await canvas.boundingBox();
  await tab.mouse.move(box.x+box.width*.15,box.y+box.height*.25);await tab.mouse.down();await tab.mouse.move(box.x+box.width*.65,box.y+box.height*.45,{steps:12});await tab.mouse.up();
  await status.filter({hasText:'저장됨'}).waitFor();
  const snapshot=()=>canvas.evaluate(c=>c.toDataURL());const written=await snapshot();
  await q.locator('[data-action="undo"]').click();const empty=await snapshot();assert.notEqual(empty,written);
  await q.locator('[data-action="redo"]').click();await status.filter({hasText:'저장됨'}).waitFor();assert.equal(await snapshot(),written);
  await tab.reload();await tab.locator('#tab-1-01-write').click();await q.locator('textarea:not([disabled])').waitFor();assert.equal(await q.locator('textarea').inputValue(),'거리의 제곱 = 3² + 4²');assert.equal(await snapshot(),written);
  assert.equal(await tab.locator('#q-2-09 textarea').inputValue(),'');
  await q.locator('[data-tool="eraser"]').click();await canvas.scrollIntoViewIfNeeded();box=await canvas.boundingBox();await tab.mouse.move(box.x+box.width*.4,box.y+box.height*.1);await tab.mouse.down();await tab.mouse.move(box.x+box.width*.4,box.y+box.height*.7,{steps:10});await tab.mouse.up();assert.notEqual(await snapshot(),written);await q.locator('[data-action="undo"]').click();assert.equal(await snapshot(),written);
  const downloadPromise=tab.waitForEvent('download');await q.locator('[data-action="download"]').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'geometry-1-01-notes.png');assert.equal(await download.failure(),null);
  await q.locator('[data-action="expand"]').click();assert.ok(await q.evaluate(el=>el.classList.contains('ink-expanded')));for(const width of [1440,768,390,320]){await tab.setViewportSize({width,height:1000});assert.ok(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}await tab.setViewportSize({width:1440,height:1000});await q.locator('[data-action="expand"]').click();
  await tab.locator('#tab-1-01-write').focus();await tab.keyboard.press('ArrowRight');assert.equal(await tab.locator('#tab-1-01-hint').getAttribute('aria-selected'),'true');assert.ok(await q.locator('[data-view="hint"]').isVisible());await tab.keyboard.press('End');assert.ok(await q.locator('[data-view="solution"]').isVisible());await tab.keyboard.press('Home');
  // Synthetic pen/touch events cover input routing, not physical palm rejection.
  await q.locator('[data-tool="pen"]').click();
  const input=async(type,cancel=false)=>canvas.evaluate((c,{type,cancel})=>{const r=c.getBoundingClientRect();const options={pointerId:41,pointerType:type,isPrimary:true,button:0,bubbles:true,clientX:r.left+r.width*.8,clientY:r.top+r.height*.8};c.setPointerCapture=()=>{};c.hasPointerCapture=()=>false;c.dispatchEvent(new PointerEvent('pointerdown',options));c.dispatchEvent(new PointerEvent(cancel?'pointercancel':'pointerup',options))},{type,cancel});
  const before=await snapshot();await input('touch');assert.equal(await snapshot(),before);await input('pen',true);assert.equal(await snapshot(),before);await input('pen');assert.notEqual(await snapshot(),before);
  tab.once('dialog',d=>d.dismiss());await q.locator('[data-action="clear"]').click();assert.notEqual(await snapshot(),empty);
  tab.once('dialog',d=>d.accept());await q.locator('[data-action="clear"]').click();assert.equal(await snapshot(),empty);await status.filter({hasText:'저장됨'}).waitFor();await tab.reload();await q.locator('textarea:not([disabled])').waitFor();assert.equal(await snapshot(),empty);assert.equal(await q.locator('textarea').inputValue(),'거리의 제곱 = 3² + 4²');
  const blocked=await b.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{value:{open(){throw new Error('Disabled for test')}}})});const p=await blocked.newPage();await p.goto('http://127.0.0.1:4175/dist/');await p.locator('#q-1-01 textarea').fill('저장 실패 상황');await p.locator('#q-1-01 .ink-status').filter({hasText:'저장할 수 없습니다'}).waitFor();await blocked.close();
}
