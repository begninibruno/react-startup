// ./Contexts/Context.jsx 
/*
import { createContext, useContext, useState } from "react"

// 1️⃣ Criar o contexto
const UserContext = createContext()

// 2️⃣ Provider que vai envolver o app
export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

// 3️⃣ Hook customizado para usar o contexto
export function useUser() {
  return useContext(UserContext)
}
*/

import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

