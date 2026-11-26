'use strict';
// 학생이 입력한 수식을 안전하게 해석하는 채점 엔진. eval을 사용하지 않는다.
// 허용: 정수·소수, + - * / ^, 괄호, √ 또는 sqrt 또는 루트, π 또는 pi, 곱셈 기호 생략(2√3, 3π/4).
(function(root){
  const MAX_LENGTH=60;
  function normalize(input){
    let s=String(input??'').normalize('NFKC').trim();
    if(s.includes('='))s=s.slice(s.lastIndexOf('=')+1);
    return s.replace(/\s+/g,'').replace(/[−–—﹣]/g,'-').replace(/[×·∙]/g,'*').replace(/÷/g,'/')
      .replace(/루트|sqrt|root/gi,'√').replace(/pi|파이/gi,'π').replace(/[°º]|도$/g,'');
  }
  function parse(input){
    const s=normalize(input);
    if(!s||s.length>MAX_LENGTH||!/^[0-9.+\-*/^()√π]+$/.test(s)||/\.\d*\./.test(s))return NaN;
    let i=0;
    const peek=()=>s[i];
    const number=()=>{const m=/^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;return Number(m[0])};
    function atom(){
      const c=peek();
      if(c==='('){i++;const v=expr();if(peek()!==')')throw 0;i++;return v}
      if(c==='π'){i++;return Math.PI}
      if(c==='√'){i++;const v=power();if(v<0)throw 0;return Math.sqrt(v)}
      if(c!==undefined&&/[0-9.]/.test(c))return number();
      throw 0;
    }
    function power(){const base=atom();if(peek()==='^'){i++;return base**unary()}return base}
    function unary(){if(peek()==='-'){i++;return -unary()}if(peek()==='+'){i++;return unary()}return power()}
    function term(){
      let v=unary();
      for(;;){
        const c=peek();
        if(c==='*'){i++;v*=unary()}
        else if(c==='/'){i++;const d=unary();if(d===0)throw 0;v/=d}
        else if(c==='('||c==='√'||c==='π'||(c!==undefined&&/[0-9.]/.test(c)))v*=power();
        else return v;
      }
    }
    function expr(){let v=term();for(;;){if(peek()==='+'){i++;v+=term()}else if(peek()==='-'){i++;v-=term()}else return v}}
    try{const v=expr();return i===s.length&&Number.isFinite(v)?v:NaN}catch{return NaN}
  }
  // 반환: 'correct' | 'approx'(소수 근삿값으로 인정) | 'wrong' | 'invalid' | 'empty'
  function grade(field,input){
    if(field.type==='choice'){if(input===''||input==null)return 'empty';return Number(input)===field.answer?'correct':'wrong'}
    const raw=normalize(input);if(!raw)return 'empty';
    let value=parse(input);if(!Number.isFinite(value))return 'invalid';
    const answer=parse(field.answer);
    if(field.type==='angle'&&!raw.includes('π'))value=value*Math.PI/180;
    const scale=Math.max(1,Math.abs(answer));
    if(Math.abs(value-answer)<=1e-9*scale)return 'correct';
    if(raw.includes('.')&&Math.abs(value-answer)<=Math.max(.01,1e-3*Math.abs(answer)))return 'approx';
    return 'wrong';
  }
  root.GeometryAnswer={parse,grade,normalize};
})(typeof globalThis!=='undefined'?globalThis:this);
