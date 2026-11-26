import {create3d,panel,publish,fmt,COLORS,vec,pt} from './labkit.js';
const A=[1,2,3],B=[5,4,1],A2=[A[0],A[1],-A[2]];
const view=create3d(document.querySelector('#lab-view'),{size:5,camera:[10,-6,7],target:[3,3,.5]});
const ui=panel(document.querySelector('#lab-panel'));
let P=[2,1,0],mirror=false,best=Infinity;
ui.heading('xy평면 위의 점 P(x, y, 0) 움직이기');
const sx=ui.slider({label:'P의 x좌표',min:-1,max:7,step:.1,value:P[0],onInput:v=>{P[0]=v;draw()}});
const sy=ui.slider({label:'P의 y좌표',min:-1,max:6,step:.1,value:P[1],onInput:v=>{P[1]=v;draw()}});
const out=ui.readouts([['ap','AP'],['pb','PB'],['sum','AP + PB'],['best','지금까지 찾은 가장 작은 값']]);
const status=ui.status();
ui.toggle({label:"A를 xy평면에 대칭이동한 점 A' 보이기",onInput:v=>{mirror=v;draw()}});
ui.note(`A${pt(A)}, B${pt(B)}는 모두 xy평면보다 위에 있어요.`);
function draw(){
 const ap=vec.norm(vec.sub(A,P)),pb=vec.norm(vec.sub(P,B)),sum=ap+pb;best=Math.min(best,sum);
 out.ap.textContent=fmt(ap,3);out.pb.textContent=fmt(pb,3);out.sum.textContent=fmt(sum,3);out.best.textContent=fmt(best,3);
 status.textContent=mirror?"AP = A'P 이므로 AP + PB = A'P + PB 예요. 초록 점선 A'B와 비교해 보세요.":'P를 움직이며 AP + PB가 가장 작아지는 위치를 찾아보세요.';
 if(view){view.clear();view.point(A,COLORS.a,.11);view.label('A',vec.add(A,[0,0,.45]),COLORS.a);view.point(B,COLORS.b,.11);view.label('B',vec.add(B,[0,0,.45]),COLORS.b);
  view.point(P,COLORS.ink,.1);view.label('P',vec.add(P,[0,-.4,-.35]));view.line(A,P,COLORS.a);view.line(P,B,COLORS.b);
  view.line(A,[A[0],A[1],0],COLORS.muted,{dashed:true});view.line(B,[B[0],B[1],0],COLORS.muted,{dashed:true});
  if(mirror){view.point(A2,COLORS.a,.09);view.label("A'",vec.add(A2,[0,0,-.45]),COLORS.a);view.line(A2,P,COLORS.a,{dashed:true});view.line(A2,B,COLORS.good,{dashed:true});view.line(A,A2,COLORS.muted,{dashed:true})}
  view.render()}
 publish({lab:'shortest-path',P,sum,best});
}
draw();
