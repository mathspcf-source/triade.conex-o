/* ============================================================
   TRÍADE CONEXÃO — Helpers compartilhados
   ============================================================ */

// ---------- Sessão ----------
const Session = {
  set(papel, dados = {}) {
    const u = { papel, ...dados, login: Date.now() };
    localStorage.setItem('triade_user', JSON.stringify(u));
    return u;
  },
  get() {
    try { return JSON.parse(localStorage.getItem('triade_user')); }
    catch { return null; }
  },
  clear() { localStorage.removeItem('triade_user'); },
  requirePapel(papel) {
    const u = this.get();
    if (!u || u.papel !== papel) {
      window.location.href = 'login.html';
      return null;
    }
    return u;
  }
};

// ---------- Rotas de cada papel ----------
const ROTAS = {
  admin:     'admin.html',
  professor: 'professor.html',
  aluno:     'aluno.html',
  pais:      'pais.html'
};

// ---------- Navegação de abas ----------
function initTabs(titulos) {
  const app = document.getElementById('app');
  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab');

  function activateTab(key) {
    navItems.forEach(n => n.classList.toggle('active', n.dataset.tab === key));
    tabs.forEach(t => t.classList.toggle('active', t.id === 'tab-' + key));
    const [t, s] = titulos[key] || ['', ''];
    if (pageTitle) pageTitle.textContent = t;
    if (pageSub) pageSub.textContent = s;
    app.classList.remove('mobile-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(n => n.addEventListener('click', () => activateTab(n.dataset.tab)));

  const chip = document.querySelector('.user-chip');
  if (chip) chip.addEventListener('click', () => activateTab('perfil'));

  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', () => {
    if (window.innerWidth <= 820) app.classList.toggle('mobile-open');
    else app.classList.toggle('collapsed');
  });

  return { activateTab };
}

