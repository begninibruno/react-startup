import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogPanel, Transition } from '@headlessui/react'
import { useState, useRef, useEffect } from 'react'
import { motion } from "framer-motion";
import { Instagram, Facebook, Phone } from "lucide-react"
//import kiwiLogo from "./logokiwisozinho_1.png";
//import logoKiwiLess from 'src/Elementos/logoKiwiLess.png';

// utilidades de NLP simplificado 
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

// scoring com bônus por frases-chave
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

// base de conhecimento (KB)
// cada item tem: id, intent, q (sinônimos/perguntas), rx (regex extras), answer (string | (ctx) => string)
const KB = [
  {
    id: 'about',
    intent: 'sobre',
    q: ['o que e a KiwiLess', 'sobre a plataforma', 'o que faz a KiwiLess', 'missao', 'para que serve'],
    rx: [/o que e (a )?KiwiLess/i, /sobre a KiwiLess/i],
    answer: () => (
      'A KiwiLess mostra em tempo real o movimento e o tempo de espera de estabelecimentos parceiros, ' +
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
      'A KiwiLess é desenvolvida por um time focado em tecnologia e experiência do usuário, com o objetivo de acabar com o estresse das filas.'
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

// intenções auxiliares (navegação e ações)
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
    q: ['a KiwiLess', 'sobre a KiwiLess', 'secao sobre'],
    rx: [/a KiwiLess|sobre a KiwiLess|secao sobre/i],
    run: ({ scrollTo }) => {
      scrollTo('#a-KiwiLess')
      return 'Levei você até a seção “A KiwiLess”.'
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

// detecção simples de entidade "loja" (para perguntas do tipo: "como esta a fila da X?")
function extractStoreName(text) {
  const m = text.match(/fila (da|do|no|na)\s+([a-z0-9çãõáéíóúâêôüñ\s]{2,})\??$/i)
  if (m && m[2]) return m[2].trim()
  return null
}

// componente ChatBot
function ChatBot() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: saudacaoPorHorario() + ' Eu sou o assistente da KiwiLess. Em que posso ajudar?' },
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
    'O que é a KiwiLess?',
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
      a.download = 'chat-KiwiLess.json'
      a.click()
      URL.revokeObjectURL(url)
      setMessages((msgs) => [...msgs, { from: 'bot', text: 'Exportei a conversa como JSON.' }])
      return true
    }
    return false
  }

  // núcleo de resposta "inteligente"
  function responder(userTextRaw) {
    const userText = userTextRaw.trim()
    if (!userText) return

    // comandos
    if (userText.startsWith('/')) {
      if (handleCommand(userText)) return
    }

    // resposta especial para "esqueci a senha"
    if (/esqueci a senha/i.test(userText)) {
      setSending(true)
      return pushUserAndBot(userText, 'Ainda não posso ajudar com recuperação de senha. Mas em breve incrementaremos isso. ' )}

    setSending(true)

    // 1) ações diretas (navegação/login)
    for (const action of ACTIONS) {
      if (action.rx.some((r) => r.test(userText))) {
        const out = action.run(tools)
        setLastIntent(action.intent)
        return pushUserAndBot(userText, out)
      }
    }

    // 2) detecção de entidade (loja)
    const store = extractStoreName(userText)
    if (store) {
      setLastIntent('fila_loja')
      return pushUserAndBot(
        userText,
        `Ainda não posso medir a fila de "${store}" diretamente pelo chat. ` +
          'Abra o app, pesquise a loja no mapa e veja o status em tempo real. '
      )
    }

    // 3) similaridade com KB
    const scored = KB.map((entry) => ({ entry, score: scoreUserToEntry(userText, entry) }))
      .sort((a, b) => b.score - a.score)

    const TOP = scored[0]
    const CONF = TOP?.score ?? 0

    if (TOP && CONF >= 0.28) {
      const txt = typeof TOP.entry.answer === 'function' ? TOP.entry.answer({ lastIntent }) : TOP.entry.answer
      setLastIntent(TOP.entry.intent)
      return pushUserAndBot(userText, txt)
    }

    // 4) 4ollow-up/co-referência simples
    if (lastIntent) {
      const followupMap = {
        preco: 'Se você perguntou sobre valores: para usuários é gratuito; estabelecimentos têm planos com recursos extras.',
        como_funciona: 'Quer que eu te leve até a seção “Como Funciona?” da página?',
        suporte: 'Posso tentar resolver por aqui ou abrir a seção de Suporte pra falar com um humano.',
      }
      const txt = followupMap[lastIntent]
      if (txt) return pushUserAndBot(userText, txt)
    }

    // 5) baixa confiança => pedir esclarecimento com sugestões contextuais
    const sugestoes = [
      'O que é a KiwiLess?',
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
      {/* botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-[#A8E063] to-[#7ED957] hover:scale-105 transition-transform duration-200 text-[#9e771b] rounded-full shadow-2xl p-4 flex items-center gap-2 animate-bounce"
          style={{ boxShadow: '0 4px 24px rgba(104,117,245,0.3)' }}
          aria-label="Abrir chat de suporte"
        >
          <img
            src="logokiwisozinho_1.png"
            alt="Logo KiwiLess"
            width={32}
            height={32}
            style={{padding: 2, boxShadow: '0 2px 8px rgba(34,197,94,0.10)' }}
          />
          <span className="font-bold hidden sm:block text-"> Suporte</span>
        </button>
      )}

      {/* chat */}
      <Transition
        show={open && !minimized}
        enter="transition-all duration-300"
        enterFrom="opacity-0 translate-y-10 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-10 scale-95"
      >
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[95vw] bg-[#232D1B] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-[#A8E063]/40">
          <div className="bg-gradient-to-r from-[#A8E063] to-[#7ED957] text-[#9e771b] px-4 py-3 flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2">
              <img
            src="logokiwisozinho_1.png"
            alt="Logo KiwiLess"
            width={32}
            height={32}
            style={{padding: 2, boxShadow: '0 2px 8px rgba(34,197,94,0.10)' }}
          />
              Suporte KiwiLess
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

          <div className="flex-1 px-4 py-3 overflow-y-auto bg-[#E9F9E1]" style={{ maxHeight: '340px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} transition-all`}>
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[80%] break-words shadow ${
                    msg.from === 'user'
                      ? 'bg-[#A8E063] text-[#232D1B] rounded-br-none'
                      : 'bg-[#E9F9E1] text-[#232D1B] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="mb-2 flex justify-start">
                <div className="px-3 py-2 rounded-lg text-sm bg-[#E9F9E1] text-[#232D1B] max-w-[80%]">
                  <span className="inline-block animate-pulse">Digitando…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* quick replies */}
          <div className="px-3 pt-2 bg-[#E9F9E1] flex flex-wrap gap-2">
            {quickReplies.map((q, i) => (
              <button
                key={i}
                onClick={() => responder(q)}
                className="text-xs bg-[#A8E063] hover:bg-[#7ED957] text-[#232D1B] rounded-full px-3 py-1 border border-[#A8E063]/30"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="px-4 py-3 bg-[#E9F9E1] flex gap-2 items-center border-t border-[#A8E063]/10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-lg border border-[#A8E063]/30 bg-[#E9F9E1] text-[#232D1B] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8E063] placeholder:text-[#7ED957]"
              placeholder="Digite sua dúvida (ex.: Como funciona?)"
              aria-label="Digite sua dúvida"
              autoFocus
              style={{ transition: 'background 0.2s' }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className={`bg-[#A8E063] hover:bg-[#7ED957] text-[#232D1B] px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Enviar
            </button>
          </div>

          <div className="px-4 pb-3 bg-[#E9F9E1] text-[10px] text-[#7ED957]/70">
            Dicas: use /limpar · /exportar · “Abrir login” · “Levar para suporte”
          </div>
        </div>
      </Transition>

      {/* botão para restaurar se minimizado */}
      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed bottom-6 right-6 z-50 bg-[#A8E063] hover:bg-[#7ED957] text-[#232D1B] rounded-full shadow-2xl p-3 flex items-center gap-2 transition-all"
          aria-label="Restaurar chat"
        >
          <img
            src="logokiwisozinho_1.png"
            alt="Logo KiwiLess"
            width={32}
            height={32}
            style={{padding: 2, boxShadow: '0 2px 8px rgba(34,197,94,0.10)' }}
          />
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

// página/background (mantém seu layout) 
const navigation = [
  { name: 'A KiwiLess', href: '#a-KiwiLess' },
  { name: 'Como Funciona', href: '#como-funciona' },
  { name: 'Suporte', href: '#suporte' },
]

function Background() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleEntrar = () => (window.location.href = '/login')

  return (
    <div className="min-h-screen text-[#232D1B] bg-gradient-to-b from-[#E9F9E1] via-[#A8E063] to-[#A8E063]">
      {/* header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">KiwiLess</span>
              <img alt="KiwiLess" src="kiwilesslogo.png" width={90} className="mx-auto h-20 w-auto" />
            </a>
          </div>

          {/* mobile menu button */}
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

          {/* desktop menu */}
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm/6 font-semibold text-[#9e771b] hover:text-[#56AB2F] transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          <button
            onClick={handleEntrar}
            className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2
                       bg-[#A8E063] hover:bg-[#7ED957]
                       text-[#232D1B] font-semibold px-4 py-2 rounded-xl
                       shadow-md transition-all duration-200" 
          >
            Entrar
          </button> 
        </nav>

        {/* mobile menu panel */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#232D1B] p-6 sm:max-w-sm sm:ring-1 sm:ring-[#A8E063]/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <img alt="KiwiLess" src="logoteste2.png" className="h-10 w-auto" />
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
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[#A8E063] hover:text-[#56AB2F] transition-colors duration-200"
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

      {/* hero */}
<section className="relative isolate px-6 pt-20 lg:px-8 bg-gradient-to-b from-[#E9F9E1] to-[#A8E063]">
  <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56 text-center">
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-5xl font-extrabold tracking-tight text-[#232D1B] sm:text-7xl"
    >
      Cansado de perder tempo em <span className="text-[#9e771b]">filas?</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="mt-8 text-small leading-8 text-[#232D1B] max-w-3xl mx-auto"
    >
      Com a <span className="text-[#9e771b] font-bold">KiwiLess</span>, você acompanha em tempo real o movimento do restaurante que deseja visitar. 
      <p>Chega de esperar sem necessidade.</p>
    </motion.p>

    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.7 }}
      className="mt-10 flex items-center justify-center gap-6"
    >
      <a
        href="#como-funciona"
        className="rounded-xl bg-[#E9F9E1] px-6 py-3 text-base font-semibold text-[#232D1B] shadow-lg hover:bg-[#C7F2A4] transition"
      >
        Como Funciona
      </a>
      <a
        href="/registro"
        className="rounded-xl border border-[#E9F9E1] px-6 py-3 text-base font-semibold text-[#232D1B] hover:bg-[#E9F9E1]/30 transition"
      >
        Cadastrar-se
      </a>
    </motion.div>
  </div>
</section>

  {/* seção a kiwiLess */}
<section id="a-KiwiLess" className="px-6 py-24 lg:px-8 bg-[#A8E063]">
  <div className="mx-auto max-w-5xl text-center">
    <motion.h2
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-5xl font-extrabold text-[#232D1B] sm:text-6xl"
    >
      A <span className="text-[#9e771b]">KiwiLess</span>
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      viewport={{ once: true }}
      className="mt-8 text-lg leading-8 text-[#232D1B] max-w-3xl mx-auto"
    >
      A <span className="text-[#9e771b] font-bold">KiwiLess</span> mostra em tempo real como está o movimento do
      estabelecimento que você deseja visitar. Descubra se está lotado, se a fila está curta ou se é o momento ideal
      para ir. Evite filas desnecessárias e aproveite melhor seu tempo.
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      viewport={{ once: true }}
      className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="bg-[#E9F9E1]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[#E9F9E1]/30">
        <div className="text-4xl mb-4">📱</div>
        <h3 className="text-xl font-semibold text-[#232D1B]">Acesse por um dispositivo</h3>
        <p className="mt-2 text-[#232D1B] text-sm">
          Use o site para pesquisar estabelecimentos próximos e visualizar o status em tempo real.
        </p>
      </div>
      <div className="bg-[#E9F9E1]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[#E9F9E1]/30">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-xl font-semibold text-[#232D1B]">Receba alertas</h3>
        <p className="mt-2 text-[#232D1B] text-sm">
          Ative notificações para ser avisado quando o movimento estiver mais tranquilo no local que você deseja.
        </p>
      </div>
      <div className="bg-[#E9F9E1]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[#E9F9E1]/30">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-[#232D1B]">Dados confiáveis</h3>
        <p className="mt-2 text-[#232D1B] text-sm">
          As informações são atualizadas pelos próprios estabelecimentos e por sensores, garantindo precisão e agilidade.
        </p>
      </div>
    </motion.div>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      viewport={{ once: true }}
      className="mt-10 text-base text-[#232D1B] max-w-2xl mx-auto"
    >
      Com a <span className="text-[#9e771b] font-bold">KiwiLess</span>, você economiza tempo, evita aglomerações e tem mais controle sobre sua rotina. Nossa missão é transformar sua experiência em lojas, restaurantes e outros estabelecimentos, tornando seu dia a dia mais prático e inteligente.
    </motion.p>
  </div>
</section>

{/* seção como funciona */}
<section id="como-funciona" className="px-6 py-24 lg:px-8 bg-[#A8E063]">
  <div className="mx-auto max-w-6xl text-center">
    <motion.h2
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-5xl font-extrabold text-[#232D1B] sm:text-6xl"
    >
      Como Funciona?
    </motion.h2>
    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          title: 'Estabelecimento envia dados',
          desc: 'Fluxo de clientes, check-ins e sensores são atualizados em tempo real.',
          icon: '📡',
        },
        {
          title: 'Organização dos dados',
          desc: 'A KiwiLess processa tudo e mostra se está lotado, tranquilo ou em movimento.',
          icon: '📊',
        },
        {
          title: 'Você decide',
          desc: 'Com base nas informações, escolha o melhor horário para ir sem enfrentar filas.',
          icon: '✅',
        },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-[#E9F9E1]/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-[#E9F9E1]/30"
        >
          <div className="text-4xl mb-4">{item.icon}</div>
          <h3 className="text-xl font-semibold text-[#232D1B]">{item.title}</h3>
          <p className="mt-2 text-[#232D1B] text-sm">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>

{/* seção suporte */}
<section id="suporte" className="px-6 py-24 lg:px-8 bg-[#A8E063]">
  <div className="mx-auto max-w-5xl text-center">
    <motion.h2
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-5xl font-extrabold text-[#232D1B]"
    >
      Suporte
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      viewport={{ once: true }}
      className="mt-6 text-lg text-[#232D1B] max-w-3xl mx-auto"
    >
      Nossa equipe está disponível para garantir que você aproveite ao máximo a experiência com a{" "}
      <span className="text-[#9e771b] font-bold">KiwiLess</span>.
    </motion.p>
  </div>
  {/* redes sociais */}
<div className="mt-4 flex justify-center gap-6">
  <a
    href="https://instagram.com"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#232D1B] hover:text-[#E9F9E1] transition"
  >
    <Instagram className="w-6 h-6" />
  </a>
  <a
    href="https://facebook.com"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#232D1B] hover:text-[#E9F9E1] transition"
  >
    <Facebook className="w-6 h-6" />
  </a>
  <a
    href="https://wa.me/5500000000000"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#232D1B] hover:text-[#E9F9E1] transition"
  >
    <Phone className="w-6 h-6" />
  </a>
</div>
</section>

{/* footer */}
<footer className="bg-[#A8E063] px-6 text-center mt-6">
  <div className="mx-auto max-w-6xl">
    <p className="text-[#232D1B] text-sm py-4">
      © {new Date().getFullYear()}{" "}
      <span className="font-bold text-[#9e771b]">KiwiLess</span>.  
      Todos os direitos reservados.
    </p>
  </div>
</footer>
      <style>
    {`
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: #f3f4f6; /* fundo claro */
      }

      ::-webkit-scrollbar-thumb {
        background-color: #22c55e; /* verde KiwiLess */
        border-radius: 9999px;
        min-height: 40px;
        border: 2px solid #f3f4f6;
      }

      ::-webkit-scrollbar-thumb:hover {
        background-color: #16a34a; /* verde mais escuro ao hover */
      }

      ::-webkit-scrollbar-button,
      ::-webkit-scrollbar-button:start:decrement,
      ::-webkit-scrollbar-button:end:increment {
        display: none;
        width: 0;
        height: 0;
        background: transparent;
        -webkit-appearance: none !important;
        appearance: none !important;
      }

      ::-webkit-scrollbar-corner {
        background: transparent !important;
      }

      /* Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: #22c55e #f3f4f6;
      }
    `}
</style>
      <ChatBot />
    </div>
  )
}

export default Background