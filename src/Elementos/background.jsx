import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogPanel, Transition } from '@headlessui/react'
import { useState, useRef, useEffect } from 'react'

/**
 * ChatBot bem mais "inteligente" (sem libs externas)
 * - Normaliza texto (remove acentos, pontuação, stopwords simples)
 * - Similaridade por sobreposição de tokens + bônus por frases-chave
 * - Intenções (intents) com memória de contexto para follow-ups
 * - Entidades simples (detecção do nome da loja na pergunta)
 * - Sugestões (quick replies), comandos (/limpar, /exportar)
 * - Ações úteis: rolar para seção, abrir login
 * - Respostas ricas e amigáveis em PT-BR
 */

// ----------------- Utilidades de NLP simplificado -----------------
const STOPWORDS = new Set([
  'a', 'o', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'em', 'no', 'na', 'nos', 'nas',
  'para', 'pra', 'por', 'com', 'sem', 'se', 'que', 'qual', 'quais', 'sobre', 'ao', 'aos', 'à', 'às', 'é', 'tem', 'daqui', 'ali', 'aqui',
])

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/https?:\/\/\S+/g, '') // remove urls
    .replace(/[^a-z0-9çãõáéíóúâêôüñ\s]/gi, ' ') // remove pontuação
    .replace(/\s+/g, ' ') // colapsa espaços
    .trim()
}

function tokenize(str) {
  const norm = normalize(str)
  const tokens = norm.split(' ').filter(t => t && !STOPWORDS.has(t))
  return tokens
}

