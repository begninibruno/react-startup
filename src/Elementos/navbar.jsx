import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Filas', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null) // começa null

  // Função para pegar iniciais
  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Função para buscar dados do usuário da API
  async function fetchUser() {
    try {
      const res = await fetch("/api/user") // substitua pelo seu endpoint real
      const data = await res.json()
      setUser(data)
    } catch (err) {
      console.error("Erro ao buscar usuário:", err)
    }
  }

  // useEffect para buscar usuário inicialmente e escutar mudanças de login
  useEffect(() => {
    fetchUser()

    // Exemplo: caso você use localStorage para login
    const handleStorage = (event) => {
      if (event.key === "userData") {
        const newUser = event.newValue ? JSON.parse(event.newValue) : null
        setUser(newUser)
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Logout → limpa usuário e redireciona
  function handleLogout() {
    setUser(null)
    navigate("/")
  }

  return (
    <Disclosure as="nav" className="relative bg-blue-900/95 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10 shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Botão menu mobile */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-blue-200 hover:bg-blue-800/50 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-blue-400">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Abrir menu principal</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          {/* Logo + links */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                alt="Logo"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=white"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-800/60 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors'
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Dropdown do usuário */}
          <div className="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400">
                {user ? (
                  <span>{getInitials(user.name)}</span>
                ) : (
                  <UserIcon className="h-6 w-6 text-gray-300" />
                )}
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-blue-800 py-1 outline -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in shadow-lg"
              >
                {user ? (
                  <>
                    <MenuItem>
                      <span className="block px-4 py-2 text-sm text-blue-100">
                        Logado como <strong>{user.name}</strong>
                      </span>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-blue-700/70"
                      >
                        Sair
                      </button>
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem>
                    <a
                      href="/login"
                      className="block px-4 py-2 text-sm text-blue-100 data-focus:bg-blue-700/70 data-focus:outline-hidden"
                    >
                      Entrar
                    </a>
                  </MenuItem>
                )}
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium transition-colors'
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>  
    </Disclosure>
  )
}

export default Navbar
