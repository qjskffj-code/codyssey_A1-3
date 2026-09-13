const STORAGE_KEY = 'bound-mission-demo-v1';

const SAMPLE_FRAME = {
  project_title: '작은 독서 모임',
  metric_goals: ['첫 모임에 6명이 참여한다', '90분 안에 대화를 마친다'],
  desired_responses: ['“다음 모임에도 오고 싶어요.”', '“말하지 않아도 편안했어요.”'],
  key_hurdle: '참여자가 원하는 대화 방식을 아직 모른다',
  boundaries: ['발언을 강요하지 않는다', '준비물을 최소화한다', '한 번에 한 문장만 다룬다'],
  first_actions: ['후보 참여자 두 명에게 원하는 경험을 묻는다', '90분 진행 순서를 한 장에 적는다'],
};

const sample = {
  thoughts: [
    { id: 'i1', title: '사용 전과 후의 감정 차이를 기록해 보기', detail: '기능보다 사용자가 느끼는 변화에 초점을 맞추고 싶다.', createdAt: '오늘' },
    { id: 'i2', title: '작은 독서 모임을 열면 어떨까?', detail: '좋은 문장을 부담 없이 나누는 90분짜리 모임.', createdAt: '어제' },
    { id: 'i3', title: '완료보다 시작을 쉽게 만드는 장치', detail: '', createdAt: '9월 11일' },
  ],
  tasks: [
    { id: 't1', title: '사용자 인터뷰 질문 다듬기', group: 'Bound 리서치', tag: '집중', done: false },
    { id: 't2', title: '모바일 흐름 한 번 더 확인하기', group: '제품 경험', tag: '가볍게', done: false },
    { id: 't3', title: '미션 제출 스토리 초안 쓰기', group: 'A1-3 제출', tag: '중요', done: true },
  ],
  projects: [
    { id: 'p1', title: 'Bound 학습 프로토타입', area: 'Product', progress: 68, color: '#4f8ee8', description: '쓰고 싶은 경험을 분석하고 나만의 프레이밍으로 확장하기', metric: '5명의 사용성 테스트 완료', response: '“다음 행동을 바로 고를 수 있어요.”', hurdle: '기능보다 흐름의 이유를 명확히 설명하기', boundaries: ['첫 사용 3분 안에 이해', '핵심 흐름은 3단계 이내', '개인정보를 서버에 남기지 않기'], nextAction: '첫 사용자가 멈추는 순간 한 곳을 관찰하기' },
    { id: 'p2', title: 'A1-3 미션 제출', area: 'Learning', progress: 42, color: '#826bd7', description: '과정과 배움을 재현 가능한 산출물로 정리하기', metric: '필수 제출물 5종 완성', response: '“왜 이렇게 만들었는지 이해돼요.”', hurdle: '카피가 아닌 학습과 확장의 맥락 보여주기', boundaries: ['공개 가능한 자료만 사용', 'API 키 노출 금지', '모바일 동작 검증'], nextAction: 'README의 개발 의도와 실제 화면을 대조하기' },
    { id: 'p3', title: '주말 독서 모임', area: 'Life', progress: 20, color: '#49aa96', description: '좋은 문장을 나누는 작은 오프라인 모임 열기', metric: '첫 모임 6명 참여', response: '“다음 모임에도 오고 싶어요.”', hurdle: '참여자가 원하는 대화 방식을 모름', boundaries: ['90분 안에 마치기', '발언 강요하지 않기', '준비물 최소화'], nextAction: '후보 참여자 두 명에게 원하는 대화 방식을 묻기' },
  ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || !Array.isArray(stored.tasks) || !Array.isArray(stored.projects)) return clone(sample);
    return {
      thoughts: Array.isArray(stored.thoughts) ? stored.thoughts : clone(sample.thoughts),
      tasks: stored.tasks,
      projects: stored.projects,
    };
  } catch {
    return clone(sample);
  }
}

let state = load();
let selectedProject = state.projects[0].id;
let toastTimer;

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $('#saveState').innerHTML = '<i></i>Saved locally';
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2200);
}

