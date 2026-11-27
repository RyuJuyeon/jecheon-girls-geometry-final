// 사이트에 보이는 모든 개수는 여기서 문항 데이터로부터 계산한다. 숫자를 직접 적지 않는다.
import {questions,lessons} from './course.mjs';
import {bankQuestions} from './bank.mjs';
import {labs} from './labs.mjs';
import {TYPES} from '../public/drill/generators.js';
export const EXAM_UNITS=['space','vectors'];
const isCore=q=>q.stage!=='도전';
export function lessonCounts(id){const qs=questions.filter(q=>q.lesson===id);return {total:qs.length,core:qs.filter(isCore).length,challenge:qs.filter(q=>!isCore(q)).length}}
export function downloadList(){return [...lessons.flatMap(l=>{const c=lessonCounts(l.id);return [['concepts','개념 학습자료','공식과 해석 · 예시 · 오개념'],['worksheet','학생용 활동지',`필수 ${c.core}문항 + 선택 ${c.challenge}문항 · 풀이 공간`],['solutions','해설과 교사용 지도안','정답 · 풀이 · 발문 · 부분점수']].map(([type,label,desc])=>({file:`lesson-${l.id}-${type}.pdf`,label:`${l.id}차시 ${label}`,desc}))}),{file:'student-complete.pdf',label:'학생용 전체 묶음',desc:`${lessons.length}차시 개념 학습자료와 활동지 합본`}]}
export const counts={
 lessons:lessons.length,
 review:questions.length,
 reviewCore:questions.filter(isCore).length,
 reviewChallenge:questions.filter(q=>!isCore(q)).length,
 bank:bankQuestions.length,
 bankByUnit:Object.fromEntries(['conics','space','vectors'].map(u=>[u,bankQuestions.filter(q=>q.unit===u).length])),
 labs:labs.length,
 labsByUnit:Object.fromEntries(['conics','space','vectors'].map(u=>[u,labs.filter(l=>l.unit===u).length])),
 drillTypes:TYPES.length,
 drillByUnit:Object.fromEntries(['space','vectors'].map(u=>[u,TYPES.filter(t=>t.unit===u).length])),
 get pdfs(){return downloadList().length}
};
