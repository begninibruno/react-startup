import react from 'react'
import { GoogleLogin } from 'react-google-login';

function Google(){
  const responseGoogle = (response) =>{
    console.log(response);
  
};

return(
    <div className='container'>
      <GoogleLogin
      clientId="531859380684-ids8dlaqf1gvmu1ae1glek55uicjjhp0.apps.googleusercontent.com"
      buttonText="Continuar com Google"
      onSucsess={responseGoogle}
      onSucsess={responseGoogle}
      />
    </div>

)

export default Google;