// ---------- Formulários ----------
function abrirForm(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}
function fecharForm(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function salvarSimples(id, msg) {
  fecharForm(id);
  alert(msg);
}
function filtrarTabela(tableId, inputId) {
  const q = document.getElementById(inputId).value.toLowerCase();
  document.querySelectorAll('#' + tableId + ' tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ---------- Upload de foto do perfil ----------
function initUploadPerfil() {
  const fileInput = document.getElementById('perfilFile');
  if (!fileInput) return;
  const perfilImg = document.getElementById('perfilImg');
  const perfilInitials = document.getElementById('perfilInitials');
  const chipAvatar = document.getElementById('chipAvatar');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      if (perfilImg) { perfilImg.src = src; perfilImg.style.display = 'block'; }
      if (perfilInitials) perfilInitials.style.display = 'none';
      if (chipAvatar) chipAvatar.innerHTML = '<img src="' + src + '" alt="">';
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Preencher dados do usuário na UI ----------
function preencherUsuarioUI(user) {
  if (!user) return;
  const iniciais = (user.nome || user.papel || 'U')
    .split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  const chipName = document.querySelector('.user-chip .info strong');
  const chipRole = document.querySelector('.user-chip .info span');
  const chipAvatar = document.getElementById('chipAvatar');
  const perfilNome = document.getElementById('perfilNome');
  const perfilEmail = document.getElementById('perfilEmail');
  const perfilInitials = document.getElementById('perfilInitials');
  const pNome = document.getElementById('pNome');
  const pEmail = document.getElementById('pEmail');

  const nome = user.nome || 'Usuário';
  const email = user.email || (user.papel + '@triade.com');

  if (chipName) chipName.textContent = nome;
  if (chipRole) chipRole.textContent = email;
  if (chipAvatar) chipAvatar.textContent = iniciais;
  if (perfilNome) perfilNome.textContent = nome;
  if (perfilEmail) perfilEmail.textContent = email;
  if (perfilInitials) perfilInitials.textContent = iniciais;
  if (pNome) pNome.value = nome;
  if (pEmail) pEmail.value = email;
}

// ---------- Logout ----------
function logout() {
  if (confirm('Deseja sair da plataforma?')) {
    Session.clear();
    window.location.href = 'login.html';
  }
}

// ---------- Boletim (compartilhado entre admin, professor, aluno, pais) ----------
const DADOS_BOLETIM = {
  fund: {
    label: 'Ensino Fundamental — 6º ao 9º ano',
    turmas: ['6º Ano A','7º Ano A','8º Ano B','9º Ano A'],
    disciplinas: ['Português','Matemática','Ciências','História','Geografia','Inglês','Artes','Ed. Física'],
    alunos: {
      '9º Ano A': [
        ['Ana Beatriz Souza', 8.5, 9.0, 8.0, 7.5, 8.0, 9.0, 9.5, 8.5],
        ['Bruno Carvalho',   7.0, 6.5, 7.5, 8.0, 7.0, 6.5, 8.0, 9.0],
        ['Camila Dias',      9.0, 9.5, 8.5, 9.0, 8.5, 9.5, 9.0, 9.0],
        ['Daniel Evaristo',  6.5, 6.0, 7.0, 6.5, 7.0, 6.0, 7.5, 8.0]
      ],
      '8º Ano B': [
        ['Eduarda Farias',   8.0, 7.5, 8.5, 8.0, 7.5, 8.0, 9.0, 9.0],
        ['Felipe Gomes',     7.5, 7.0, 7.5, 8.0, 7.0, 7.5, 8.5, 8.5],
        ['Giovana Horta',    9.0, 8.5, 9.0, 9.5, 9.0, 8.5, 9.5, 9.0]
      ],
      '7º Ano A': [
        ['Igor Iglesias',    7.0, 6.5, 7.5, 7.0, 6.5, 7.0, 8.0, 8.5],
        ['Júlia Knapp',      8.5, 8.0, 8.5, 9.0, 8.5, 8.0, 9.0, 9.5]
      ],
      '6º Ano A': [
        ['Kauan Lopes',      8.0, 7.5, 8.0, 8.5, 8.0, 7.5, 8.5, 9.0],
        ['Larissa Moraes',   9.0, 8.5, 9.0, 9.0, 8.5, 9.0, 9.5, 9.0]
      ]
    }
  },
  medio: {
    label: 'Ensino Médio — 1º ao 3º ano',
    turmas: ['1º Ano EM','2º Ano EM','3º Ano EM'],
    disciplinas: ['Português','Matemática','Física','Química','Biologia','História','Geografia','Filosofia','Sociologia','Inglês'],
    alunos: {
      '1º Ano EM': [
        ['Marcelo Nunes',    7.0, 6.5, 6.0, 6.5, 7.0, 7.5, 7.0, 8.0, 8.5, 7.5],
        ['Natália Oliveira', 8.5, 8.0, 7.5, 8.0, 8.5, 9.0, 8.5, 9.0, 9.0, 8.5],
        ['Otávio Pires',     6.5, 6.0, 6.5, 6.0, 6.5, 7.0, 6.5, 7.5, 7.5, 7.0]
      ],
      '2º Ano EM': [
        ['Paula Queiroz',    9.0, 8.5, 8.0, 8.5, 9.0, 9.5, 9.0, 9.0, 9.5, 9.0],
        ['Rafael Ribas',     7.5, 7.0, 7.5, 7.0, 7.5, 8.0, 7.5, 8.0, 8.5, 8.0]
      ],
      '3º Ano EM': [
        ['Sofia Teixeira',   9.5, 9.0, 9.5, 9.0, 9.5, 9.0, 9.5, 9.5, 9.0, 9.5],
        ['Thiago Uchôa',     8.0, 7.5, 8.0, 8.5, 8.0, 8.5, 8.0, 8.5, 8.5, 8.0],
        ['Valentina Vieira', 9.0, 9.5, 9.0, 9.5, 9.0, 9.5, 9.0, 9.5, 9.5, 9.0]
      ]
    }
  }
};

function media(arr) { return (arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(1); }

function renderBoletim(opts) {
  const selNivel = document.getElementById(opts.selNivel);
  const selTurma = document.getElementById(opts.selTurma);
  const chipsDisc = document.getElementById(opts.chipsDisc);
  const labelDisc = document.getElementById(opts.labelDisc);
  const titulo = document.getElementById(opts.titulo);
  const tabela = document.getElementById(opts.tabela);
  if (!selNivel || !tabela) return;

  const nivel = DADOS_BOLETIM[selNivel.value];

  if (labelDisc) labelDisc.textContent = nivel.label;
  if (chipsDisc) chipsDisc.innerHTML = nivel.disciplinas.map(d =>
    `<span style="padding:6px 12px;background:var(--azul-50);color:var(--azul-700);border-radius:999px;font-size:12px;font-weight:600;">${d}</span>`
  ).join('');

  const turma = selTurma ? (selTurma.value || nivel.turmas[0]) : nivel.turmas[0];
  if (titulo) titulo.textContent = 'Boletim — ' + turma;

  const alunos = nivel.alunos[turma] || [];
  const thead = '<tr><th>Aluno</th>' + nivel.disciplinas.map(d => `<th>${d}</th>`).join('') + '<th>Média</th></tr>';
  const tbody = alunos.map(row => {
    const nome = row[0];
    const notas = row.slice(1);
    const m = media(notas);
    const cor = parseFloat(m) >= 6 ? 'badge-ok' : 'badge-bad';
    return '<tr><td><strong>' + nome + '</strong></td>' +
      notas.map(n => `<td>${n.toFixed(1)}</td>`).join('') +
      `<td><span class="badge ${cor}">${m}</span></td></tr>`;
  }).join('') || '<tr><td colspan="'+(nivel.disciplinas.length+2)+'" style="text-align:center;padding:24px;color:var(--cinza-500);">Sem dados.</td></tr>';

  tabela.querySelector('thead').innerHTML = thead;
  tabela.querySelector('tbody').innerHTML = tbody;
}

function initBoletim(opts) {
  const selNivel = document.getElementById(opts.selNivel);
  const selTurma = document.getElementById(opts.selTurma);
  if (!selNivel) return;

  function popular() {
    const nivel = DADOS_BOLETIM[selNivel.value];
    if (selTurma) selTurma.innerHTML = nivel.turmas.map(t => `<option>${t}</option>`).join('');
  }

  selNivel.addEventListener('change', () => { popular(); renderBoletim(opts); });
  if (selTurma) selTurma.addEventListener('change', () => renderBoletim(opts));

  popular();
  renderBoletim(opts);
}
