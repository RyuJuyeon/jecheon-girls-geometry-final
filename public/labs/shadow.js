import {create3d,panel,publish,fmt,COLORS} from './labkit.js';
const view=create3d(document.querySelector('#lab-view'),{size:4,camera:[7,-8,6],target:[0,1.5,1]});
const ui=panel(document.querySelector('#lab-panel'));
let deg=45,shape='square';
const shapes={
 square:{name:'정사각형 (한 변 4)',area:16,outline:()=>[[-2,0],[2,0],[2,4],[-2,4]]},
 triangle:{name:'삼각형 (밑변 4, 높이 4)',area:8,outline:()=>[[-2,0],[2,0],[0,4]]},
 circle:{name:'원 (반지름 2)',area:4*Math.PI,outline:()=>Array.from({length:48},(_,i)=>[2*Math.cos(i/48*2*Math.PI),2+2*Math.sin(i/48*2*Math.PI)])}
};
ui.heading('판을 세우는 각 θ');
ui.select({label:'판의 모양',options:Object.entries(shapes).map(([k,s])=>[k,s.name]),value:shape,onInput:v=>{shape=v;draw()}});
const s=ui.slider({label:'바닥과 판이 이루는 각 θ',min:0,max:90,step:1,value:deg,unit:'°',onInput:v=>{deg=v;draw()}});
ui.buttons([['0°',()=>set(0)],['30°',()=>set(30)],['45°',()=>set(45)],['60°',()=>set(60)],['90°',()=>set(90)]]);
const out=ui.readouts([['area','판의 넓이 S'],['shadow',"그림자(정사영)의 넓이 S'"],['ratio',"S' ÷ S"],['cos','cos θ']]);
const status=ui.status();
ui.note('빛은 바닥에 수직으로 비춥니다. 판은 x축을 경첩으로 세워져 있어요.');
function set(v){deg=v;s.set(v);draw()}
function draw(){
 const t=deg*Math.PI/180,S=shapes[shape],o=S.outline();
 const plate=o.map(([x,y])=>[x,y*Math.cos(t),y*Math.sin(t)]),shadow=o.map(([x,y])=>[x,y*Math.cos(t),0]);
 const area=S.area,sh=area*Math.cos(t);
 out.area.textContent=fmt(area);out.shadow.textContent=fmt(sh);out.ratio.textContent=fmt(sh/area,3);out.cos.textContent=fmt(Math.cos(t),3);
 status.textContent=deg===90?'판이 바닥에 수직이면 그림자는 선분이 되어 넓이가 0이에요.':`그림자의 넓이는 판의 넓이의 cos ${deg}° 배예요.`;
 if(view){view.clear();if(deg<90)view.polygon(shadow,'#555b66',.45);view.polygon(plate,COLORS.c,.55);
  for(const i of [0,Math.floor(o.length/3),Math.floor(2*o.length/3)]){const p=plate[i];if(p[2]>.05){view.line([p[0],p[1],p[2]+1.2],p,'#d4a017',{dashed:true});view.line(p,shadow[i],'#d4a017',{dashed:true})}}
  view.label('θ',[2.5,.6*Math.cos(t/2),.6*Math.sin(t/2)],COLORS.a);view.render()}
 publish({lab:'shadow',deg,shape,area,shadow:sh});
}
draw();
