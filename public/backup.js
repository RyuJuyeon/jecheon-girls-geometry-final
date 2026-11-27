'use strict';
// 학습 기록 내보내기·불러오기. 이 브라우저(localStorage)의 기록을 파일로 저장하고, 다른 기기에서 불러와 합친다.
// 서버를 거치지 않는다. 손풀이 필기(그림)는 용량이 커서 포함하지 않는다.
(function(root){
  const APP='jecheon-geometry',VERSION=1;
  const KEYS={'jecheon-geometry-v1':'flag','geometry-bank-progress-v1':'flag','geometry-lab-cube-found':'flag','geometry-bank-grade-v1':'grade','geometry-mistakes-v1':'mistake','geometry-drill-v1':'drill'};
  const LABEL={'jecheon-geometry-v1':'집중 복습 자기 점검','geometry-bank-progress-v1':'문제은행 자기 점검','geometry-lab-cube-found':'정육면체 단면 찾기','geometry-bank-grade-v1':'채점 기록','geometry-mistakes-v1':'오답노트','geometry-drill-v1':'변형 문제 연습'};
  const ID=/^[A-Za-z0-9_-]{1,60}$/,DAY=/^\d{4}-\d{2}-\d{2}$/;
  const int=(v,max=9999)=>Number.isInteger(v)&&v>=0&&v<=max?v:0,str=(v,n)=>typeof v==='string'?v.slice(0,n):'',day=v=>typeof v==='string'&&DAY.test(v)?v:undefined;
  const strs=(a,n=8)=>Array.isArray(a)?a.slice(0,n).map(x=>str(String(x??''),300)):undefined;
  const read=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return {}}};
  // 형식별 정리: 알 수 없는 값은 버린다
  const clean={
    flag:o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>ID.test(k)&&typeof v==='boolean')),
    grade:o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>ID.test(k)&&v&&typeof v==='object').map(([k,v])=>[k,{tries:int(v.tries),solved:v.solved===true,inputs:strs(v.inputs)||[],at:Number.isFinite(v.at)?v.at:0}])),
    mistake:o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>ID.test(k)&&v&&typeof v==='object'&&['open','graduated'].includes(v.status)).map(([k,v])=>{const e={id:k,source:['bank','lab','review'].includes(v.source)?v.source:'bank',added:day(v.added),reason:['concept','condition','calc','method'].includes(v.reason)?v.reason:'',note:str(v.note,300),wrongCount:int(v.wrongCount),rightCount:int(v.rightCount),status:v.status,lastWrong:day(v.lastWrong),lastRight:day(v.lastRight),graduated:day(v.graduated),wrongInputs:strs(v.wrongInputs)};for(const x in e)if(e[x]===undefined)delete e[x];return [k,e]})),
    drill:o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>ID.test(k)&&v&&typeof v==='object').map(([k,v])=>[k,{tries:int(v.tries),correct:int(v.correct),streak:int(v.streak),done:v.done===true}]))
  };
  const last=e=>[e.lastWrong,e.lastRight,e.graduated,e.added].filter(Boolean).sort().pop()||'';
  // 합치기: 지운 기록은 되살리지 않고, 더 많이 진행한 쪽을 남긴다
  const mergeOne={
    flag:(l,i)=>l===true||i===true,
    grade:(l,i)=>({tries:Math.max(l.tries,i.tries),solved:l.solved||i.solved,inputs:(i.at>l.at?i:l).inputs,at:Math.max(l.at||0,i.at||0)}),
    mistake:(l,i)=>last(i)>last(l)?i:l,
    drill:(l,i)=>({tries:Math.max(l.tries,i.tries),correct:Math.max(l.correct,i.correct),streak:(i.tries>l.tries?i:l).streak,done:l.done||i.done})
  };
  function snapshot(){const data={};for(const k in KEYS)data[k]=clean[KEYS[k]](read(k));return {app:APP,version:VERSION,exportedAt:new Date().toISOString(),data}}
  function parse(text){
    if(typeof text!=='string'||text.length>2e6)throw new Error('파일이 너무 커요.');
    let o;try{o=JSON.parse(text)}catch{throw new Error('학습 기록 파일이 아니에요.')}
    if(!o||o.app!==APP||typeof o.data!=='object'||!o.data)throw new Error('이 사이트에서 내보낸 학습 기록 파일이 아니에요.');
    if(o.version>VERSION)throw new Error('더 새로운 버전에서 만든 파일이에요. 사이트를 새로고침한 뒤 다시 시도하세요.');
    const data={};for(const k in KEYS)if(o.data[k]&&typeof o.data[k]==='object'&&!Array.isArray(o.data[k]))data[k]=clean[KEYS[k]](o.data[k]);
    return {exportedAt:typeof o.exportedAt==='string'?o.exportedAt.slice(0,30):'',data};
  }
  function describe(data){return Object.keys(KEYS).filter(k=>data[k]&&Object.keys(data[k]).length).map(k=>`${LABEL[k]} ${Object.keys(data[k]).length}개`)}
  function merge(data){
    const changed={};
    for(const k in data){const type=KEYS[k],local=clean[type](read(k)),inc=data[k];let n=0;
      for(const [id,v] of Object.entries(inc)){const before=JSON.stringify(local[id]);local[id]=local[id]===undefined?v:mergeOne[type](local[id],v);if(JSON.stringify(local[id])!==before)n++}
      if(n){try{localStorage.setItem(k,JSON.stringify(local))}catch{throw new Error('브라우저 저장 공간이 부족해 불러오지 못했어요.')}changed[k]=n}}
    if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('geometry-data-changed'));
    return changed;
  }
  function download(){
    const blob=new Blob([JSON.stringify(snapshot(),null,1)],{type:'application/json'}),d=new Date(),name=`geometry-record-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}.json`;
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return name;
  }
  // 화면: 내보내기 버튼, 파일 고르기 → 내용 미리보기 → 합치기
  function mount(el){
    el.innerHTML=`<div class="backup-box"><h3>학습 기록 내보내기 · 불러오기</h3><p class="work-help">기록은 이 브라우저에만 있어요. 기기를 바꾸거나 브라우저 기록을 지우기 전에 파일로 내보내 두세요. 불러오면 지금 기록과 합쳐지고, 더 많이 진행한 기록이 남아요. 손풀이 필기는 포함되지 않아요.</p><div class="backup-actions"><button type="button" class="small-button" data-backup="export">기록 내보내기 (파일 저장)</button><label class="backup-file">기록 불러오기<input type="file" accept=".json,application/json" data-backup="file"></label></div><div class="backup-preview" hidden></div><p class="backup-status" role="status"></p></div>`;
    const status=el.querySelector('.backup-status'),preview=el.querySelector('.backup-preview');
    el.querySelector('[data-backup=export]').addEventListener('click',()=>{const items=describe(snapshot().data);const name=download();status.textContent=items.length?`"${name}" 파일로 저장했어요. (${items.join(', ')})`:'아직 저장된 학습 기록이 없지만 빈 파일을 저장했어요.'});
    el.querySelector('[data-backup=file]').addEventListener('change',async ev=>{const f=ev.target.files[0];preview.hidden=true;if(!f)return;
      try{const p=parse(await f.text());const items=describe(p.data);if(!items.length){status.textContent='파일에 불러올 기록이 없어요.';return}
        preview.hidden=false;preview.innerHTML=`<p><b>파일 내용</b> ${items.join(' · ')}${p.exportedAt?` · 내보낸 날 ${p.exportedAt.slice(0,10)}`:''}</p><button type="button" class="small-button" data-backup="merge">지금 기록과 합치기</button>`;status.textContent='';
        preview.querySelector('[data-backup=merge]').addEventListener('click',()=>{try{const c=merge(p.data);const n=Object.values(c).reduce((a,b)=>a+b,0);status.textContent=n?`불러왔어요. ${Object.entries(c).map(([k,v])=>`${LABEL[k]} ${v}개`).join(', ')}가 추가되거나 갱신됐어요.`:'이미 같은 기록이 있어서 바뀐 것이 없어요.';preview.hidden=true;ev.target.value=''}catch(e){status.textContent=e.message}});
      }catch(e){status.textContent=e.message}});
  }
  root.GeometryBackup={KEYS,snapshot,parse,merge,describe,download,mount};
})(typeof globalThis!=='undefined'?globalThis:this);
