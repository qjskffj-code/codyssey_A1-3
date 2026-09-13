const STORAGE_KEY='bound-mission-demo-v1';
const sample={
  tasks:[
    {id:'t1',title:'사용자 인터뷰 질문 다듬기',group:'Bound 리서치',tag:'집중',done:false},
    {id:'t2',title:'모바일 흐름 한 번 더 확인하기',group:'제품 경험',tag:'가볍게',done:false},
    {id:'t3',title:'미션 제출 스토리 초안 쓰기',group:'A1-3 제출',tag:'중요',done:true},
  ],
  projects:[
    {id:'p1',title:'Bound 학습 프로토타입',area:'Product',progress:68,color:'#4f8ee8',description:'쓰고 싶은 경험을 분석하고 나만의 프레이밍으로 확장하기',metric:'5명의 사용성 테스트 완료',response:'“다음 행동을 바로 고를 수 있어요.”',hurdle:'기능보다 흐름의 이유를 명확히 설명하기',boundaries:['첫 사용 3분 안에 이해','핵심 흐름은 3단계 이내','개인정보를 서버에 남기지 않기']},
    {id:'p2',title:'A1-3 미션 제출',area:'Learning',progress:42,color:'#826bd7',description:'과정과 배움을 재현 가능한 산출물로 정리하기',metric:'필수 제출물 5종 완성',response:'“왜 이렇게 만들었는지 이해돼요.”',hurdle:'카피가 아닌 학습과 확장의 맥락 보여주기',boundaries:['공개 가능한 자료만 사용','API 키 노출 금지','모바일 동작 검증']},
    {id:'p3',title:'주말 독서 모임',area:'Life',progress:20,color:'#49aa96',description:'좋은 문장을 나누는 작은 오프라인 모임 열기',metric:'첫 모임 6명 참여',response:'“다음 모임에도 오고 싶어요.”',hurdle:'참여자가 원하는 대화 방식을 모름',boundaries:['90분 안에 마치기','발언 강요하지 않기','준비물 최소화']},
  ]
};

const clone=value=>JSON.parse(JSON.stringify(value));
const load=()=>{try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY));return value&&Array.isArray(value.tasks)&&Array.isArray(value.projects)?value:clone(sample);}catch{return clone(sample);}};
let state=load(),selectedProject=state.projects[0].id,toastTimer;
const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const save=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('#saveState').innerHTML='<i></i>Saved locally';};
const toast=message=>{const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200);};

function showView(name){document.querySelectorAll('.view').forEach(view=>view.classList.toggle('is-active',view.id===`view-${name}`));document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('is-active',item.dataset.view===name));$('#sidebar').classList.remove('is-open');history.replaceState(null,'',`#${name}`);}
document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>showView(item.dataset.view)));
$('#openSidebar').addEventListener('click',()=>$('#sidebar').classList.add('is-open'));
$('#closeSidebar').addEventListener('click',()=>$('#sidebar').classList.remove('is-open'));

function renderTasks(){const list=$('#taskList');list.innerHTML=state.tasks.map(task=>`<div class="task-row ${task.done?'is-done':''}" data-id="${task.id}"><button class="task-check" aria-label="${task.done?'완료 취소':'완료'}">${task.done?'✓':''}</button><div class="task-copy"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.group)}</small></div><div><span class="task-tag">${escapeHtml(task.tag)}</span><button class="delete-task" aria-label="삭제">×</button></div></div>`).join('');list.querySelectorAll('.task-check').forEach(button=>button.addEventListener('click',()=>{const task=state.tasks.find(row=>row.id===button.closest('.task-row').dataset.id);task.done=!task.done;save();renderTasks();}));list.querySelectorAll('.delete-task').forEach(button=>button.addEventListener('click',()=>{state.tasks=state.tasks.filter(row=>row.id!==button.closest('.task-row').dataset.id);save();renderTasks();toast('할 일을 삭제했습니다.');}));const total=state.tasks.length,done=state.tasks.filter(task=>task.done).length,progress=total?Math.round(done/total*100):0;$('#progressValue').textContent=`${progress}%`;$('.progress-orbit').style.setProperty('--progress',`${progress}%`);$('#todayCount').textContent=String(state.tasks.filter(task=>!task.done).length);}
$('#showComposer').addEventListener('click',()=>{$('#taskForm').classList.remove('is-hidden');$('#taskInput').focus();});
$('#cancelComposer').addEventListener('click',()=>{$('#taskForm').classList.add('is-hidden');$('#taskInput').value='';});
$('#taskForm').addEventListener('submit',event=>{event.preventDefault();const input=$('#taskInput'),title=input.value.trim();if(!title){toast('할 일을 입력해 주세요.');return;}state.tasks.push({id:crypto.randomUUID(),title,group:'Inbox',tag:'새 항목',done:false});input.value='';save();renderTasks();toast('오늘 목록에 추가했습니다.');});

