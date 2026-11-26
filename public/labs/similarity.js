import {create3d,panel,publish,fmt,COLORS,vec,pt} from './labkit.js';
const view=create3d(document.querySelector('#lab-view'),{size:5,camera:[9,-10,7],target:[2,2,2],grid:true});
const ui=panel(document.querySelector('#lab-panel'));
let a=[1,2,2],b=[3,1,1];
ui.heading('두 학생의 장르별 선호 점수 (0~5점)');
ui.note('x: 액션, y: 코미디, z: 다큐멘터리. 점수를 벡터로 보면 방향이 취향을 나타내요.');
const av=ui.vector({label:'학생 A의 점수 a',value:a,min:0,max:5,onInput:x=>{a=x;draw()}});
const bv=ui.vector({label:'학생 B의 점수 b',value:b,min:0,max:5,onInput:x=>{b=x;draw()}});
ui.buttons([['b를 a의 2배로',()=>{b=a.map(x=>Math.min(5,2*x));bv.set(b);draw()}],['정반대 취향',()=>{a=[5,0,0];b=[0,5,0];av.set(a);bv.set(b);draw()}],['처음 상태',()=>{a=[1,2,2];b=[3,1,1];av.set(a);bv.set(b);draw()}]]);
const out=ui.readouts([['dot','a · b'],['na','|a|'],['nb','|b|'],['cos','유사도 cos θ = a·b ÷ (|a||b|)'],['deg','두 벡터가 이루는 각 θ']]);
const status=ui.status();
function draw(){
 const d=vec.dot(a,b),na=vec.norm(a),nb=vec.norm(b),ok=na>0&&nb>0,c=ok?d/(na*nb):NaN,deg=ok?Math.acos(Math.min(1,Math.max(-1,c)))*180/Math.PI:NaN;
 out.dot.textContent=fmt(d);out.na.textContent=fmt(na,3);out.nb.textContent=fmt(nb,3);out.cos.textContent=fmt(c,3);out.deg.textContent=ok?fmt(deg,1)+'°':'–';
 status.textContent=!ok?'모든 점수가 0인 벡터는 방향이 없어 유사도를 정할 수 없어요.':c>.999?'두 취향의 방향이 같아요. 점수의 크기가 달라도 유사도는 1이에요.':c>.9?'취향이 매우 비슷해요.':c>.6?'취향이 어느 정도 비슷해요.':'취향이 많이 달라요.';
 if(view){view.clear();view.arrow([0,0,0],a,COLORS.a);view.label('a',vec.add(a,[0,0,.4]),COLORS.a);view.arrow([0,0,0],b,COLORS.b);view.label('b',vec.add(b,[0,0,.4]),COLORS.b);
  if(ok){const ua=vec.scale(a,1/na),ub=vec.scale(b,1/nb),arc=[];for(let i=0;i<=16;i++){const m=vec.add(vec.scale(ua,1-i/16),vec.scale(ub,i/16)),l=vec.norm(m);arc.push(l>1e-9?vec.scale(m,1.4/l):m)}for(let i=0;i<16;i++)view.line(arc[i],arc[i+1],COLORS.good);view.label('θ',vec.scale(vec.add(ua,ub),1.1),COLORS.good)}
  view.render()}
 publish({lab:'similarity',a,b,cos:c,deg});
}
draw();
