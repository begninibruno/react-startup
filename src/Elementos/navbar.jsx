import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./Contexts/Context.jsx";

const navigation = [
  { name: "Filas", href: "#", current: true },
  {
    name: '"A vida é curta demais para ser perdida em filas de restaurantes" - KiwiLess',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  function handleLogout() {
    setUser(null);
    navigate("/");
  }

  return (
    <Disclosure as="nav" className=" bg-[#6DA671] shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">

          {/* logo + navegação */}
          <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
            <div className="flex items-center h-16 shrink-0">
              <img
                alt="Logo"
                src="kiwilesslogo.png"
                className="w-40 h-30 object-contain"
              />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? " bg-[#9e771b] text-white"
                        : "text-yellow-950",
                      "rounded-md px-4 py-2 text-sm font-semibold justify-evenly"
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Usuário logado ou botão entrar */}
          {user ? (
            <div className="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <Menu as="div" className="relative ml-3">
                <MenuButton className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9e771b] text-white font-bold hover:bg-[#b48f3b] transition">
                  {getInitials(user.name)}
                </MenuButton>

                {/* Dropdown do usuário */}
                <MenuItems className="absolute right-0 mt-2 w-36 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-zinc-500 ring-opacity-5 focus:outline-none">
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={classNames(
                          active ? "bg-[#f3f3f3]" : "",
                          "w-full px-4 py-2 text-left text-sm text-gray-700 hover:text-red-600 rounded-md"
                        )}
                      >
                        🚪 Sair
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="ml-4 px-4 py-2 rounded-md bg-amber-950 text-white hover:bg-blue-600 transition"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </Disclosure>
  );
}

export default Navbar;
