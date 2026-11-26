// 실험실 공용 도구: Three.js 장면(수학 좌표 z축이 위쪽)과 조작 패널. 네트워크 요청 없음.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export {THREE};
export const COLORS={x:'#c0392b',y:'#2e7d32',z:'#1f5fbf',a:'#d35400',b:'#6a3fb5',c:'#00838f',ink:'#142440',muted:'#7d8aa0',plane:'#3e6fb0',good:'#1f7a4d',warn:'#b3261e'};
const v3=p=>new THREE.Vector3(p[0],p[1],p[2]);
export const fmt=(x,d=2)=>{if(!Number.isFinite(x))return '–';const r=Math.round(x*10**d)/10**d;return (Object.is(r,-0)?0:r).toLocaleString('ko-KR',{maximumFractionDigits:d})};
export const vec={add:(a,b)=>a.map((x,i)=>x+b[i]),sub:(a,b)=>a.map((x,i)=>x-b[i]),scale:(a,k)=>a.map(x=>x*k),dot:(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm:a=>Math.hypot(...a),cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]};
export const pt=p=>`(${p.map(x=>fmt(x)).join(', ')})`;

function textSprite(text,color='#142440',scale=.55){
 const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');
 g.font='bold 56px "Noto Sans KR",sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=10;g.strokeStyle='rgba(255,255,255,.9)';g.strokeText(text,128,50);g.fillStyle=color;g.fillText(text,128,50);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(scale*2.67,scale,1);s.renderOrder=10;return s;
}

export function create3d(el,{size=5,camera=[8,-10,7],target=[0,0,0],grid=true,axes=true}={}){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});if(!renderer.getContext())throw new Error('no gl')}
 catch{el.innerHTML='<p class="lab-fallback">이 기기에서는 3D 화면을 열 수 없어요. 오른쪽 수치와 아래 질문으로 탐구를 이어 갈 수 있어요.</p>';el.dataset.ready='fallback';return null}
 el.querySelector('.lab-fallback')?.remove();renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));el.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','3차원 좌표공간 그림. 끌어서 돌리고 두 손가락이나 휠로 확대합니다.');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#f7f9fc');
 const cam=new THREE.PerspectiveCamera(40,1,.1,200);cam.up.set(0,0,1);cam.position.set(...camera);
 const controls=new OrbitControls(cam,renderer.domElement);controls.target.set(...target);controls.enablePan=false;controls.update();controls.minDistance=4;controls.maxDistance=40;
 scene.add(new THREE.AmbientLight(0xffffff,.75));const sun=new THREE.DirectionalLight(0xffffff,.9);sun.position.set(5,-6,10);scene.add(sun);
 const base=new THREE.Group();scene.add(base);
 if(grid){const g=new THREE.GridHelper(size*2,size*2,0xc9d3e3,0xe3e8f0);g.rotation.x=Math.PI/2;base.add(g)}
 if(axes){for(const [i,name] of ['x','y','z'].entries()){const d=[0,0,0];d[i]=1;const a=new THREE.ArrowHelper(v3(d),new THREE.Vector3(...d.map(x=>-x*size)),size*2+.6,COLORS[name],.35,.18);base.add(a);const s=textSprite(name,COLORS[name],.85);s.position.copy(v3(d.map(x=>x*(size+1))));base.add(s)}
  const o=textSprite('O',COLORS.muted,.6);o.position.set(-.35,-.35,-.3);base.add(o)}
 const layer=new THREE.Group();scene.add(layer);
 const disposeAll=obj=>obj.traverse(o=>{o.geometry?.dispose?.();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.map?.dispose?.();m.dispose()})}});
 let frame=0;const render=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;renderer.render(scene,cam)})};
 controls.addEventListener('change',render);
 const resize=()=>{const w=el.clientWidth||600,h=el.clientHeight||420;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();render()};
 new ResizeObserver(resize).observe(el);resize();
 const mat=(color,opacity=1)=>new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity>=1});
 const api={scene,camera:cam,controls,render,
  clear(){for(const c of [...layer.children]){layer.remove(c);disposeAll(c)}},
  point(p,color=COLORS.ink,r=.09){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(color));m.position.copy(v3(p));layer.add(m);return m},
  line(a,b,color=COLORS.ink,{dashed=false,width=1}={}){const geo=new THREE.BufferGeometry().setFromPoints([v3(a),v3(b)]);const m=dashed?new THREE.LineDashedMaterial({color,dashSize:.18,gapSize:.12}):new THREE.LineBasicMaterial({color,linewidth:width});const l=new THREE.Line(geo,m);if(dashed)l.computeLineDistances();layer.add(l);return l},
  arrow(o,v,color=COLORS.a){const len=Math.hypot(...v);if(len<1e-9)return null;const head=Math.min(.4,len*.3);const a=new THREE.ArrowHelper(v3(v).normalize(),v3(o),len,color,head,head*.55);layer.add(a);return a},
  polygon(points,color=COLORS.plane,opacity=.45){if(points.length<3)return null;const shape=new THREE.BufferGeometry();const verts=[];for(let i=1;i<points.length-1;i++)verts.push(...points[0],...points[i],...points[i+1]);shape.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));shape.computeVertexNormals();const m=new THREE.Mesh(shape,mat(color,opacity));layer.add(m);api.loop(points,color);return m},
  loop(points,color=COLORS.ink,dashed=false){for(let i=0;i<points.length;i++)api.line(points[i],points[(i+1)%points.length],color,{dashed})},
  plane(n,d,near=[0,0,0],half=3.5,color=COLORS.plane,opacity=.25){const nn=Math.hypot(...n);if(nn<1e-9)return null;const u=n.map(x=>x/nn);const c=vec.sub(near,vec.scale(u,vec.dot(u,near)-d/nn));const t=Math.abs(u[2])<.9?[0,0,1]:[1,0,0];const e1=vec.cross(u,t);const l1=Math.hypot(...e1);const a=e1.map(x=>x/l1),b=vec.cross(u,a);const corner=(s,t2)=>vec.add(c,vec.add(vec.scale(a,s*half),vec.scale(b,t2*half)));return api.polygon([corner(-1,-1),corner(1,-1),corner(1,1),corner(-1,1)],color,opacity)},
  sphere(c,r,color=COLORS.c,opacity=.22){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.SphereGeometry(r,40,28),mat(color,opacity));g.add(m);const w=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(r,16,10)),new THREE.LineBasicMaterial({color,transparent:true,opacity:.35}));g.add(w);g.position.copy(v3(c));layer.add(g);return g},
  box(min,max,color=COLORS.ink){const [a,b,c]=min,[x,y,z]=max;const P=[[a,b,c],[x,b,c],[x,y,c],[a,y,c],[a,b,z],[x,b,z],[x,y,z],[a,y,z]];for(const [i,j] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])api.line(P[i],P[j],color);return P},
  label(text,p,color=COLORS.ink,scale=.7){const s=textSprite(text,color,scale);s.position.copy(v3(p));layer.add(s);return s}
 };
 el.dataset.ready='3d';return api;
}

