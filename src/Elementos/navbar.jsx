import {
  Disclosure,
  DisclosureButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useUser } from "./Contexts/Context.jsx"; // ✅ Import do contexto de usuário

const navigation = [
  { name: "Filas", href: "#", current: true },
  
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useUser(); // ✅ Usando o context

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
    <Disclosure as="nav" className="bg-blue-900 shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* menu mobile */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="p-2 text-blue-200 hover:bg-blue-800/50">
              <Bars3Icon aria-hidden="true" className="block h-6 w-6" />
              <XMarkIcon aria-hidden="true" className="hidden h-6 w-6" />
            </DisclosureButton>
          </div>

          {/* logo + navegação */}
          <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
            <div className="flex items-center h-16 shrink-0">
              <img
                alt="Logo"
                src="logooficial10.png"
                className="w-16 h-16 object-contain"
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
                        ? "bg-blue-800 text-white"
                        : "text-blue-100 hover:bg-blue-800 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
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
                <MenuButton className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white font-bold">
                  {getInitials(user.name)}
                </MenuButton>

                {/* Dropdown do usuário */}
                <MenuItems className="absolute right-0 mt-2 w-32 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "w-full px-3 py-2 text-left text-sm text-gray-700"
                        )}
                      >
                        Sair
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="ml-4 px-4 py-2 rounded-md bg-blue-700 text-white hover:bg-blue-600 transition"
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
  