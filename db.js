/* ============================================================
   TRÍADE CONEXÃO — Camada de dados (localStorage)
   ============================================================ */

const DB = (() => {
  const PREFIX = 'triade_';

  // Entidades do sistema
  const ENTIDADES = [
    'usuarios', 'turmas', 'alunos', 'professores', 'planos',
    'pagamentos', 'atividades', 'notas', 'faltas', 'avisos', 'relatorios'
  ];

  // ---------- Helpers internos ----------
  function key(ent) { return PREFIX + ent; }

  function read(ent) {
    try {
      const raw = localStorage.getItem(key(ent));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function write(ent, arr) {
    localStorage.setItem(key(ent), JSON.stringify(arr));
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ---------- API pública ----------
  return {
    ENTIDADES,

    list(ent) { return read(ent); },

    get(ent, id) {
      return read(ent).find(r => r.id === id) || null;
    },

    find(ent, filtro = {}) {
      return read(ent).filter(r =>
        Object.entries(filtro).every(([k, v]) => r[k] === v)
      );
    },

    create(ent, obj) {
      const arr = read(ent);
      const novo = { id: genId(), criadoEm: new Date().toISOString(), ...obj };
      arr.push(novo);
      write(ent, arr);
      return novo;
    },

    update(ent, id, patch) {
      const arr = read(ent);
      const i = arr.findIndex(r => r.id === id);
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...patch, atualizadoEm: new Date().toISOString() };
      write(ent, arr);
      return arr[i];
    },

    remove(ent, id) {
      const arr = read(ent);
      const nova = arr.filter(r => r.id !== id);
      write(ent, nova);
      return arr.length !== nova.length;
    },

    // ---------- Reset total (útil para testes) ----------
    reset() {
      ENTIDADES.forEach(e => localStorage.removeItem(key(e)));
      localStorage.removeItem(PREFIX + 'seed_done');
      localStorage.removeItem(PREFIX + 'session');
    },

    // ---------- Seed ----------
    isSeeded() { return localStorage.getItem(PREFIX + 'seed_done') === '1'; },

    seed() {
      if (this.isSeeded()) return;

      // Usuários
      const usuarios = [
        { nome: 'Administrador',         email: 'admin@triade.com',     senha: 'admin123', papel: 'admin',
          graduacao: 'Pedagogia', especializacao: 'Gestão Escolar', celular: '(11) 99000-0001' },
        { nome: 'Prof. Marcos Vinícius', email: 'professor@triade.com', senha: 'prof123',  papel: 'professor',
          graduacao: 'Licenciatura em Matemática', especializacao: 'Mestrado em Educação Matemática',
          celular: '(11) 99871-2200', disciplina: 'Matemática' },
        { nome: 'Ana Beatriz Souza',     email: 'aluno@triade.com',     senha: 'aluno123', papel: 'aluno',
          turma: '9º Ano A', serie: '9º Ano - Fundamental', responsavel: 'Marta Souza',
          celular: '(11) 99871-3300' },
        { nome: 'Marta Souza',           email: 'pais@triade.com',      senha: 'pais123',  papel: 'pais',
          parentesco: 'Mãe', celular: '(11) 99871-3300', alunosVinculados: ['Ana Beatriz Souza'] }
      ];
      write('usuarios', usuarios.map(u => ({ id: genId(), criadoEm: new Date().toISOString(), ...u })));

      // Professores (perfis docentes)
      write('professores', [
        { id: genId(), nome: 'Marcos Vinícius', disciplina: 'Matemática',
          graduacao: 'Licenciatura em Matemática', especializacao: 'Mestrado',
          celular: '(11) 99871-2200', email: 'professor@triade.com', status: 'Ativo' },
        { id: genId(), nome: 'Juliana Alves', disciplina: 'Português',
          graduacao: 'Letras', especializacao: '', celular: '(11) 99855-1177',
          email: 'juliana@triade.com', status: 'Ativo' },
        { id: genId(), nome: 'Rafael Costa', disciplina: 'História',
          graduacao: 'História', especializacao: '', celular: '(11) 99844-3322',
          email: 'rafael@triade.com', status: 'Ativo' }
      ]);

      // Turmas
      const turmas = [
        { id: genId(), nome: '9º Ano A',  serie: '9º Ano', turno: 'Manhã', nivel: 'fund',
          professor: 'Marcos Vinícius', capacidade: 30, sala: 'Sala 04', status: 'Ativa' },
        { id: genId(), nome: '8º Ano B',  serie: '8º Ano', turno: 'Tarde', nivel: 'fund',
          professor: 'Juliana Alves', capacidade: 30, sala: 'Sala 05', status: 'Ativa' },
        { id: genId(), nome: '1º Ano EM', serie: '1º EM', turno: 'Noite', nivel: 'medio',
          professor: 'Rafael Costa', capacidade: 30, sala: 'Sala 06', status: 'Ativa' }
      ];
      write('turmas', turmas);

      // Alunos
      write('alunos', [
        { id: genId(), nome: 'Ana Beatriz Souza', nascimento: '2010-03-12', turma: '9º Ano A',
          responsavel: 'Marta Souza', celularResponsavel: '(11) 99871-3300',
          plano: '3 dias na semana', vencimento: 12, status: 'Ativo' },
        { id: genId(), nome: 'Bruno Carvalho', nascimento: '2010-06-22', turma: '9º Ano A',
          responsavel: 'Roberto Carvalho', celularResponsavel: '(11) 99822-1100',
          plano: '2 dias na semana', vencimento: 13, status: 'Ativo' },
        { id: genId(), nome: 'Camila Dias', nascimento: '2010-01-10', turma: '9º Ano A',
          responsavel: 'Cláudia Dias', celularResponsavel: '(11) 99811-2200',
          plano: '4 dias na semana', vencimento: 10, status: 'Ativo' },
        { id: genId(), nome: 'Eduarda Farias', nascimento: '2011-04-18', turma: '8º Ano B',
          responsavel: 'João Farias', celularResponsavel: '(11) 99800-3300',
          plano: '2 dias na semana', vencimento: 15, status: 'Ativo' },
        { id: genId(), nome: 'Felipe Gomes', nascimento: '2011-09-02', turma: '8º Ano B',
          responsavel: 'Ana Gomes', celularResponsavel: '(11) 99833-1100',
          plano: '1 dia na semana', vencimento: 20, status: 'Ativo' },
        { id: genId(), nome: 'Marcelo Nunes', nascimento: '2008-05-10', turma: '1º Ano EM',
          responsavel: 'Paulo Nunes', celularResponsavel: '(11) 99844-2200',
          plano: '3 dias na semana', vencimento: 12, status: 'Ativo' }
      ]);

      // Planos
      write('planos', [
        { id: genId(), nome: '1 dia na semana',   dias: 1, valor: 90,  vencimento: 10, descricao: '1 aula semanal' },
        { id: genId(), nome: '2 dias na semana',  dias: 2, valor: 140, vencimento: 10, descricao: '2 aulas semanais' },
        { id: genId(), nome: '3 dias na semana',  dias: 3, valor: 180, vencimento: 12, descricao: '3 aulas semanais' },
        { id: genId(), nome: '4 dias na semana',  dias: 4, valor: 220, vencimento: 10, descricao: '4 aulas semanais' },
        { id: genId(), nome: 'Semanal',           dias: 1, valor: 90,  vencimento: 5,  descricao: 'Cobrança semanal' }
      ]);

      // Pagamentos
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();
      write('pagamentos', [
        { id: genId(), aluno: 'Ana Beatriz Souza', plano: '3 dias na semana', valor: 180,
          mes: mesAtual, ano: anoAtual, vencimento: `12/${String(mesAtual).padStart(2,'0')}/${anoAtual}`,
          status: 'Pendente' },
        { id: genId(), aluno: 'Bruno Carvalho', plano: '2 dias na semana', valor: 140,
          mes: mesAtual, ano: anoAtual, vencimento: `13/${String(mesAtual).padStart(2,'0')}/${anoAtual}`,
          status: 'Pendente' },
        { id: genId(), aluno: 'Camila Dias', plano: '4 dias na semana', valor: 220,
          mes: mesAtual, ano: anoAtual, vencimento: `10/${String(mesAtual).padStart(2,'0')}/${anoAtual}`,
          status: 'Pago' },
        { id: genId(), aluno: 'Marcelo Nunes', plano: '3 dias na semana', valor: 180,
          mes: mesAtual, ano: anoAtual, vencimento: `05/${String(mesAtual).padStart(2,'0')}/${anoAtual}`,
          status: 'Atrasado' }
      ]);

      // Atividades
      write('atividades', [
        { id: genId(), titulo: 'Lista de equações', turma: '9º Ano A', disciplina: 'Matemática',
          prazo: '2025-06-20', descricao: 'Resolver lista 3', professor: 'Marcos Vinícius',
          entregas: [] },
        { id: genId(), titulo: 'Redação argumentativa', turma: '8º Ano B', disciplina: 'Português',
          prazo: '2025-06-22', descricao: 'Tema livre', professor: 'Juliana Alves',
          entregas: [] },
        { id: genId(), titulo: 'Cinemática', turma: '1º Ano EM', disciplina: 'Física',
          prazo: '2025-06-25', descricao: 'Exercícios 1-10', professor: 'Rafael Costa',
          entregas: [] }
      ]);

      // Notas (por aluno+turma+disciplina+bimestre)
      const disciplinasFund = ['Português','Matemática','Ciências','História','Geografia','Inglês','Artes','Ed. Física'];
      const disciplinasMedio = ['Português','Matemática','Física','Química','Biologia','História','Geografia','Filosofia','Sociologia','Inglês'];
      const notasSeed = [];

      const alunosFund9 = ['Ana Beatriz Souza','Bruno Carvalho','Camila Dias'];
      alunosFund9.forEach((aluno, idx) => {
        const base = [8.5, 9.0, 8.0, 7.5, 8.0, 9.0, 9.5, 8.5];
        disciplinasFund.forEach((disc, i) => {
          notasSeed.push({
            id: genId(), aluno, turma: '9º Ano A', disciplina: disc,
            bimestre: 1, nota: base[(i + idx) % base.length]
          });
        });
      });

      const alunosFund8 = ['Eduarda Farias','Felipe Gomes'];
      alunosFund8.forEach((aluno, idx) => {
        const base = [8.0, 7.5, 8.5, 8.0, 7.5, 8.0, 9.0, 9.0];
        disciplinasFund.forEach((disc, i) => {
          notasSeed.push({
            id: genId(), aluno, turma: '8º Ano B', disciplina: disc,
            bimestre: 1, nota: base[(i + idx) % base.length]
          });
        });
      });

      const alunosMedio1 = ['Marcelo Nunes'];
      alunosMedio1.forEach((aluno, idx) => {
        const base = [7.0, 6.5, 6.0, 6.5, 7.0, 7.5, 7.0, 8.0, 8.5, 7.5];
        disciplinasMedio.forEach((disc, i) => {
          notasSeed.push({
            id: genId(), aluno, turma: '1º Ano EM', disciplina: disc,
            bimestre: 1, nota: base[(i + idx) % base.length]
          });
        });
      });

      write('notas', notasSeed);

      // Faltas
      write('faltas', [
        { id: genId(), aluno: 'Bruno Carvalho', turma: '9º Ano A', data: '2025-06-05',
          disciplina: 'Matemática', status: 'Falta' },
        { id: genId(), aluno: 'Ana Beatriz Souza', turma: '9º Ano A', data: '2025-06-10',
          disciplina: 'Matemática', status: 'Presente' },
        { id: genId(), aluno: 'Bruno Carvalho', turma: '9º Ano A', data: '2025-06-10',
          disciplina: 'Matemática', status: 'Falta' },
        { id: genId(), aluno: 'Camila Dias', turma: '9º Ano A', data: '2025-06-10',
          disciplina: 'Matemática', status: 'Presente' }
      ]);

      // Avisos
      write('avisos', [
        { id: genId(), titulo: 'Simulado geral no sábado', publico: 'Alunos',
          mensagem: 'O simulado acontecerá das 8h às 12h. Trazer documento e caneta.',
          autor: 'Administrador', data: '2025-06-10' },
        { id: genId(), titulo: 'Reunião pedagógica', publico: 'Professores',
          mensagem: 'Reunião na sexta às 18h para alinhamento do novo bimestre.',
          autor: 'Administrador', data: '2025-06-09' },
        { id: genId(), titulo: 'Reunião de pais e mestres', publico: 'Pais',
          mensagem: 'Encontro no dia 20/06 às 19h no auditório. Presença obrigatória.',
          autor: 'Administrador', data: '2025-06-08' },
        { id: genId(), titulo: 'Novo horário de funcionamento', publico: 'Todos',
          mensagem: 'A partir de 15/06, o reforço funcionará das 7h às 21h.',
          autor: 'Administrador', data: '2025-06-05' }
      ]);

      // Relatórios
      write('relatorios', [
        { id: genId(), aluno: 'Ana Beatriz Souza', professor: 'Marcos Vinícius',
          periodo: '1º Bimestre', data: '2025-06-09',
          observacoes: 'Excelente evolução em matemática. Recomendo manter o ritmo de estudos.' },
        { id: genId(), aluno: 'Bruno Carvalho', professor: 'Juliana Alves',
          periodo: '1º Bimestre', data: '2025-06-09',
          observacoes: 'Precisa reforçar atenção nas aulas. Sugiro atividades complementares.' }
      ]);

      localStorage.setItem(PREFIX + 'seed_done', '1');
    }
  };
})();

// Roda o seed automaticamente ao carregar
DB.seed();
