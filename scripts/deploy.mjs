import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
// 사용자 인증은 gh의 표준 인증 흐름으로만 처리하며 토큰을 읽거나 출력하지 않는다.
const gh=process.platform==='win32'&&fs.existsSync('C:/Program Files/GitHub CLI/gh.exe')?'C:/Program Files/GitHub CLI/gh.exe':'gh';
const git=process.platform==='win32'&&fs.existsSync('C:/Program Files/Git/cmd/git.exe')?'C:/Program Files/Git/cmd/git.exe':'git';
const env={...process.env,PATH:path.dirname(git)+path.delimiter+process.env.PATH};
function run(exe,args,{optional=false,json=false}={}){const r=spawnSync(exe,args,{encoding:'utf8',env});if(r.status!==0){if(optional)return null;throw Error((r.stderr||r.error?.message||'명령 실패').trim())}return json?JSON.parse(r.stdout):r.stdout.trim()}
if(run(gh,['auth','status'],{optional:true})===null){console.error('GitHub 로그인이 필요합니다. gh auth login --hostname github.com --git-protocol https --web 실행 후 다시 시도하세요.');process.exit(2)}
const qa='output/qa/verification.json';if(!fs.existsSync(qa))throw Error('npm run build, npm run pdf, npm test를 먼저 실행하세요.');
const checks=JSON.parse(fs.readFileSync(qa,'utf8'));if(checks.checks.length<7||checks.questions!==20||checks.pdfCount!==7)throw Error('검증 결과가 완전하지 않습니다.');
const user=run(gh,['api','user'],{json:true});let repo='jecheon-girls-geometry-final';
const existingRemote=run(git,['remote','get-url','origin'],{optional:true});if(existingRemote)throw Error('이미 origin이 있습니다. 기존 연결을 확인한 뒤 수동으로 배포하세요: '+existingRemote);
if(run(gh,['repo','view',`${user.login}/${repo}`,'--json','name'],{optional:true})!==null)repo+='-'+new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14);
if(!fs.existsSync('.git'))run(git,['init','-b','main']);
run(git,['config','user.name',user.name||user.login]);run(git,['config','user.email',`${user.id}+${user.login}@users.noreply.github.com`]);
run(git,['add','.github','.gitignore','.gitattributes','README.md','VALIDATION.md','package.json','package-lock.json','content','public','scripts','output/pdf']);
run(git,['commit','-m','Add two-lesson geometry review course and printable materials']);
run(gh,['repo','create',`${user.login}/${repo}`,'--public','--description','제천여자고등학교 기하 기말 대비 2차시 학습자료·활동지','--source','.','--remote','origin']);
run(git,['push','-u','origin','main']);
// 기본 브랜치가 만들어진 후 Pages를 설정하고 검증·배포 워크플로를 명시적으로 실행한다.
run(gh,['api',`repos/${user.login}/${repo}/pages`,'--method','POST','-f','build_type=workflow']);
run(gh,['workflow','run','pages.yml','--repo',`${user.login}/${repo}`,'--ref','main']);
console.log(JSON.stringify({repository:`https://github.com/${user.login}/${repo}`,site:`https://${user.login}.github.io/${repo}/`,status:'워크플로 실행 중: 성공 여부와 실제 공개 URL을 확인해야 배포 완료입니다.'},null,2));
