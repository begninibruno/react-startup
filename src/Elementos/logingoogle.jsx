 import React from "react";
 import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
 //import jwt_decode from "jwt-decode"; // para decodificar os dados do usuário
//import styles from '../Elementos/styles.modules.css';

 function LoginGoogle() {
   const handleSuccess = (credentialResponse) => {
     // O token JWT vem aqui
     const token = credentialResponse.credential;
     const user = jwt_decode(token); // decodifica os dados do Google
     console.log("Usuário Google:", user);
     // Aqui você pode salvar no backend:
      axios.post("http://localhost:3000/usuarios", {
        name: user.name,
        email: user.email,
        key: user.sub // ou algum identificador seguro
      })
   };

   const handleError = () => {
     console.log("Login falhou ❌");
   };

   return (
     <GoogleOAuthProvider clientId="531859380684-ids8dlaqf1gvmu1ae1glek55uicjjhp0.apps.googleusercontent.com">
       <div className="container">
         <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
       </div>
     </GoogleOAuthProvider>
   );
 }
 
 export default LoginGoogle;