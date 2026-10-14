const API = "https://dummyjson.com/"

// variables login
const user = document.querySelector("#texto_usuario")
const pass = document.querySelector("#texto_contrasena")
const boton = document.querySelector("#boton_login")
const error = document.querySelector("#error")
const form = document.querySelector("#form")
let token

// variables perfil



form.addEventListener("submit", (e) =>{
  e.preventDefault();
  login(user.value.trim(), pass.value.trim());

})

async function login(username, password){
  error.textContent = "";
  boton.disabled = true;
  boton.textContent = "Entrando...";

  try {
    const res = await fetch(`${API}auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({  
    username: username,
    password: password,
    expiresInMins: 60, // optional, defaults to 60
  }),
  })

  if (!res.ok) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);

  await obtenerPerfil(data.accessToken);

} catch (err) {
    error.textContent= "Error de credenciales";
  } finally{
    boton.disabled = false;
    boton.textContent = "Iniciar sesion";
  }  
}

form_datos.addEventListener("", (e) => {
  e.preventDefault();
  datos();

})

