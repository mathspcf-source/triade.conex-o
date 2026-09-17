/* ============================================================
   TRÍADE CONEXÃO — Helpers compartilhados + Auth
   ============================================================ */

const Auth = {
  login(email, senha) {
    const usuarios = DB.list('usuarios');
    const u = usuarios.find(x =>
      x.email.toLowerCase() === email.toLowerCase() && x.senha === senha
    );
    if (!u) return { ok: false, erro: 'E-mail ou senha inválidos.' };
    const { senha: _, ...sessao } = u;
    localStorage.setItem('triade_session', JSON.stringify(sessao));
    return { ok: true, usuario: sessao };
  },

  logout() { localStorage.removeItem('triade_session'); },

  atual() {
    try { return JSON.parse(localStorage.getItem('triade_session')); }
    catch { return null; }
  },

  require(papel) {
    const u = this.atual();
    if (!u || u.papel !== papel) {
      window.location.href = 'login.html';
      return null;
    }
    return u;
  },

  atualizar(dados) {
    const u = this.atual();
    if (!u) return;
    const novo = { ...u, ...dados };
    localStorage.setItem('triade_session', JSON.stringify(novo));
    if (novo.id) DB.update('usuarios', novo.id, dados);
  }
};

const ROTAS = {
  admin:     'admin.html',
  professor: 'professor.html',
  aluno:     'aluno.html',
  pais:      'pais.html'
};

function fmtMoeda(v) { return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ','); }
function fmtData(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('pt-BR');
}
function hojeISO() { return new Date().toISOString().slice(0, 10); }

function media(arr) {
  if (!arr.length) return 0;
  return +(arr.reduce((a, b) => a + Number(b), 0) / arr.length).toFixed(1);
}

function calcularMediaAluno(alunoNome, turma, bimestre = 1) {
  const notas = DB.list('notas').filter(n =>
    n.aluno === alunoNome && n.turma === turma && n.bimestre === bimestre
  );
  return notas.length ? media(notas.map(n => n.nota)) : 0;
}

function calcularMediaTurma(turma, bimestre = 1) {
  const notas = DB.list('notas').filter(n => n.turma === turma && n.bimestre === bimestre);
  return notas.length ? media(notas.map(n => n.nota)) : 0;
}

function calcularFrequencia(aluno, turma) {
  const faltas = DB.list('faltas').filter(f => f.aluno === aluno && f.turma === turma);
  if (!faltas.length) return 100;
  const presentes = faltas.filter(f => f.status === 'Presente').length;
  return Math.round((presentes / faltas.length) * 100);
}

function initTabs(titulos) {
  const app = document.getElementById('app');
  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabs = document.querySelectorAll('.tab');

  function activateTab(key) {
    navItems.forEach(n => n.classList.toggle('active', n.dataset.tab === key));
    tabs.forEach(t => t.classList.toggle('active', t.id === 'tab-' + key));
    const [t, s] = titulos[key] || ['', ''];
    if (pageTitle) pageTitle.textContent = t;
    if (pageSub) pageSub.textContent = s;
    if (app) app.classList.remove('mobile-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(n => n.addEventListener('click', () => activateTab(n.dataset.tab)));

  const chip = document.querySelector('.user-chip');
  if (chip && chip.dataset.tab) chip.addEventListener('click', () => activateTab(chip.dataset.tab));

  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', () => {
    if (window.innerWidth <= 820) app.classList.toggle('mobile-open');
    else app.classList.toggle('collapsed');
  });

  return { activateTab };
}

function abrirForm(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}
function fecharForm(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'none'; const f = el.querySelector('form'); if (f) f.reset(); }
}
function filtrarTabela(tableId, inputId) {
  const q = document.getElementById(inputId).value.toLowerCase();
  document.querySelectorAll('#' + tableId + ' tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function initUploadPerfil() {
  const fileInput = document.getElementById('perfilFile');
  if (!fileInput) return;
  const perfilImg = document.getElementById('perfilImg');
  const perfilInitials = document.getElementById('perfilInitials');
  const chipAvatar = document.getElementById('chipAvatar');

  const u = Auth.atual();
  if (u && u.foto) {
    if (perfilImg) { perfilImg.src = u.foto; perfilImg.style.display = 'block'; }
    if (perfilInitials) perfilInitials.style.display = 'none';
    if (chipAvatar) chipAvatar.innerHTML = '<img src="' + u.foto + '" alt="">';
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      if (perfilImg) { perfilImg.src = src; perfilImg.style.display = 'block'; }
      if (perfilInitials) perfilInitials.style.display = 'none';
      if (chipAvatar) chipAvatar.innerHTML = '<img src="' + src + '" alt="">';
      Auth.atualizar({ foto: src });
    };
    reader.readAsDataURL(file);
  });
}

function preencherUsuarioUI(user) {
  if (!user) return;
  const iniciais = (user.nome || 'U')
    .split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  const set = (sel, txt) => { const el = document.querySelector(sel); if (el) el.textContent = txt; };
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

  set('.user-chip .info strong', user.nome || 'Usuário');
  set('.user-chip .info span', user.email || '');

  const chipAvatar = document.getElementById('chipAvatar');
  if (chipAvatar && !user.foto) chipAvatar.textContent = iniciais;

  set('#perfilNome', user.nome || '');
  set('#perfilEmail', user.email || '');
  const perfilInitials = document.getElementById('perfilInitials');
  if (perfilInitials && !user.foto) perfilInitials.textContent = iniciais;

  setVal('pNome', user.nome);
  setVal('pEmail', user.email);
  setVal('pGrad', user.graduacao);
  setVal('pEsp', user.especializacao);
  setVal('pTel', user.celular);
  setVal('pCargo', user.papel === 'admin' ? 'Administrador' : user.papel);
}

function logout() {
  if (confirm('Deseja sair da plataforma?')) {
    Auth.logout();
    window.location.href = 'login.html';
  }
}

function salvarPerfil(e) {
  e.preventDefault();
  const dados = {
    nome: document.getElementById('pNome')?.value.trim(),
    email: document.getElementById('pEmail')?.value.trim(),
    graduacao: document.getElementById('pGrad')?.value.trim(),
    especializacao: document.getElementById('pEsp')?.value.trim(),
    celular: document.getElementById('pTel')?.value.trim()
  };
  Auth.atualizar(dados);
  preencherUsuarioUI(Auth.atual());
  alert('Perfil atualizado com sucesso!');
}

function toast(msg, tipo = 'ok') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    padding:14px 20px; border-radius:10px; font-weight:600; font-size:14px;
    color:#fff; box-shadow:0 12px 28px rgba(0,0,0,.2);
    background:${tipo === 'ok' ? '#16A34A' : '#DC2626'};
    animation: slideIn .3s ease;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
