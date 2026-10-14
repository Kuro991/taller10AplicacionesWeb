const API = "https://dummyjson.com/"

// variables login
const seccionLogin = document.querySelector("#seccion_login");
const user = document.querySelector("#texto_usuario");
const pass = document.querySelector("#texto_contrasena");
const boton = document.querySelector("#boton_login");
const error = document.querySelector("#error");
const form = document.querySelector("#form");

// variables perfil
const seccionPerfil = document.querySelector("#seccion_perfil");
const botonLogout = document.querySelector("#boton_logout")
const perfilFoto = document.querySelector("#perfil_foto")
const perfilNombre = document.querySelector("#perfil_nombre")
const perfilCorreo = document.querySelector("#perfil_correo")
const perfilTelefono = document.querySelector("#perfil_telefono")
const perfilUniversidad = document.querySelector("#perfil_universidad")

// login
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

// perfil

async function obtenerPerfil(token) {
  try {
    const res = await fetch(`${API}auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (res.status === 401) {
      cerrarSesion();
      return;
    }

    if (!res.ok) {
      throw new Error("No se pudo obtener el perfil");
    }

    const datosUsuario = await res.json();
    mostrarPerfilEnPantalla(datosUsuario);

  } catch (error) {
    console.error(error);
    cerrarSesion();
  }

  
}

function mostrarPerfilEnPantalla(usuario) {
  perfilFoto.src = usuario.image;
  perfilNombre.textContent = `${usuario.firstName} ${usuario.lastName}`;
  perfilCorreo.textContent = usuario.email;
  perfilTelefono.textContent = usuario.phone || "No registrado";
  perfilUniversidad.textContent = usuario.university || "No registrada";

  seccionLogin.classList.add("oculto");
  seccionPerfil.classList.remove("oculto");
}

function cerrarSesion() {
  localStorage.removeItem("accessToken");
  seccionPerfil.classList.add("oculto");
  seccionLogin.classList.remove("oculto");
  form.reset();
}

botonLogout.addEventListener("click", cerrarSesion);

window.addEventListener("DOMContentLoaded", () => {
  const tokenGuardado = localStorage.getItem("accessToken");
  if (tokenGuardado) {
    obtenerPerfil(tokenGuardado);
  }
});