function jaccardSimilarity(aTokens, bTokens) {
  const a = new Set(aTokens)
  const b = new Set(bTokens)
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

// Scoring com bônus por frases-chave
function scoreUserToEntry(userText, entry) {
  const userTokens = tokenize(userText)
  const entryTokens = entry._cachedTokens || (entry._cachedTokens = tokenize(entry.q.join(' ')))
  let score = jaccardSimilarity(userTokens, entryTokens)
  // bônus por matches de regex/frases-chave
  for (const rx of entry.rx || []) {
    if (rx.test(userText)) score += 0.2
  }
  // limitar score
  return Math.min(score, 1)
}

// ----------------- Base de conhecimento (KB) -----------------
// Cada item tem: id, intent, q (sinônimos/perguntas), rx (regex extras), answer (string | (ctx) => string)
const KB = [
  {
    id: 'about',
    intent: 'sobre',
    q: ['o que e a queueless', 'sobre a plataforma', 'o que faz a queueless', 'missao', 'para que serve'],
    rx: [/o que e (a )?queueless/i, /sobre a queueless/i],
    answer: () => (
      'A QueueLess mostra em tempo real o movimento e o tempo de espera de estabelecimentos parceiros, ' +
      'assim você decide a melhor hora de ir. Nosso foco é reduzir filas, evitar lotação e melhorar sua experiência.'
    ),
  },
  {
    id: 'how',
    intent: 'como_funciona',
    q: ['como funciona', 'como usar', 'funcionamento', 'como ver a fila', 'em tempo real'],
    rx: [/como funciona/i, /funcionamento/i],
    answer: () => (
      'Funciona assim: os estabelecimentos enviam dados (check-ins, capacidade, fluxo) e/ou usam sensores; ' +
      'nós processamos e exibimos: “lotado”, “movimento moderado” ou “tranquilo”, com estimativa de fila. ' +
      'No app/web, procure o local, veja o status e receba alertas do melhor horário.'
    ),
  },
  {
    id: 'price',
    intent: 'preco',
    q: ['e gratis', 'tem custo', 'preco', 'valor', 'planos'],
    rx: [/gratis|custa|preco|valor|planos/i],
    answer: () => (
      'Para usuários, é gratuito. Estabelecimentos têm planos com recursos como prioridade no mapa, ' +
      'insights de demanda e integrações. Se você é gestor, fale “planos para estabelecimentos”.'
    ),
  },
  {
    id: 'places',
    intent: 'onde_usar',
    q: ['onde posso usar', 'quais lojas', 'parceiros', 'cidades disponiveis'],
    rx: [/quais lojas|onde posso usar|parceir/i],
    answer: () => (
      'Você encontra a lista de parceiros dentro do app. Abra o mapa, permita a localização e veja os locais próximos. ' +
      'Estamos ampliando a cobertura continuamente.'
    ),
  },
  {
    id: 'support',
    intent: 'suporte',
    q: ['suporte', 'ajuda', 'contato', 'humano', 'atendente'],
    rx: [/suporte|ajuda|contato|humano|atendente/i],
    answer: () => (
      'Posso ajudar por aqui. Se preferir atendimento humano, toque em “Falar com humano” ou use as redes na seção Suporte. '
    ),
  },
  {
    id: 'creator',
    intent: 'quem_criou',
    q: ['quem criou', 'quem desenvolveu', 'time', 'equipe'],
    rx: [/quem criou|quem desenvolveu|time|equipe/i],
    answer: () => (
      'A QueueLess é desenvolvida por um time focado em tecnologia e experiência do usuário, com o objetivo de acabar com o estresse das filas.'
    ),
  },
  {
    id: 'privacy',
    intent: 'privacidade',
    q: ['privacidade', 'dados', 'lgpd', 'seguranca', 'coleta de dados'],
    rx: [/privacidade|lgpd|dados|seguranc/i],
    answer: () => (
      'Levamos privacidade a sério: coletamos apenas o necessário para funcionamento (ex.: localização aproximada ao usar o mapa). ' +
      'Você pode revogar permissões a qualquer momento nas configurações do dispositivo.'
    ),
  },
  {
    id: 'merchant',
    intent: 'estabelecimento',
    q: ['cadastrar estabelecimento', 'sou gestor', 'sou dono de loja', 'quero integrar'],
    rx: [/cadastrar (meu )?estabelecimento|sou gestor|sou dono|integrar/i],
    answer: () => (
      'Para cadastrar seu estabelecimento e enviar dados em tempo real, fale “quero integrar como lojista”. ' +
      'Oferecemos API e painel com métricas de fluxo.'
    ),
  },
]

// Intenções auxiliares (navegação e ações)
const ACTIONS = [
  {
    id: 'go_login',
    intent: 'abrir_login',
    q: ['entrar', 'login', 'fazer login', 'acessar minha conta'],
    rx: [/\bentrar\b|login|acessar minha conta/i],
    run: ({ navigateLogin }) => {
      navigateLogin()
      return 'Abrindo a tela de login pra você…'
    },
  },
  {
    id: 'go_section_about',
    intent: 'ir_sobre',
    q: ['a queueless', 'sobre a queueless', 'secao sobre'],
    rx: [/a queueless|sobre a queueless|secao sobre/i],
    run: ({ scrollTo }) => {
      scrollTo('#a-queueless')
      return 'Levei você até a seção “A QueueLess”.'
    },
  },
  {
    id: 'go_section_how',
    intent: 'ir_como_funciona',
    q: ['como funciona', 'secao como funciona'],
    rx: [/secao como funciona|como funciona(\?)?$/i],
    run: ({ scrollTo }) => {
      scrollTo('#como-funciona')
      return 'Rolando até “Como Funciona?”.'
    },
  },
  {
    id: 'go_section_support',
    intent: 'ir_suporte',
    q: ['suporte', 'contato', 'ajuda'],
    rx: [/secao suporte|ir para suporte|contato/i],
    run: ({ scrollTo }) => {
      scrollTo('#suporte')
      return 'Abri a seção de Suporte pra você.'
    },
  },
]

// Detecção simples de entidade "loja" (para perguntas do tipo: "como esta a fila da X?")
function extractStoreName(text) {
  const m = text.match(/fila (da|do|no|na)\s+([a-z0-9çãõáéíóúâêôüñ\s]{2,})\??$/i)
  if (m && m[2]) return m[2].trim()
  return null
}

// ----------------- Componente ChatBot -----------------
function ChatBot() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: saudacaoPorHorario() + ' Eu sou o assistente da QueueLess. Em que posso ajudar?' },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [lastIntent, setLastIntent] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const tools = {
    navigateLogin: () => (window.location.href = '/login'),
    scrollTo: (sel) => {
      const el = document.querySelector(sel)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
  }

  const quickReplies = [
    'O que é a QueueLess?',
    'Como funciona?',
    'É grátis?',
    'Quais lojas atendem?',
    'Falar com humano',
  ]

  function pushUserAndBot(userText, botText) {
    setMessages((msgs) => [...msgs, { from: 'user', text: userText }])
    setInput('')
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { from: 'bot', text: botText }])
      setSending(false)
    }, 500 + Math.random() * 400)
  }

  function handleCommand(cmd) {
    if (cmd === '/limpar') {
      setMessages([{ from: 'bot', text: 'Histórico limpo. Como posso ajudar?' }])
      return true
    }
    if (cmd === '/exportar') {
      const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'chat-queueless.json'
      a.click()
      URL.revokeObjectURL(url)
      setMessages((msgs) => [...msgs, { from: 'bot', text: 'Exportei a conversa como JSON.' }])
      return true
    }
    return false
  }

  // Núcleo de resposta "inteligente"
  function responder(userTextRaw) {
    const userText = userTextRaw.trim()
    if (!userText) return

    // comandos
    if (userText.startsWith('/')) {
      if (handleCommand(userText)) return
    }

    setSending(true)

    // 1) Ações diretas (navegação/login)
    for (const action of ACTIONS) {
      if (action.rx.some((r) => r.test(userText))) {
        const out = action.run(tools)
        setLastIntent(action.intent)
        return pushUserAndBot(userText, out)
      }
    }

    // 2) Detecção de entidade (loja)
    const store = extractStoreName(userText)
    if (store) {
      setLastIntent('fila_loja')
      return pushUserAndBot(
        userText,
        `Ainda não posso medir a fila de "${store}" diretamente pelo chat. ` +
          'Abra o app, pesquise a loja no mapa e veja o status em tempo real. '
      )
    }

    // 3) Similaridade com KB
    const scored = KB.map((entry) => ({ entry, score: scoreUserToEntry(userText, entry) }))
      .sort((a, b) => b.score - a.score)

    const TOP = scored[0]
    const CONF = TOP?.score ?? 0

    if (TOP && CONF >= 0.28) {
      const txt = typeof TOP.entry.answer === 'function' ? TOP.entry.answer({ lastIntent }) : TOP.entry.answer
      setLastIntent(TOP.entry.intent)
      return pushUserAndBot(userText, txt)
    }

    // 4) Follow-up/co-referência simples
    if (lastIntent) {
      const followupMap = {
        preco: 'Se você perguntou sobre valores: para usuários é gratuito; estabelecimentos têm planos com recursos extras.',
        como_funciona: 'Quer que eu te leve até a seção “Como Funciona?” da página?',
        suporte: 'Posso tentar resolver por aqui ou abrir a seção de Suporte pra falar com um humano.',
      }
      const txt = followupMap[lastIntent]
      if (txt) return pushUserAndBot(userText, txt)
    }

    // 5) Baixa confiança => pedir esclarecimento com sugestões contextuais
    const sugestoes = [
      'O que é a QueueLess?',
      'Como funciona?',
      'É grátis?',
      'Quero integrar como lojista',
      'Abrir login',
    ]

    pushUserAndBot(
      userText,
      'Não tenho certeza se entendi. Você pode reformular?\n\nExemplos: ' + sugestoes.join(' · ')
    )
  }

  const handleSend = () => {
    if (!input.trim()) return
    responder(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-indigo-500 to-indigo-700 hover:scale-105 transition-transform duration-200 text-white rounded-full shadow-2xl p-4 flex items-center gap-2 animate-bounce"
          style={{ boxShadow: '0 4px 24px rgba(104,117,245,0.3)' }}
          aria-label="Abrir chat de suporte"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="14" cy="14" r="12" />
            <path d="M10 18h8M11 11h.01M17 11h.01" />
          </svg>
          <span className="font-bold hidden sm:block">Suporte</span>
        </button>
      )}

      {/* Chat */}
      <Transition
        show={open && !minimized}
        enter="transition-all duration-300"
        enterFrom="opacity-0 translate-y-10 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-10 scale-95"
      >
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[95vw] bg-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-indigo-300/40">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="9" />
                <path d="M7 15h8M8 9h.01M14 9h.01" />
              </svg>
              Suporte QueueLess
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setMinimized(true)}
                className="text-white/80 hover:text-white transition"
                title="Minimizar"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="9" width="10" height="2" rx="1" />
                </svg>
              </button>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition" title="Fechar">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 px-4 py-3 overflow-y-auto bg-gray-900" style={{ maxHeight: '340px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} transition-all`}>
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[80%] break-words shadow ${
                    msg.from === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-indigo-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="mb-2 flex justify-start">
                <div className="px-3 py-2 rounded-lg text-sm bg-gray-800 text-indigo-100 max-w-[80%]">
                  <span className="inline-block animate-pulse">Digitando…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 pt-2 bg-gray-900 flex flex-wrap gap-2">
            {quickReplies.map((q, i) => (
              <button
                key={i}
                onClick={() => responder(q)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-indigo-100 rounded-full px-3 py-1 border border-white/10"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="px-4 py-3 bg-gray-800 flex gap-2 items-center border-t border-indigo-300/10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-lg border border-indigo-400/30 bg-gray-900 text-indigo-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-indigo-300"
              placeholder="Digite sua dúvida (ex.: Como funciona?)"
              aria-label="Digite sua dúvida"
              autoFocus
              style={{ transition: 'background 0.2s' }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className={`bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Enviar
            </button>
          </div>

          <div className="px-4 pb-3 bg-gray-800 text-[10px] text-indigo-200/70">
            Dicas: use /limpar · /exportar · “Abrir login” · “Levar para suporte”
          </div>
        </div>
      </Transition>

      {/* Botão para restaurar se minimizado */}
      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl p-3 flex items-center gap-2 transition-all"
          aria-label="Restaurar chat"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="9" />
            <path d="M7 15h8M8 9h.01M14 9h.01" />
          </svg>
        </button>
      )}
    </>
  )
}

function saudacaoPorHorario() {
  try {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia!'
    if (h < 18) return 'Boa tarde!'
    return 'Boa noite!'
  } catch {
    return 'Olá!'
  }
}

// ----------------- Página/Background (mantém seu layout) -----------------
const navigation = [
  { name: 'A QueueLess', href: '#a-queueless' },
  { name: 'Como Funciona', href: '#como-funciona' },
  { name: 'Suporte', href: '#suporte' },
]

function Background() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleEntrar = () => (window.location.href = '/login')

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* HEADER */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">QueueLess</span>
              <img alt="QueueLess" src="logooficial10.png" width={90} className="mx-auto h-20 w-auto" />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
            >
              <span className="sr-only">Abrir menu principal</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white hover:text-indigo-400">
                {item.name}
              </a>
            ))}
          </div>

          <button className="hidden lg:flex lg:flex-1 lg:justify-end" onClick={handleEntrar}>
            <span className="text-sm/6 font-semibold text-white">
              Entrar <span aria-hidden="true">&rarr;</span>
            </span>
          </button>
        </nav>

        {/* Mobile menu panel */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <img alt="QueueLess" src="logoteste2.png" className="h-10 w-auto" />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-200"
              >
                <span className="sr-only">Fechar menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <button
                    onClick={handleEntrar}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      {/* HERO */}
      <section className="relative isolate px-6 pt-32 lg:px-8 min-h-screen flex items-center justify-center text-center" id="home">
  <div className="mx-auto max-w-2xl">
    <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
      Cansado de perder tempo em filas?
    </h1>
    <p className="mt-8 text-lg font-medium text-gray-400 sm:text-xl">
      Com a <span className="text-[#6875F5] font-bold">QueueLess</span>, você acompanha em tempo real a fila da loja que deseja visitar — direto do seu celular.
    </p>
    <div className="mt-10 flex items-center justify-center">
      <button
        type="button"
        onClick={handleEntrar}
        className="rounded-md bg-indigo-500 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-indigo-400 transition"
      >
        Entrar
      </button>
    </div>
  </div>
</section>


      {/* SEÇÃO A QueueLess */}
      <section id="a-queueless" className="px-6 py-20 lg:px-8 border-t border-white/10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-semibold tracking-tight text-balance sm:text-1xl">A QueueLess</h2>
          <p className="mt-6 text-lg text-gray-300">
            A <span className="text-[#6875F5] font-bold text-xl">QueueLess</span> é uma aplicação que mostra em tempo real como está o movimento do estabelecimento que você deseja visitar.
            Você pode verificar se está lotado, se a fila está curta ou se é o momento ideal para ir.
          </p>
        </div>
      </section>

      {/* SEÇÃO Como Funciona */}
      <section id="como-funciona" className="px-6 py-20 lg:px-8 border-t border-white/10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-semibold tracking-tight text-balance sm:text-1xl">Como Funciona?</h2>
          <p className="mt-6 text-lg text-gray-300">
            O funcionamento é simples: o estabelecimento envia informações sobre o fluxo de clientes, e a <span className="text-[#6875F5] font-bold text-xl">QueueLess</span> organiza esses dados de forma visual, permitindo que você veja rapidamente se a fila está grande ou tranquila.
          </p>
        </div>
      </section>

      {/* SEÇÃO Suporte */}
      <section id="suporte" className="px-6 py-20 lg:px-8 border-t border-white/10 bg-gray-900 relative">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-[#6875F5]">Suporte</h2>
          <p className="mt-6 text-lg text-gray-300">
            Tem dúvidas ou precisa de ajuda? Nossa equipe de suporte está disponível para garantir que você aproveite ao máximo a experiência com a <span className="text-[#6875F5] font-bold">QueueLess</span>.  
            Entre em contato pelas nossas redes sociais abaixo.
          </p>

          {/* Redes Sociais */}
          <div className="mt-10 flex justify-center gap-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/facebook-white.svg" alt="Facebook" className="w-8 h-8" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/instagram-white.svg" alt="Instagram" className="w-8 h-8" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/twitter-white.svg" alt="Twitter" className="w-8 h-8" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/linkedin-white.svg" alt="LinkedIn" className="w-8 h-8" />
            </a>
          </div>
        </div>
      </section>
      
      <style>
  {`
    ::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #111827; /* fundo igual ao site */
}

::-webkit-scrollbar-thumb {
  background-color: rgba(104, 117, 245, 0.6);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(104, 117, 245, 0.85);
}

::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

::-webkit-scrollbar-button:start:decrement,
::-webkit-scrollbar-button:end:increment {
  display: none;
  height: 0;
  background: transparent;
}

::-webkit-scrollbar-button {
  -webkit-appearance: none !important;
  appearance: none !important;
  display: none !important;
}

::-webkit-scrollbar-thumb {
  min-height: 40px; /* define altura mínima */
  border: none;     /* remove qualquer borda */
  margin: 0;        /* evita espaço extra */
}

::-webkit-scrollbar-button {
  display: none !important;
  width: 0;
  height: 0;
}

::-webkit-scrollbar-corner {
  background: transparent !important;
}



/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(104,117,245,0.6) #111827;
}


  `}
</style>


      <ChatBot />
    </div>
  )
}

export default Background