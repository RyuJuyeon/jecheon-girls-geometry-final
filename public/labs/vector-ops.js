import {create3d,panel,publish,fmt,COLORS,vec,pt} from './labkit.js';
const view=create3d(document.querySelector('#lab-view'),{size:4,camera:[8,-9,7],target:[0,1,1]});
const ui=panel(document.querySelector('#lab-panel'));
let u=[1,2,0],v=[0,1,2],s=1,t=1,showPlane=false;
ui.heading('두 벡터와 실수배');
const uv=ui.vector({label:'u = AB (A는 원점)',value:u,min:-3,max:3,onInput:x=>{u=x;draw()}});
const vv=ui.vector({label:'v = AC',value:v,min:-3,max:3,onInput:x=>{v=x;draw()}});
const ss=ui.slider({label:'s (u의 계수)',min:-3,max:3,step:.5,value:s,onInput:x=>{s=x;draw()}});
const ts=ui.slider({label:'t (v의 계수)',min:-3,max:3,step:.5,value:t,onInput:x=>{t=x;draw()}});
ui.toggle({label:'u, v를 포함하는 평면 보이기',onInput:x=>{showPlane=x;draw()}});
ui.buttons([['u + v',()=>{s=1;t=1;ss.set(1);ts.set(1);draw()}],['u − v',()=>{s=1;t=-1;ss.set(1);ts.set(-1);draw()}],['2u + v',()=>{s=2;t=1;ss.set(2);ts.set(1);draw()}],['처음 벡터로',()=>{u=[1,2,0];v=[0,1,2];uv.set(u);vv.set(v);draw()}]]);
const out=ui.readouts([['su','s·u'],['tv','t·v'],['w','w = s·u + t·v'],['len','|w|']]);
const status=ui.status();
function draw(){
 const su=vec.scale(u,s),tv=vec.scale(v,t),w=vec.add(su,tv),n=vec.cross(u,v);
 out.su.textContent=pt(su);out.tv.textContent=pt(tv);out.w.textContent=pt(w);out.len.textContent=fmt(vec.norm(w),3);
 status.textContent=vec.norm(n)<1e-9?'u와 v가 평행해요. 이때 s·u + t·v는 모두 한 직선 위에 있어요.':`w의 끝점은 s, t를 바꾸어도 항상 u와 v를 포함하는 평면 위에 있어요. 지금 w = ${fmt(s)}u ${t<0?'−':'+'} ${fmt(Math.abs(t))}v`;
 if(view){view.clear();
  if(showPlane&&vec.norm(n)>1e-9)view.plane(n,0,w,4.5,COLORS.plane,.12);
  view.arrow([0,0,0],u,COLORS.a);view.label('u',vec.add(vec.scale(u,.55),[0,0,.35]),COLORS.a);
  view.arrow([0,0,0],v,COLORS.b);view.label('v',vec.add(vec.scale(v,.55),[0,0,.35]),COLORS.b);
  view.arrow([0,0,0],su,'#e8a87c');view.arrow(su,tv,'#b39ddb');view.line(tv,w,COLORS.muted,{dashed:true});view.line([0,0,0],tv,COLORS.muted,{dashed:true});
  view.arrow([0,0,0],w,COLORS.good);view.label('w',vec.add(w,[0,0,.4]),COLORS.good);view.render()}
 publish({lab:'vector-ops',u,v,s,t,w});
}
draw();