function showView(name) {
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('is-active', view.id === `view-${name}`));
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.view === name));
  document.querySelectorAll('.journey-step').forEach((item) => item.classList.toggle('is-active', item.dataset.view === name));
  document.body.dataset.view = name;
  $('#sidebar').classList.remove('is-open');
  history.replaceState(null, '', `#${name}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderThoughts() {
  const list = $('#thoughtList');
  $('#thoughtCount').textContent = String(state.thoughts.length);
  $('#thoughtSummary').textContent = `${state.thoughts.length}개의 생각`;
  list.innerHTML = state.thoughts.map((thought) => `
    <article class="thought-card" data-id="${escapeHtml(thought.id)}">
      <span class="thought-dot" aria-hidden="true"></span>
      <div class="thought-copy">
        <strong>${escapeHtml(thought.title)}</strong>
        ${thought.detail ? `<p>${escapeHtml(thought.detail)}</p>` : ''}
        <small>${escapeHtml(thought.createdAt || '오늘')}</small>
      </div>
      <div class="thought-actions">
        <button type="button" class="frame-thought">끝점 만들기 <span>→</span></button>
        <button type="button" class="delete-thought" aria-label="생각 삭제">×</button>
      </div>
    </article>
  `).join('');

  list.querySelectorAll('.frame-thought').forEach((button) => button.addEventListener('click', () => {
    const thought = state.thoughts.find((item) => item.id === button.closest('.thought-card').dataset.id);
    $('#projectName').value = thought.title;
    $('#projectOutcome').value = thought.detail;
    $('#projectHurdle').value = '';
    showView('frame');
    $('#projectOutcome').focus();
    toast('생각을 AI Frame으로 옮겼습니다.');
  }));

  list.querySelectorAll('.delete-thought').forEach((button) => button.addEventListener('click', () => {
    const id = button.closest('.thought-card').dataset.id;
    state.thoughts = state.thoughts.filter((item) => item.id !== id);
    save();
    renderThoughts();
    toast('생각을 삭제했습니다.');
  }));
}

function renderTasks() {
  const list = $('#taskList');
  list.innerHTML = state.tasks.map((task) => `
    <div class="task-row ${task.done ? 'is-done' : ''}" data-id="${escapeHtml(task.id)}">
      <button type="button" class="task-check" aria-label="${task.done ? '완료 취소' : '완료'}">${task.done ? '✓' : ''}</button>
      <div class="task-copy"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.group)}</small></div>
      <div><span class="task-tag">${escapeHtml(task.tag)}</span><button type="button" class="delete-task" aria-label="삭제">×</button></div>
    </div>
  `).join('');

  list.querySelectorAll('.task-check').forEach((button) => button.addEventListener('click', () => {
    const task = state.tasks.find((row) => row.id === button.closest('.task-row').dataset.id);
    task.done = !task.done;
    save();
    renderTasks();
  }));

  list.querySelectorAll('.delete-task').forEach((button) => button.addEventListener('click', () => {
    state.tasks = state.tasks.filter((row) => row.id !== button.closest('.task-row').dataset.id);
    save();
    renderTasks();
    toast('할 일을 삭제했습니다.');
  }));

  const total = state.tasks.length;
  const done = state.tasks.filter((task) => task.done).length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  $('#progressValue').textContent = `${progress}%`;
  $('.progress-orbit').style.setProperty('--progress', `${progress}%`);
  $('#todayCount').textContent = String(state.tasks.filter((task) => !task.done).length);
}

function renderProjects() {
  const grid = $('#projectGrid');
  $('#projectCount').textContent = String(state.projects.length);
  grid.innerHTML = state.projects.map((project) => `
    <button type="button" class="project-card ${selectedProject === project.id ? 'is-selected' : ''}" data-id="${escapeHtml(project.id)}" style="--card-color:${project.color};--card-progress:${project.progress}%">
      <div class="project-top"><span class="ring"></span><small>${project.progress}%</small></div>
      <h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.area)}</p><span class="project-open">View frame <i>→</i></span>
    </button>
  `).join('');

  grid.querySelectorAll('.project-card').forEach((card) => card.addEventListener('click', () => {
    selectedProject = card.dataset.id;
    renderProjects();
  }));

  const project = state.projects.find((item) => item.id === selectedProject) || state.projects[0];
  const sampleProject = sample.projects.find((item) => item.id === project.id);
  const nextAction = project.nextAction || sampleProject?.nextAction || '프로젝트의 다음 행동 한 가지 정하기';
  $('#projectFocus').innerHTML = `
    <header class="project-focus-head">
      <span class="focus-ring" style="--card-color:${project.color};--card-progress:${project.progress}%"><i>${project.progress}</i></span>
      <div><small>${escapeHtml(project.area)} · PROJECT FRAME</small><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.description)}</p></div>
    </header>
    <div class="project-blueprint">
      <section class="blueprint-card goal"><span>01 · FINISH</span><h3>Metric Goal</h3><p>${escapeHtml(project.metric)}</p></section>
      <section class="blueprint-card response"><span>02 · EXPERIENCE</span><h3>Desired Response</h3><p>${escapeHtml(project.response)}</p></section>
      <section class="blueprint-card hurdle"><span>03 · FOCUS</span><h3>Key Hurdle</h3><p>${escapeHtml(project.hurdle)}</p></section>
      <section class="blueprint-card boundary"><span>04 · GUARDRAILS</span><h3>Boundaries</h3><ul>${project.boundaries.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
    </div>
    <footer class="project-next"><div><small>NEXT AVAILABLE ACTION</small><strong>${escapeHtml(nextAction)}</strong></div><button type="button" id="startProjectAction">Add to Today <span>→</span></button></footer>
  `;

  $('#startProjectAction').addEventListener('click', () => addActionToToday(nextAction, project.title));
}

const resultSection = (icon, title, content, list = false, index = 0) => `
  <section class="result-section" style="--result-index:${index}">
    <h3><span class="result-badge">${icon}</span>${title}</h3>
    ${list ? `<ul>${content.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : `<p>${escapeHtml(content)}</p>`}
  </section>
`;

function renderAiResult(data, options = {}) {
  const element = $('#aiResult');
  const isSample = options.sample === true;
  element.className = 'ai-result';
  element.innerHTML = `
    <header class="result-head"><span>${isSample ? 'SAMPLE FRAME' : 'FRAME COMPLETE'}</span><h2>${escapeHtml(data.project_title)}</h2><p class="result-intro">${isSample ? '시연용 가상 데이터입니다. 실제 입력에는 Gemini가 새로운 초안을 제안합니다.' : 'AI가 만든 초안입니다. 사용자의 판단으로 고치고 다음 단계로 연결하세요.'}</p></header>
    <div class="result-path">
      ${resultSection('▥', 'Metric Goals', data.metric_goals, true, 0)}
      ${resultSection('◌', 'Desired Responses', data.desired_responses, true, 1)}
      ${resultSection('△', 'Key Hurdle', data.key_hurdle, false, 2)}
      ${resultSection('○', 'Boundaries', data.boundaries, true, 3)}
      ${resultSection('→', 'First Actions', data.first_actions, true, 4)}
    </div>
    <footer class="result-actions"><button type="button" class="secondary-action" id="sendFirstAction">첫 행동을 Today로</button><button type="button" class="result-primary" id="saveFrameProject">프로젝트로 저장 <span>→</span></button></footer>
  `;

  $('#sendFirstAction').addEventListener('click', () => addActionToToday(data.first_actions[0], data.project_title));
  $('#saveFrameProject').addEventListener('click', () => saveFrameAsProject(data));
}

function renderAiLoading() {
  const element = $('#aiResult');
  element.className = 'ai-result framing';
  element.innerHTML = `
    <div class="framing-symbol"><i></i><span>✣</span></div>
    <h2>끝점을 선명하게 만드는 중</h2>
    <p>답을 대신 결정하지 않고, 검토할 수 있는 기준으로 정리하고 있습니다.</p>
    <div class="framing-route"><span>Goal</span><i></i><span>Hurdle</span><i></i><span>Boundary</span><i></i><span>Action</span></div>
  `;
}

function addActionToToday(title, group) {
  if (!title) return;
  const exists = state.tasks.some((task) => task.title === title && task.group === group);
  if (!exists) {
    state.tasks.push({ id: makeId(), title, group, tag: '첫 행동', done: false });
    save();
    renderTasks();
  }
  showView('today');
  toast(exists ? '이미 Today에 있는 행동입니다.' : '첫 행동을 Today에 놓았습니다.');
}

function saveFrameAsProject(data) {
  const project = {
    id: makeId(),
    title: data.project_title,
    area: 'AI Framed',
    progress: 0,
    color: '#746cdb',
    description: '막연한 생각을 끝점과 첫 행동으로 구조화한 프로젝트',
    metric: data.metric_goals.join(' · '),
    response: data.desired_responses.join(' · '),
    hurdle: data.key_hurdle,
    boundaries: data.boundaries,
    nextAction: data.first_actions[0],
  };
  state.projects.unshift(project);
  selectedProject = project.id;
  save();
  renderProjects();
  showView('projects');
  toast('AI 초안을 새 프로젝트로 저장했습니다.');
}

function renderAiError(message) {
  const element = $('#aiResult');
  element.className = 'ai-result ai-error';
  element.innerHTML = `
    <h2>제안을 만들지 못했습니다</h2>
    <p class="result-intro">${escapeHtml(message)}</p>
    <section class="result-section"><p>입력 내용은 그대로 유지됩니다. 설정을 확인한 뒤 다시 시도해 주세요.</p></section>
    <button type="button" class="sample-preview-button" id="previewFrameError">대신 샘플 프레임 보기</button>
  `;
  $('#previewFrameError').addEventListener('click', () => renderAiResult(SAMPLE_FRAME, { sample: true }));
}

document.querySelectorAll('.nav-item, .journey-step').forEach((item) => item.addEventListener('click', () => showView(item.dataset.view)));
$('#openSidebar').addEventListener('click', () => $('#sidebar').classList.add('is-open'));
$('#closeSidebar').addEventListener('click', () => $('#sidebar').classList.remove('is-open'));
$('#previewFrame').addEventListener('click', () => renderAiResult(SAMPLE_FRAME, { sample: true }));

$('#thoughtForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const titleInput = $('#thoughtTitle');
  const detailInput = $('#thoughtDetail');
  const title = titleInput.value.trim();
  if (!title) {
    toast('떠오른 생각을 입력해 주세요.');
    return;
  }
  state.thoughts.unshift({ id: makeId(), title, detail: detailInput.value.trim(), createdAt: '방금 전' });
  titleInput.value = '';
  detailInput.value = '';
  save();
  renderThoughts();
  titleInput.focus();
  toast('생각을 안전하게 담았습니다.');
});

$('#showComposer').addEventListener('click', () => {
  $('#taskForm').classList.remove('is-hidden');
  $('#taskInput').focus();
});

$('#cancelComposer').addEventListener('click', () => {
  $('#taskForm').classList.add('is-hidden');
  $('#taskInput').value = '';
});

$('#taskForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('#taskInput');
  const title = input.value.trim();
  if (!title) {
    toast('할 일을 입력해 주세요.');
    return;
  }
  state.tasks.push({ id: makeId(), title, group: 'Inbox', tag: '새 항목', done: false });
  input.value = '';
  save();
  renderTasks();
  toast('오늘 목록에 추가했습니다.');
});