function renderProjects(){const grid=$('#projectGrid');grid.innerHTML=state.projects.map(project=>`<button class="project-card ${selectedProject===project.id?'is-selected':''}" data-id="${project.id}" style="--card-color:${project.color};--card-progress:${project.progress}%"><div class="project-top"><span class="ring"></span><small>${project.progress}%</small></div><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.area)}</p></button>`).join('');grid.querySelectorAll('.project-card').forEach(card=>card.addEventListener('click',()=>{selectedProject=card.dataset.id;renderProjects();}));const p=state.projects.find(project=>project.id===selectedProject)||state.projects[0];$('#projectFocus').innerHTML=`<h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.description)}</p><dl><div class="frame-line"><dt>▥ Metric Goal</dt><dd>${escapeHtml(p.metric)}</dd></div><div class="frame-line"><dt>◌ Desired Response</dt><dd>${escapeHtml(p.response)}</dd></div><div class="frame-line"><dt>△ Key Hurdle</dt><dd>${escapeHtml(p.hurdle)}</dd></div><div class="frame-line"><dt>○ Boundaries</dt><dd>${p.boundaries.map(escapeHtml).join(' · ')}</dd></div></dl>`;}

const resultSection=(icon,title,content,list=false)=>`<section class="result-section"><h3><span class="result-badge">${icon}</span>${title}</h3>${list?`<ul>${content.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`:`<p>${escapeHtml(content)}</p>`}</section>`;
function renderAiResult(data){const el=$('#aiResult');el.className='ai-result';el.innerHTML=`<h2>${escapeHtml(data.project_title)}</h2><p class="result-intro">AI가 제안한 프로젝트 프레임 · 필요에 맞게 수정하세요.</p>${resultSection('▥','Metric Goals',data.metric_goals,true)}${resultSection('◌','Desired Responses',data.desired_responses,true)}${resultSection('△','Key Hurdle',data.key_hurdle)}${resultSection('○','Boundaries',data.boundaries,true)}${resultSection('→','First Actions',data.first_actions,true)}`;}
function renderAiError(message){const el=$('#aiResult');el.className='ai-result ai-error';el.innerHTML=`<h2>제안을 만들지 못했습니다</h2><p class="result-intro">${escapeHtml(message)}</p><section class="result-section"><p>입력 내용을 확인하고 잠시 후 다시 시도해 주세요. 작성한 내용은 그대로 유지됩니다.</p></section>`;}
$('#frameForm').addEventListener('submit',async event=>{event.preventDefault();const name=$('#projectName').value.trim(),outcome=$('#projectOutcome').value.trim(),hurdle=$('#projectHurdle').value.trim(),button=$('#frameSubmit');if(!name||!outcome){toast('프로젝트 이름과 만들고 싶은 변화를 입력해 주세요.');return;}button.disabled=true;button.innerHTML='<span>✣</span> Framing…';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);try{const response=await fetch('/api/frame',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,outcome,hurdle}),signal:controller.signal});const data=await response.json().catch(()=>({error:'서버 응답을 읽지 못했습니다.'}));if(!response.ok)throw new Error(data.error||'AI 요청을 처리하지 못했습니다.');renderAiResult(data);}catch(error){renderAiError(error.name==='AbortError'?'응답 시간이 길어 요청을 중단했습니다.':error.message);}finally{clearTimeout(timeout);button.disabled=false;button.innerHTML='<span>✣</span> Frame with AI';}});

$('#resetDemo').addEventListener('click',()=>{if(!confirm('작성한 데모 데이터를 초기 상태로 되돌릴까요?'))return;state=clone(sample);selectedProject=state.projects[0].id;save();renderTasks();renderProjects();toast('샘플 데이터를 초기화했습니다.');});
const date=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'long'}).format(new Date());$('#todayDate').textContent=date.toUpperCase();renderTasks();renderProjects();showView(location.hash.slice(1)&&document.querySelector(`#view-${CSS.escape(location.hash.slice(1))}`)?location.hash.slice(1):'today');
