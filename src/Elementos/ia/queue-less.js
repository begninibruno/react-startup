// Exporta: async function askQueueless(prompt, history) -> string
// Tentativa: 1) fetch('/api/chat') 2) fallback local (KB + vetor TF + contexto)
const LOCAL_KB = [
  { id: 'intro', title: 'O que é a QueueLess', text: 'QueueLess mostra o movimento de estabelecimentos em tempo real para evitar filas. Você vê status (lotado/tranquilo), tempo médio e recebe alertas.' },
  { id: 'horarios', title: 'Horários', text: 'Horário comum: 09:00 às 18:00, seg-sex. Consulte ficha da loja para variações.' },
  { id: 'cadastro', title: 'Cadastro', text: 'Clique em Entrar > cadastrar-se. Informe nome, email e senha. Em erro, limpe cache ou contate suporte.' },
  { id: 'planos', title: 'Planos', text: 'Plano Grátis: visualização; Pro: notificações e histórico; Empresa: soluções maiores.' },
  { id: 'suporte', title: 'Suporte', text: 'Envie prints e passos para suporte@queueless.example.' },
  { id: 'estimativa', title: 'Estimativa', text: 'Estimativas baseadas em tráfego histórico; para melhor resultado diga a unidade.' },
];

// utilitários simples
function normalize(s=''){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim(); }
const SLANG = { vlw:'valeu', obg:'obrigado', vc:'voce', q:'que', pq:'porque', kkk:'rs', kk:'rs' };
function replaceSlang(s=''){ return s.split(' ').map(w => SLANG[w]||w).join(' '); }
function tokenize(s=''){ return replaceSlang(normalize(s)).split(' ').filter(Boolean); }

// build vocab + vectors once
function buildIndex(kb){
  const docs = kb.map(d => tokenize(d.title + ' ' + d.text));
  const vocab = [];
  docs.forEach(tokens => tokens.forEach(t => { if (!vocab.includes(t)) vocab.push(t); }));
  const vectors = docs.map(tokens => {
    const vec = new Float32Array(vocab.length);
    tokens.forEach(t => { const i = vocab.indexOf(t); if (i>=0) vec[i]++; });
    const n = Math.hypot(...vec);
    if (n>0) for(let i=0;i<vec.length;i++) vec[i] /= n;
    return vec;
  });
  return { vocab, vectors };
}
const INDEX = buildIndex(LOCAL_KB);

function embed(q, vocab){
  const vec = new Float32Array(vocab.length);
  tokenize(q).forEach(t => { const i = vocab.indexOf(t); if (i>=0) vec[i]++; });
  const n = Math.hypot(...vec);
  if (n>0) for(let i=0;i<vec.length;i++) vec[i]/=n;
  return vec;
}
function cosine(a,b){ let s=0; if(a.length!==b.length) return 0; for(let i=0;i<a.length;i++) s+=a[i]*b[i]; return s; }

function retrieve(query, topK=3){
  const qv = embed(query, INDEX.vocab);
  const scores = INDEX.vectors.map((v,i)=>({i,score:cosine(v,qv)})).sort((a,b)=>b.score-a.score).slice(0,topK);
  return scores.map(s=>({ score: s.score, doc: LOCAL_KB[s.i] }));
}

function synthesize(query, matches, history){
  if(!matches || matches.length===0) return null;
  const best = matches[0];
  if(best.score > 0.35) return best.doc.text;
  const good = matches.filter(m=>m.score>0.12);
  if(good.length>=2) return good.map(g=>`${g.doc.title}: ${g.doc.text}`).slice(0,3).join('\n\n');
  const hint = best.doc ? `${best.doc.title}: ${best.doc.text}` : '';
  const last = Array.isArray(history) && history.length ? history[history.length-1]?.texto || '' : '';
  const follow = last && normalize(query).length<20 ? ` (considerando: "${last}")` : '';
  return `Desculpa, não entendi exatamente${follow}. Talvez isso ajude:\n\n${hint}\n\nSe preferir, pergunte direto: "horário", "cadastro", "preço" ou informe a unidade.`;
}

// primary exported function
export default async function askQueueless(prompt, history){
  // 1) try backend proxy if available
  try {
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(), 9000);
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ prompt, history }),
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (resp.ok){
      const json = await resp.json().catch(()=>null);
      if(json && (json.reply || json.resposta)) return json.reply || json.resposta;
      const txt = await resp.text().catch(()=>'');
      if(txt) return txt;
    } else {
      console.warn('queue-less: backend returned', resp.status);
    }
  } catch(e){
    console.warn('queue-less: backend unavailable, using local fallback.', e && e.name);
  }

  // 2) local fallback (sem backend)
  try {
    const query = (normalize(prompt).length < 40 && Array.isArray(history) && history.length)
      ? `${history.slice(-2).map(h=>h.texto||h).join(' ')} ${prompt}`.trim()
      : prompt;
    const matches = retrieve(query, 3);
    const answer = synthesize(query, matches, history);
    return (answer || 'Poxa, não achei isso aqui. Se for sobre conta, planos ou horários, pergunta direto.');
  } catch(err){
    console.error('queue-less local fallback error', err);
    return 'Erro interno no módulo de IA.';
  }
}