$('#frameForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = $('#projectName').value.trim();
  const outcome = $('#projectOutcome').value.trim();
  const hurdle = $('#projectHurdle').value.trim();
  const button = $('#frameSubmit');

  if (!name || !outcome) {
    toast('프로젝트 이름과 만들고 싶은 변화를 입력해 주세요.');
    return;
  }

  button.disabled = true;
  button.innerHTML = '<span>✣</span> Framing…';
  renderAiLoading();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('/api/frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, outcome, hurdle }),
      signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('AI 서버가 연결되지 않았습니다. 정적 미리보기가 아닌 API 개발 서버 또는 배포 주소에서 실행해 주세요.');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI 요청을 처리하지 못했습니다.');
    renderAiResult(data);
  } catch (error) {
    const message = error.name === 'AbortError' ? '응답 시간이 길어 요청을 중단했습니다.' : error.message;
    renderAiError(message || 'AI 서버와 통신하지 못했습니다.');
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.innerHTML = '<span>✣</span> Frame with AI';
  }
});

$('#resetDemo').addEventListener('click', () => {
  if (!confirm('작성한 데모 데이터를 초기 상태로 되돌릴까요?')) return;
  state = clone(sample);
  selectedProject = state.projects[0].id;
  save();
  renderThoughts();
  renderTasks();
  renderProjects();
  toast('샘플 데이터를 초기화했습니다.');
});

const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
$('#todayDate').textContent = date.toUpperCase();
renderThoughts();
renderTasks();
renderProjects();
const initialView = location.hash.slice(1);
showView(initialView && document.querySelector(`#view-${CSS.escape(initialView)}`) ? initialView : 'today');
