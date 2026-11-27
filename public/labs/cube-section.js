import {create3d,panel,publish,fmt,COLORS} from './labkit.js';
import {cubeSection,dRange,classify,polyArea,CUBE} from './geometry.js';
const view=create3d(document.querySelector('#lab-view'),{size:3,camera:[6.5,-7.5,5.5],target:[1,1,1]});
const ui=panel(document.querySelector('#lab-panel'));
let n=[1,1,1],d=1.5;
const KEY='geometry-lab-cube-found';let found={};try{found=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
ui.heading('자르는 평면 ax + by + cz = d');
const nv=ui.vector({label:'법선벡터 (a, b, c)',value:n,min:-3,max:3,onInput:v=>{n=v;fitD();draw()}});
const ds=ui.slider({label:'d (평면의 위치)',min:0,max:6,step:.05,value:d,onInput:v=>{d=v;draw()}});
ui.note('프리셋으로 시작한 뒤 a, b, c와 d를 바꿔 보세요. 오각형과 육각형은 프리셋이 없어요. 직접 찾아보세요! 단면의 변 하나하나가 어느 면 위에 있는지도 살펴보세요.');
const presets=[['정삼각형',[1,1,1],1],['정사각형',[0,0,1],1],['직사각형',[1,1,0],2],['마름모',[1,1,3],4],['사다리꼴',[2,2,1],3]];
ui.buttons(presets.map(([name,pn,pd])=>[name,()=>{n=[...pn];nv.set(n);fitD();d=pd;ds.set(d);draw()}]));
const out=ui.readouts([['eq','평면의 방정식'],['sides','단면의 변의 개수'],['shape','단면의 모양'],['area','단면의 넓이']]);
const status=ui.status();
const tracker=document.createElement('p');tracker.className='lab-tracker';document.querySelector('#lab-panel').appendChild(tracker);
function fitD(){const [lo,hi]=dRange(n);ds.min=lo;ds.max=hi;if(d<lo||d>hi){d=(lo+hi)/2;ds.set(d)}}
const term=(c,x,first)=>c===0?'':`${c<0?'−':first?'':'+'}${Math.abs(c)===1?'':Math.abs(c)}${x}`;
function draw(){
 const poly=cubeSection(n,d),k=poly.length,shape=classify(poly);
 out.eq.textContent=(n.every(x=>x===0)?'법선벡터가 영벡터예요':`${term(n[0],'x',true)}${term(n[1],'y',!n[0])}${term(n[2],'z',!n[0]&&!n[1])} = ${fmt(d)}`);
 out.sides.textContent=k?k+'개':'–';out.shape.textContent=shape;out.area.textContent=k?fmt(polyArea(poly)):'–';
 if(k>=3){found[k]=true;try{localStorage.setItem(KEY,JSON.stringify(found))}catch{}}
 status.textContent=k?`단면은 ${shape}입니다. 평면이 정육면체의 면 ${k}개를 지나가요.`:'평면이 정육면체를 지나지 않거나 꼭짓점·모서리에만 닿아요. d를 바꿔 보세요.';
 tracker.textContent='찾은 단면: '+[3,4,5,6].map(s=>`${s}각형 ${found[s]?'✓':'·'}`).join('  ');
 if(view){view.clear();view.box([0,0,0],[2,2,2],COLORS.ink);CUBE.forEach(p=>view.point(p,COLORS.muted,.04));if(k>=3){view.polygon(poly,COLORS.a,.55);poly.forEach(p=>view.point(p,COLORS.a,.07))}view.render()}
 publish({lab:'cube-section',n,d,sides:k,shape,found:Object.keys(found).map(Number)});
}
fitD();draw();

