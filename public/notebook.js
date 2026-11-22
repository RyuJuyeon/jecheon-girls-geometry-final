'use strict';
// Anonymous, device-local notebooks. No network requests or handwriting recognition.
(() => {
  const LIMIT_STROKES=300, LIMIT_POINTS=30000;
  const database=new Promise((resolve,reject)=>{
    try {
      const request=indexedDB.open('geometry-notebooks-v1',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('notes');
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('Storage blocked'));
    } catch(error){reject(error)}
  });
  // Keep the rejection handled even before a notebook has initialized.
  database.catch(()=>{});
  async function read(id){const db=await database;return new Promise((resolve,reject)=>{const request=db.transaction('notes').objectStore('notes').get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
  async function write(id,data){const db=await database;return new Promise((resolve,reject)=>{const tx=db.transaction('notes','readwrite');tx.objectStore('notes').put(data,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
  function valid(data){return data&&data.version===1&&typeof data.text==='string'&&data.text.length<=12000&&Array.isArray(data.strokes)&&data.strokes.length<=LIMIT_STROKES&&data.strokes.reduce((n,s)=>n+(s.points?.length||0),0)<=LIMIT_POINTS&&data.strokes.every(s=>['pen','eraser'].includes(s.tool)&&[2,4,7].includes(s.width)&&Array.isArray(s.points)&&s.points.length&&s.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=0&&v<=1)))}
  document.querySelectorAll('.workspace').forEach(root=>{
    const id=root.dataset.question, tabs=root.querySelector('.work-tabs'), buttons=[...tabs.children], panels=[...root.querySelectorAll('.work-panel')];
    tabs.hidden=false;tabs.setAttribute('role','tablist');
    const activate=(index,focus=false)=>{buttons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;panels[i].hidden=i!==index});if(focus)buttons[index].focus()};
    buttons.forEach((button,i)=>{button.setAttribute('role','tab');button.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',button.id);panels[i].tabIndex=0;button.addEventListener('click',()=>activate(i));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%4;if(event.key==='ArrowLeft')next=(i+3)%4;if(event.key==='Home')next=0;if(event.key==='End')next=3;if(next!==undefined){event.preventDefault();activate(next,true)}})});activate(0);
    const canvas=root.querySelector('canvas'), ctx=canvas.getContext('2d'), status=root.querySelector('.ink-status'), textarea=root.querySelector('textarea'), toolbar=root.querySelector('.ink-tools');
    const undo=root.querySelector('[data-action="undo"]'),redo=root.querySelector('[data-action="redo"]');
    if(!ctx){status.textContent='이 브라우저는 필기 공간을 지원하지 않습니다. 종이 활동지를 사용하세요.';return}
    canvas.hidden=false;toolbar.hidden=false;let strokes=[],future=[],active=null,pointer=null,tool='pen',ready=false,frame=0,revision=0;
    const layer=document.createElement('canvas');layer.width=900;layer.height=600;const ink=layer.getContext('2d');
    function paint(){frame=0;ink.clearRect(0,0,900,600);for(const stroke of [...strokes,...(active?[active]:[])]){ink.globalCompositeOperation=stroke.tool==='eraser'?'destination-out':'source-over';ink.strokeStyle='#142440';ink.fillStyle='#142440';ink.lineWidth=stroke.tool==='eraser'?26:stroke.width;ink.lineCap='round';ink.lineJoin='round';const points=stroke.points;ink.beginPath();if(points.length===1){ink.arc(points[0][0]*900,points[0][1]*600,ink.lineWidth/2,0,Math.PI*2);ink.fill()}else{ink.moveTo(points[0][0]*900,points[0][1]*600);for(const p of points.slice(1))ink.lineTo(p[0]*900,p[1]*600);ink.stroke()}}ctx.fillStyle='white';ctx.fillRect(0,0,900,600);ctx.strokeStyle='#e6edf6';ctx.lineWidth=1;ctx.beginPath();for(let y=30;y<600;y+=30){ctx.moveTo(0,y);ctx.lineTo(900,y)}ctx.stroke();ctx.drawImage(layer,0,0);undo.disabled=!strokes.length;redo.disabled=!future.length}
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint)};
    async function save(){const rev=++revision;status.textContent='이 브라우저에 저장 중…';try{await write(id,{version:1,strokes:structuredClone(strokes),text:textarea.value});if(rev===revision)status.textContent='이 브라우저에 저장됨 · 자동 채점 아님'}catch{if(rev===revision)status.textContent='저장할 수 없습니다. 현재 화면에서만 유지됩니다. 이동 전에 필기 PNG와 텍스트를 별도로 보관하세요.'}}
    read(id).then(data=>{if(data!==undefined){if(!valid(data))throw new Error('Invalid notebook');strokes=data.strokes;textarea.value=data.text}status.textContent='펜·마우스로 풀이를 작성하세요. 자동 채점은 하지 않습니다.'}).catch(()=>{status.textContent='기존 필기를 불러오지 못했습니다. 현재 화면에서 작성할 수 있지만 저장을 보장하지 않습니다.'}).finally(()=>{ready=true;textarea.disabled=false;paint()});
    const point=event=>{const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))]};
    canvas.addEventListener('pointerdown',event=>{if(!ready||pointer!==null||!event.isPrimary||event.button!==0)return;if(event.pointerType==='touch'&&!root.querySelector('[data-finger]').checked)return;if(strokes.length>=LIMIT_STROKES||strokes.reduce((n,s)=>n+s.points.length,0)>=LIMIT_POINTS){status.textContent='필기 용량에 도달했습니다. PNG로 저장한 뒤 필기를 지워 주세요.';return}event.preventDefault();pointer=event.pointerId;active={tool,width:Number(root.querySelector('[data-width]').value),points:[point(event)]};canvas.setPointerCapture(pointer);schedule()});
    canvas.addEventListener('pointermove',event=>{if(event.pointerId!==pointer||!active)return;event.preventDefault();const remaining=LIMIT_POINTS-strokes.reduce((n,s)=>n+s.points.length,0);if(active.points.length<Math.min(remaining,3000))active.points.push(point(event));schedule()});
    function end(event,cancel=false){if(event.pointerId!==pointer||!active)return;const old=pointer;pointer=null;if(!cancel){strokes.push(active);future=[]}active=null;if(canvas.hasPointerCapture(old))canvas.releasePointerCapture(old);paint();if(!cancel)save()}
    canvas.addEventListener('pointerup',event=>end(event));canvas.addEventListener('pointercancel',event=>end(event,true));canvas.addEventListener('lostpointercapture',event=>end(event,true));
    root.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>{tool=button.dataset.tool;root.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
    toolbar.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button||!ready||active)return;switch(button.dataset.action){case 'undo':if(strokes.length)future.push(strokes.pop());paint();save();break;case 'redo':if(future.length)strokes.push(future.pop());paint();save();break;case 'clear':if(!confirm('이 문제의 손필기를 지울까요? 텍스트 풀이는 유지됩니다. 지운 필기는 복구할 수 없습니다.'))return;future=[];strokes=[];paint();save();break;case 'expand':{const expanded=root.closest('.question').classList.toggle('ink-expanded');button.setAttribute('aria-pressed',String(expanded));button.textContent=expanded?'원래 크기':'크게 쓰기';break}case 'download':{paint();const exportCanvas=document.createElement('canvas');exportCanvas.width=900;exportCanvas.height=650;const out=exportCanvas.getContext('2d');out.fillStyle='white';out.fillRect(0,0,900,650);out.fillStyle='#142440';out.font='20px sans-serif';out.fillText('공간을 읽는 기하 · '+id+' 손풀이',20,32);out.drawImage(canvas,0,50);const a=document.createElement('a');a.download='geometry-'+id+'-notes.png';a.href=exportCanvas.toDataURL('image/png');a.click();break}}});
    textarea.addEventListener('input',()=>{if(ready)save()});
  });
})();
