// 실험실의 순수 계산 함수. 브라우저와 검증 스크립트(Node)에서 함께 사용한다.
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],scale=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],norm=a=>Math.hypot(a[0],a[1],a[2]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const CUBE=[[0,0,0],[2,0,0],[2,2,0],[0,2,0],[0,0,2],[2,0,2],[2,2,2],[0,2,2]];
export const CUBE_EDGES=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
// 평면 n·x=d로 정육면체 [0,2]³을 자른 단면의 꼭짓점(둘레 순서).
export function cubeSection(n,d,eps=1e-9){
 if(norm(n)<eps)return [];
 const pts=[];const push=p=>{if(!pts.some(q=>norm(sub(p,q))<1e-7))pts.push(p)};
 for(const [i,j] of CUBE_EDGES){const P=CUBE[i],Q=CUBE[j],fp=dot(n,P)-d,fq=dot(n,Q)-d;if(Math.abs(fp)<eps)push(P);if(Math.abs(fq)<eps)push(Q);if(fp*fq<0&&Math.abs(fp)>eps&&Math.abs(fq)>eps)push(add(P,scale(sub(Q,P),fp/(fp-fq))))}
 if(pts.length<3)return [];
 const c=scale(pts.reduce(add,[0,0,0]),1/pts.length);const u=scale(n,1/norm(n));const t=Math.abs(u[2])<.9?[0,0,1]:[1,0,0];const a=cross(u,t),b=cross(u,a);
 return pts.sort((p,q)=>Math.atan2(dot(sub(p,c),b),dot(sub(p,c),a))-Math.atan2(dot(sub(q,c),b),dot(sub(q,c),a)));
}
export function dRange(n){const v=CUBE.map(p=>dot(n,p));return [Math.min(...v),Math.max(...v)]}
const close=(a,b)=>Math.abs(a-b)<1e-6;
const parallel=(a,b)=>norm(cross(a,b))<1e-6*Math.max(1,norm(a)*norm(b));
export function classify(poly){
 const k=poly.length;if(k<3)return '단면 없음';
 const sides=poly.map((p,i)=>sub(poly[(i+1)%k],p)),len=sides.map(norm),allEq=len.every(l=>close(l,len[0]));
 if(k===3)return allEq?'정삼각형':(close(len[0],len[1])||close(len[1],len[2])||close(len[0],len[2]))?'이등변삼각형':'삼각형';
 if(k===4){const p1=parallel(sides[0],sides[2]),p2=parallel(sides[1],sides[3]);const right=close(dot(sides[0],sides[1]),0);
  if(p1&&p2){if(allEq)return right?'정사각형':'마름모';return right?'직사각형':'평행사변형'}
  return p1||p2?'사다리꼴':'사각형'}
 if(k===5)return '오각형';
 if(k===6)return allEq?'정육각형':'육각형';
 return k+'각형';
}
export const polyArea=poly=>{let s=[0,0,0];for(let i=1;i<poly.length-1;i++)s=add(s,cross(sub(poly[i],poly[0]),sub(poly[i+1],poly[0])));return norm(s)/2};
export const perimeterSides=poly=>poly.map((p,i)=>norm(sub(poly[(i+1)%poly.length],p)));
export {dot,sub,add,scale,norm,cross};
