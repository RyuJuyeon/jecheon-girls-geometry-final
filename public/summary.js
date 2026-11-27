// 이름 없는 결과 요약 코드. 단원별 준비도, 유형별 남은 오답 수, 틀린 이유 개수만 담는다.
// 이름·학번·입력한 답·날짜별 기록은 담지 않는다. 교사는 여러 코드를 붙여넣어 반 전체 경향을 본다.
export const PREFIX='GEO1';
const fnv=s=>{let h=0x811c9dc5;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,'0').slice(-4)};
const b64e=s=>{const bytes=new TextEncoder().encode(s);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const b64d=s=>{const bin=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4));return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))};
export const REASON_KEYS=['concept','condition','calc','method'];
// summary: {week, units:{space:{attempted,total,pct},vectors:{...}}, stage(0~4), open:{type:n}, reasons:[4], graduated, drillDone:[type]}
export function encode(s){
 const p={v:1,w:s.week,u:{s:[s.units.space.attempted,s.units.space.total,s.units.space.pct],v:[s.units.vectors.attempted,s.units.vectors.total,s.units.vectors.pct]},l:s.stage,m:s.open,r:s.reasons,g:s.graduated,x:s.drillDone};
 const body=b64e(JSON.stringify(p));return `${PREFIX}-${body}-${fnv(body)}`;
}
const okInt=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max;
export function decode(code){
 const m=/^GEO1-([A-Za-z0-9_-]{8,2000})-([0-9a-f]{4})$/.exec(String(code).trim());if(!m)return null;
 if(fnv(m[1])!==m[2])return null;
 let p;try{p=JSON.parse(b64d(m[1]))}catch{return null}
 if(!p||p.v!==1||!p.u||!Array.isArray(p.u.s)||!Array.isArray(p.u.v))return null;
 const unit=a=>a.length===3&&okInt(a[0],500)&&okInt(a[1],500)&&okInt(a[2],100)?{attempted:a[0],total:a[1],pct:a[2]}:null;
 const space=unit(p.u.s),vectors=unit(p.u.v);if(!space||!vectors)return null;
 const open={};if(p.m&&typeof p.m==='object')for(const [k,v] of Object.entries(p.m))if(/^[a-z-]{2,30}$/.test(k)&&okInt(v,500))open[k]=v;
 const reasons=Array.isArray(p.r)&&p.r.length===4&&p.r.every(x=>okInt(x,1000))?p.r:[0,0,0,0];
 return {week:typeof p.w==='string'&&/^\d{4}-W\d{2}$/.test(p.w)?p.w:'',units:{space,vectors},stage:okInt(p.l,4)?p.l:0,open,reasons,graduated:okInt(p.g,1000)?p.g:0,drillDone:Array.isArray(p.x)?p.x.filter(x=>typeof x==='string'&&/^[a-z-]{2,30}$/.test(x)).slice(0,40):[]};
}
// 같은 붙여넣기 안에서 코드만 골라낸다
export function extract(text){return [...String(text).matchAll(/GEO1-[A-Za-z0-9_-]{8,2000}-[0-9a-f]{4}/g)].map(x=>x[0])}
export function isoWeek(d=new Date()){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=t.getUTCFullYear(),w=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7);return `${y}-W${String(w).padStart(2,'0')}`}
