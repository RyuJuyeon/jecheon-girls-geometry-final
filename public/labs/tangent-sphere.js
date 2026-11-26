import {create3d,panel,publish,fmt,COLORS,pt} from './labkit.js';
const view=create3d(document.querySelector('#lab-view'),{size:5,camera:[12,-13,10],target:[.5,1.5,2]});
const ui=panel(document.querySelector('#lab-panel'));
let C=[1,3,4],r=3,target='x';
const targets={x:'x축',y:'y축',z:'z축',xy:'xy평면',yz:'yz평면',zx:'zx평면'};
// 중심 C에서 기준(축 또는 좌표평면)까지의 거리와 가장 가까운 점
function nearest(c,t){if(t==='x')return [c[0],0,0];if(t==='y')return [0,c[1],0];if(t==='z')return [0,0,c[2]];if(t==='xy')return [c[0],c[1],0];if(t==='yz')return [0,c[1],c[2]];return [c[0],0,c[2]]}
ui.heading('구의 중심과 반지름');
const cv=ui.vector({label:'중심 C (x, y, z)',value:C,min:-4,max:4,onInput:v=>{C=v;draw()}});
const rs=ui.slider({label:'반지름 r',min:.5,max:7,step:.1,value:r,onInput:v=>{r=v;rn.value=v;draw()}});
const rn=ui.number({label:'반지름 직접 입력',value:r,min:.1,max:9,step:.01,onInput:v=>{r=v;rs.set(Math.min(7,Math.max(.5,v)));draw()}});
ui.select({label:'접하게 할 대상',options:Object.entries(targets),value:target,onInput:v=>{target=v;draw()}});
const out=ui.readouts([['c','중심'],['r','반지름'],['meet','대상과 만나는 모양']]);
const status=ui.status();
ui.note('반지름을 바꾸며 구가 대상에 꼭 한 점에서 닿는 순간을 찾아보세요. 그때의 반지름과 중심의 좌표를 비교해 보세요.');
function draw(){
 const H=nearest(C,target),dist=Math.hypot(C[0]-H[0],C[1]-H[1],C[2]-H[2]),isAxis=target.length===1,gap=r-dist,tan=Math.abs(gap)<.01;
 out.c.textContent='C'+pt(C);out.r.textContent=fmt(r);
 out.meet.textContent=tan?'한 점에서 접한다':gap<0?'만나지 않는다':isAxis?'두 점에서 만난다':'원에서 만난다';
 status.textContent=tan?`접했어요! 이때 반지름은 ${fmt(r)}이고, 접점은 ${pt(H)}예요.`:gap<0?'구가 대상에 닿지 않아요. 반지름을 키워 보세요.':'구가 대상을 뚫고 지나가요. 반지름을 줄여 보세요.';
 if(view){view.clear();view.sphere(C,r,tan?COLORS.good:COLORS.c,.2);view.point(C,COLORS.ink,.09);view.label('C',[C[0],C[1],C[2]+.45]);
  if(!isAxis){const n={xy:[0,0,1],yz:[1,0,0],zx:[0,1,0]}[target];view.plane(n,0,H,5,COLORS.plane,.12)}
  else{const d={x:[1,0,0],y:[0,1,0],z:[0,0,1]}[target];view.line(d.map(x=>-6*x),d.map(x=>6*x),COLORS.warn)}
  view.line(C,H,COLORS.a,{dashed:true});view.point(H,COLORS.a,.08);view.render()}
 publish({lab:'tangent-sphere',C,r,target,tangent:tan});
}
draw();
