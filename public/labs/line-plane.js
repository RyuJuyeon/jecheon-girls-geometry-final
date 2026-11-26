import {create3d,panel,publish,fmt,COLORS,vec,pt} from './labkit.js';
const view=create3d(document.querySelector('#lab-view'),{size:4,camera:[8.5,-9.5,6.5],target:[0,1,.6]});
const ui=panel(document.querySelector('#lab-panel'));
let A=[-1,0,1],u=[1,1,0],n=[1,2,1],d=6;
ui.heading('직선 (x, y, z) = A + t·u 와 평면 n·(x, y, z) = d');
const av=ui.vector({label:'직선 위의 점 A',value:A,min:-4,max:4,onInput:x=>{A=x;draw()}});
const uv=ui.vector({label:'방향벡터 u',value:u,min:-3,max:3,onInput:x=>{u=x;draw()}});
const nv=ui.vector({label:'평면의 법선벡터 n',value:n,min:-3,max:3,onInput:x=>{n=x;draw()}});
const ds=ui.slider({label:'d',min:-12,max:12,step:1,value:d,onInput:x=>{d=x;draw()}});
ui.buttons([['처음 상태',()=>{A=[-1,0,1];u=[1,1,0];n=[1,2,1];d=6;av.set(A);uv.set(u);nv.set(n);ds.set(d);draw()}],['u를 n과 수직으로',()=>{const e=Math.abs(n[2])<Math.max(Math.abs(n[0]),Math.abs(n[1]))?[0,0,1]:[1,0,0];u=vec.cross(n,e);if(vec.norm(u)<1e-9)u=[1,0,0];uv.set(u);draw()}],['u를 n과 같은 방향으로',()=>{u=[...n];uv.set(u);draw()}]]);
const out=ui.readouts([['dot','u · n'],['rel','직선과 평면의 위치 관계'],['t','만나는 점의 t'],['p','만나는 점']]);
const status=ui.status();
function draw(){
 const un=vec.dot(u,n),An=vec.dot(A,n)-d,zero=vec.norm(u)<1e-9||vec.norm(n)<1e-9;
 let rel,tt=NaN,P=null;
 if(zero)rel='벡터가 영벡터예요';
 else if(Math.abs(un)<1e-9)rel=Math.abs(An)<1e-9?'직선이 평면에 포함된다':'평행하다 (만나지 않는다)';
 else{tt=-An/un;P=vec.add(A,vec.scale(u,tt));rel=vec.norm(vec.cross(u,n))<1e-9?'한 점에서 수직으로 만난다':'한 점에서 만난다'}
 out.dot.textContent=fmt(un,3);out.rel.textContent=rel;out.t.textContent=P?fmt(tt,3):'–';out.p.textContent=P?pt(P):'–';
 status.textContent=zero?'방향벡터와 법선벡터는 영벡터가 아니어야 해요.':Math.abs(un)<1e-9?'u · n = 0 이면 직선의 방향이 평면과 나란해요. A가 평면 위에 있는지가 포함과 평행을 가릅니다.':'u · n ≠ 0 이면 직선은 평면과 꼭 한 점에서 만나요.';
 if(view){view.clear();if(vec.norm(n)>1e-9){view.plane(n,d,P||A,3.2,COLORS.plane,.2);const foot=P||vec.sub(A,vec.scale(n,An/vec.dot(n,n)));view.arrow(foot,vec.scale(n,1.6/vec.norm(n)),COLORS.b);view.label('n',vec.add(foot,vec.scale(n,2/vec.norm(n))),COLORS.b)}
  if(vec.norm(u)>1e-9){const k=7/vec.norm(u);view.line(vec.sub(A,vec.scale(u,k)),vec.add(A,vec.scale(u,k)),COLORS.a);view.arrow(A,u,COLORS.a);view.label('u',vec.add(A,vec.scale(u,1.15)),COLORS.a)}
  view.point(A,COLORS.ink,.1);view.label('A',vec.add(A,[0,0,.45]));if(P){view.point(P,COLORS.good,.13);view.label('P',vec.add(P,[0,0,.5]),COLORS.good)}view.render()}
 publish({lab:'line-plane',A,u,n,d,dot:un,relation:rel,t:tt,P});
}
draw();