// ---- 조작 패널 ----
let uid=0;
export function panel(el){
 const make=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
 return {
  heading(text){el.appendChild(make('h3','lab-panel-title',text))},
  slider({label,min,max,step=1,value,onInput,unit=''}){const id='lab-ctl-'+(++uid);const row=make('div','lab-row');row.innerHTML=`<label for="${id}">${label}</label><div class="lab-slider"><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output for="${id}"></output></div>`;const input=row.querySelector('input'),out=row.querySelector('output');const show=()=>{out.textContent=fmt(Number(input.value))+unit};input.addEventListener('input',()=>{show();onInput?.(Number(input.value))});show();el.appendChild(row);input.set=v=>{input.value=v;show()};return input},
  number({label,value,min,max,step=1,onInput}){const id='lab-ctl-'+(++uid);const row=make('div','lab-row');row.innerHTML=`<label for="${id}">${label}</label><input id="${id}" type="number" inputmode="decimal" value="${value}" min="${min}" max="${max}" step="${step}">`;const input=row.querySelector('input');input.addEventListener('input',()=>{const v=Number(input.value);if(Number.isFinite(v)&&input.value!=='')onInput?.(Math.min(max,Math.max(min,v)))});el.appendChild(row);return input},
  vector({label,value,min=-3,max=3,step=1,onInput}){const id='lab-ctl-'+(++uid);const row=make('fieldset','lab-vector');row.innerHTML=`<legend>${label}</legend>`+['x','y','z'].slice(0,value.length).map((n,i)=>`<label>${n}<input id="${id}-${n}" type="number" inputmode="decimal" value="${value[i]}" min="${min}" max="${max}" step="${step}"></label>`).join('');const inputs=[...row.querySelectorAll('input')];const read=()=>inputs.map(i=>{const v=Number(i.value);return Number.isFinite(v)?Math.min(max,Math.max(min,v)):0});inputs.forEach(i=>i.addEventListener('input',()=>onInput?.(read())));el.appendChild(row);row.set=v=>{v.forEach((x,i)=>inputs[i].value=x)};return row},
  select({label,options,value,onInput}){const id='lab-ctl-'+(++uid);const row=make('div','lab-row');row.innerHTML=`<label for="${id}">${label}</label><select id="${id}">${options.map(([v,t])=>`<option value="${v}"${v===value?' selected':''}>${t}</option>`).join('')}</select>`;const s=row.querySelector('select');s.addEventListener('change',()=>onInput?.(s.value));el.appendChild(row);return s},
  buttons(list){const row=make('div','lab-buttons');for(const [text,fn] of list){const b=make('button','',text);b.type='button';b.addEventListener('click',fn);row.appendChild(b)}el.appendChild(row);return row},
  toggle({label,value=false,onInput}){const row=make('label','lab-toggle');row.innerHTML=`<input type="checkbox"${value?' checked':''}> ${label}`;const i=row.querySelector('input');i.addEventListener('change',()=>onInput?.(i.checked));el.appendChild(row);return i},
  readouts(rows){const dl=make('dl','lab-readouts');const out={};for(const [key,text] of rows){dl.insertAdjacentHTML('beforeend',`<dt>${text}</dt><dd data-readout="${key}">–</dd>`);out[key]=dl.lastElementChild}el.appendChild(dl);return out},
  status(){const p=make('p','lab-status');p.setAttribute('role','status');el.appendChild(p);return p},
  note(html){el.appendChild(make('p','lab-note',html))}
 };
}
// 테스트와 접근성을 위해 현재 상태를 문서에 기록한다.
export function publish(state){window.labState=state;document.documentElement.dataset.labState=JSON.stringify(state)}
