// 기말 대비 준비도와 예상 점수(참고용). 문제은행·실험 채점 기록과 오답노트만 사용하며, 이 브라우저 안에서 계산한다.
// 예상 점수는 실제 시험 결과로 맞춰 본 공식이 아니므로 범위로 보여 주고, 푼 문제가 적으면 예측하지 않는다.
export const EXAM_UNITS=['space','vectors'];
export const UNIT_WEIGHT={space:.5,vectors:.5};
export const STAGE_WEIGHT={'기본':1,'적용':2,'도전':3,'실험':2};
export const MIN_TOTAL=15,MIN_PER_UNIT=4,PRIOR=.6,PRIOR_WEIGHT=4;
// 한 문항의 성취: 한 번에 맞힘 1, 여러 번 만에 맞힘 0.8, 오답노트 졸업 1, 남은 오답은 맞혔어도 0.5, 틀림 0. 안 푼 문항은 null.
export function credit(id,grades,mistakes){
 const g=grades[id],m=mistakes[id],tried=g&&typeof g.tries==='number'&&g.tries>0;
 if(m&&m.status==='graduated')return 1;
 if(m&&m.status==='open')return tried&&g.solved===true?.5:0;
 if(!tried)return null;
 return g.solved===true?(g.tries<=1?1:.8):0;
}
export function compute({items,grades={},mistakes={}}){
 const scoped=items.filter(i=>EXAM_UNITS.includes(i.unit));
 const units={};
 for(const u of EXAM_UNITS){
  const list=scoped.filter(i=>i.unit===u);let wAll=0,wAtt=0,earned=0,attempted=0,solved=0;
  for(const i of list){const w=STAGE_WEIGHT[i.stage]||1,c=credit(i.id,grades,mistakes);wAll+=w;if(c!==null){wAtt+=w;earned+=w*c;attempted++;if(c>=.8)solved++}}
  units[u]={total:list.length,attempted,solved,mastery:wAll?earned/wAll:0,coverage:wAll?wAtt/wAll:0,estimate:(earned+PRIOR*PRIOR_WEIGHT)/(wAtt+PRIOR_WEIGHT),weightAll:wAll,weightAttempted:wAtt};
 }
 const attempted=EXAM_UNITS.reduce((s,u)=>s+units[u].attempted,0),total=EXAM_UNITS.reduce((s,u)=>s+units[u].total,0);
 const ready=attempted>=MIN_TOTAL&&EXAM_UNITS.every(u=>units[u].attempted>=MIN_PER_UNIT);
 let prediction=null;
 if(ready){
  const p=EXAM_UNITS.reduce((s,u)=>s+UNIT_WEIGHT[u]*units[u].estimate,0),cov=EXAM_UNITS.reduce((s,u)=>s+UNIT_WEIGHT[u]*units[u].coverage,0);
  const mid=Math.round(100*p),half=Math.min(15,Math.max(4,Math.round(150*Math.sqrt(p*(1-p)/attempted)+10*(1-cov))));
  prediction={mid,low:Math.max(0,mid-half),high:Math.min(100,mid+half),coverage:cov};
 }
 const need={total:Math.max(0,MIN_TOTAL-attempted),perUnit:Object.fromEntries(EXAM_UNITS.map(u=>[u,Math.max(0,MIN_PER_UNIT-units[u].attempted)]))};
 const level=prediction?(prediction.mid>=90?'탄탄해요':prediction.mid>=75?'안정권이에요':prediction.mid>=60?'조금만 더!':'기본부터 다시 다져요'):null;
 return {units,attempted,total,prediction,need,level};
}
