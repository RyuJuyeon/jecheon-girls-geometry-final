import {panel,publish,fmt} from './labkit.js';
// 2차원 SVG 실험: 강 너비 1 km, 강물은 동쪽(오른쪽)으로 흐른다. 배는 남쪽 기슭에서 북쪽 기슭으로 건넌다.
const el=document.querySelector('#lab-view');el.dataset.ready='svg';
const W=640,H=420,top=70,bottom=350,cx=200,kmPx=(bottom-top);
el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="강을 건너는 배의 속도 벡터 그림"><defs>${['boat','river','real'].map((id,i)=>`<marker id="ar-${id}" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" refX="13" refY="8" orient="auto" viewBox="0 0 16 16"><path d="M0 0L16 8L0 16Z" fill="${['#d35400','#1f5fbf','#1f7a4d'][i]}"/></marker>`).join('')}</defs>
<rect x="0" y="${top}" width="${W}" height="${bottom-top}" fill="#dcebf9"/><rect x="0" y="0" width="${W}" height="${top}" fill="#eef3e6"/><rect x="0" y="${bottom}" width="${W}" height="${H-bottom}" fill="#eef3e6"/>
<g fill="#7aa6d6">${Array.from({length:12},(_,i)=>`<path d="M${30+i*52} ${top+40+(i%3)*90} l24 0 l-6 -5 M${54+i*52} ${top+40+(i%3)*90} l-6 5" stroke="#7aa6d6" stroke-width="2" fill="none"/>`).join('')}</g>
<text x="12" y="${top-12}" font-size="15" fill="#3b4a2f">북쪽 기슭</text><text x="12" y="${H-14}" font-size="15" fill="#3b4a2f">남쪽 기슭 (출발)</text><text x="${W-118}" y="${top+22}" font-size="14" fill="#1f5fbf">강물 → 동쪽</text><text x="${W-110}" y="${bottom-10}" font-size="13" fill="#52627b">강 너비 1 km</text>
<path id="path" stroke="#1f7a4d" stroke-width="2" stroke-dasharray="6 5" fill="none"/><circle id="land" r="7" fill="#1f7a4d"/><circle cx="${cx}" cy="${bottom}" r="7" fill="#142440"/><line x1="${cx}" y1="${top}" x2="${cx}" y2="${bottom}" stroke="#94a3b8" stroke-dasharray="3 6"/>
<line id="vb" stroke="#d35400" stroke-width="4" marker-end="url(#ar-boat)"/><line id="vr" stroke="#1f5fbf" stroke-width="4" marker-end="url(#ar-river)"/><line id="vreal" stroke="#1f7a4d" stroke-width="5" marker-end="url(#ar-real)"/>
<g style="paint-order:stroke;stroke:#ffffff;stroke-width:4px;stroke-linejoin:round"><text id="lb" font-size="15" fill="#d35400">배의 속도</text><text id="lr" font-size="15" fill="#1f5fbf">강물</text><text id="lreal" font-size="15" fill="#1f7a4d" font-weight="700">실제 속도</text></g></svg>`;
const $=id=>el.querySelector('#'+id),set=(e,a)=>{for(const k in a)e.setAttribute(k,a[k])};
const ui=panel(document.querySelector('#lab-panel'));
let boat=4,river=2,angle=0;
ui.heading('속도를 바꿔 보기 (단위: km/h)');
const sb=ui.slider({label:'배의 속력 (물에 대한 속력)',min:1,max:8,step:.5,value:boat,unit:' km/h',onInput:v=>{boat=v;draw()}});
const sr=ui.slider({label:'강물의 속력',min:0,max:5,step:.5,value:river,unit:' km/h',onInput:v=>{river=v;draw()}});
const sa=ui.slider({label:'뱃머리 방향 (북쪽에서 서쪽으로 + 각)',min:-80,max:80,step:1,value:angle,unit:'°',onInput:v=>{angle=v;draw()}});
ui.buttons([['뱃머리를 정북으로',()=>{angle=0;sa.set(0);draw()}],['배 5, 강물 3',()=>{boat=5;river=3;sb.set(5);sr.set(3);draw()}]]);
const out=ui.readouts([['real','실제 속력'],['north','북쪽 성분 (건너는 빠르기)'],['time','강을 건너는 시간'],['drift','도착점이 출발점에서 동쪽으로 벗어난 거리']]);
const status=ui.status();
ui.note('실제 속도 = 배의 속도 + 강물의 속도 (벡터의 합)');
function draw(){
 const a=angle*Math.PI/180,vb=[-boat*Math.sin(a),boat*Math.cos(a)],vr=[river,0],v=[vb[0]+vr[0],vb[1]+vr[1]];
 const speed=Math.hypot(...v),north=v[1],time=north>0?1/north:Infinity,drift=north>0?v[0]*time:NaN;
 out.real.textContent=fmt(speed,3)+' km/h';out.north.textContent=fmt(north,3)+' km/h';out.time.textContent=north>0?`${fmt(time*60,1)}분`:'건널 수 없음';out.drift.textContent=north>0?`${fmt(drift,3)} km`:'–';
 status.textContent=north<=0?'북쪽으로 나아가지 못해요. 뱃머리 방향을 바꾸세요.':Math.abs(drift)<.005?'출발점 바로 맞은편에 도착해요!':drift>0?'강물에 밀려 하류(동쪽)에 도착해요.':'상류(서쪽)에 도착해요.';
 const sc=26,o=[cx,bottom],tip=w=>[o[0]+w[0]*sc,o[1]-w[1]*sc];
 const B=tip(vb),R=[B[0]+vr[0]*sc,B[1]],V=tip(v);
 set($('vb'),{x1:o[0],y1:o[1],x2:B[0],y2:B[1]});set($('vr'),{x1:B[0],y1:B[1],x2:R[0],y2:R[1],opacity:river?1:0});set($('vreal'),{x1:o[0],y1:o[1],x2:V[0],y2:V[1]});
 set($('lb'),{x:Math.min(B[0],o[0])-82,y:(o[1]+B[1])/2});set($('lr'),{x:(B[0]+R[0])/2-14,y:B[1]-10,opacity:river?1:0});set($('lreal'),{x:Math.max(V[0],o[0])+12,y:(o[1]+V[1])/2+18});
 if(north>0){const lx=Math.min(W-10,Math.max(10,cx+drift*kmPx));set($('path'),{d:`M${cx} ${bottom} L${lx} ${top}`});set($('land'),{cx:lx,cy:top,opacity:1})}else{set($('path'),{d:''});set($('land'),{opacity:0})}
 publish({lab:'boat',boat,river,angle,speed,minutes:time*60,drift});
}
draw();
