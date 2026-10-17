const API = "https://dummyjson.com/"

// estados globales
let usuarioActual = null;
let arregloTareas = [];
let filtroSeleccionado = "todas";
let textoBuscado = "";

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

// variables Tareas y Metricas
const metricaTotal = document.querySelector("#metrica_total");
const metricaCompletadas = document.querySelector("#metrica_completadas");
const metricaPendientes = document.querySelector("#metrica_pendientes");
const metricaAvance = document.querySelector("#metrica_avance");
const buscadorTarea = document.querySelector("#buscador_tarea");
const filtrosContenedor = document.querySelector("#filtros_contenedor");
const listaTareas = document.querySelector("#lista_tareas");

// variables para agregar tareas
const formAgregarTarea = document.querySelector("#form_agregar_tarea");
const campoNuevaTarea = document.querySelector("#campo_nueva_tarea");
const botonAgregarTarea = document.querySelector("#boton_agregar_tarea");

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

    usuarioActual = datosUsuario;
    await obtenerTareas(usuarioActual.id);
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

  console.log("Datos de usuario recibidos:", usuario);
  console.log("ID del usuario:", usuario?.id);


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

// Tareas, metricas y filtros
async function obtenerTareas(idUsuario) {
  const claveStorage = `tareas_usuario_${idUsuario}`;
  const tareasGuardadas = localStorage.getItem(claveStorage);

  // si ya existen tareas en localStorage
  if (tareasGuardadas) {
    const tareasParseadas = JSON.parse(tareasGuardadas);

    if (Array.isArray(tareasParseadas) && tareasParseadas.length > 0) {
      arregloTareas = JSON.parse(tareasGuardadas);
      renderizarTareas();
      return;
    }
  }

  // si no hay nada guardado, se le pide a la API
  try {
    const res = await fetch(`${API}todos/user/${idUsuario}`);
    if (!res.ok) {
      throw new Error("Error al obtener las tareas");
    }

    const data = await res.json();
    arregloTareas = data.todos || [];
    guardarTareasAlmacenamiento();
    renderizarTareas();
  } catch (err) {
    console.error(err);
  }
}

function calcularMetricas() {
  const total = arregloTareas.length;

  const completadas = arregloTareas.reduce((acumulado, tarea) => {
    return tarea.completed ? acumulado + 1 : acumulado;
  }, 0);

  const pendientes = total - completadas;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  metricaTotal.textContent = total;
  metricaCompletadas.textContent = completadas;
  metricaPendientes.textContent = pendientes;
  metricaAvance.textContent = `${porcentaje}%`;
}

function renderizarTareas() {
  calcularMetricas();

  // Filtrar por categoría y texto ingresado
  const tareasFiltradas = arregloTareas.filter((tarea) => {
    const coincideEstado =
      filtroSeleccionado === "todas" ? true :
      filtroSeleccionado === "completadas" ? tarea.completed :
      !tarea.completed;

    const coincideTexto = tarea.todo.toLowerCase().includes(textoBuscado.toLowerCase());

    return coincideEstado && coincideTexto;
  });

  const tareasOrdenadas = [...tareasFiltradas].sort((a, b) => {
    return Number(a.completed) - Number(b.completed);
  });

  const htmlTareas = tareasOrdenadas.map((tarea) => {
    return `
      <li data-id="${tarea.id}">
        <label>
          <input type="checkbox" class="casilla_completar" ${tarea.completed ? "checked" : ""}>
          <span class="${tarea.completed ? 'completada' : ''}">
            ${tarea.todo}
          </span>
        </label>
        <button type="button" class="boton_eliminar"">X</button>
      </li>
    `;
  }).join("");

  listaTareas.innerHTML = htmlTareas;
}

// busqueda por texto
buscadorTarea.addEventListener("input", (e) => {
  textoBuscado = e.target.value;
  renderizarTareas();
});

// botones de filtro Todas / Pendientes / Completadas
filtrosContenedor.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const botones = filtrosContenedor.querySelectorAll(".boton_filtro");
  botones.forEach((btn) => btn.classList.remove("activo"));
  e.target.classList.add("activo");

  filtroSeleccionado = e.target.dataset.filtro;
  renderizarTareas();
});

// agregar tarea
formAgregarTarea.addEventListener("submit", async (e) => {
  e.preventDefault();

  const texto = campoNuevaTarea.value.trim();
  if (!texto) return;

  botonAgregarTarea.disabled = true;

  try {
    const res = await fetch(`${API}todos/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: texto,
        completed: false,
        userId: usuarioActual.id,
      }),
    });

    if (!res.ok) {
      throw new Error("No se pudo agregar la tarea");
    }

    const nuevaTarea = await res.json();

    const maxId = arregloTareas.length > 0
      ? Math.max(...arregloTareas.map((t) => Number(t.id)))
      : 0;
    nuevaTarea.id = maxId + 1;
    nuevaTarea.esLocal = true;

    arregloTareas.unshift(nuevaTarea);
    guardarTareasAlmacenamiento();
    campoNuevaTarea.value = "";
    renderizarTareas(); 
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    botonAgregarTarea.disabled = false;
  }
});

function guardarTareasAlmacenamiento(){
  if(usuarioActual){
    localStorage.setItem(`tareas_usuario_${usuarioActual.id}`, JSON.stringify(arregloTareas));
  }
}

listaTareas.addEventListener("click", async (e) => {
  const elementoLi = e.target.closest("li");
  if (!elementoLi) return;

  const idTarea = Number(elementoLi.dataset.id);

  // ubica tarea en memoria
  const tareaSeleccionada = arregloTareas.find((t) => t.id === idTarea);
  if (!tareaSeleccionada) return;

  // marcar como completado o pendiente
  if (e.target.classList.contains("casilla_completar")) {
    const nuevoEstado = e.target.checked;

    try {
      if (!tareaSeleccionada.esLocal) {
        const res = await fetch(`${API}todos/${idTarea}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: nuevoEstado }),
        });

        if (!res.ok) {
          throw new Error("Error al actualizar la tarea en el servidor");
        }
      }

      tareaSeleccionada.completed = nuevoEstado;
      guardarTareasAlmacenamiento();
      renderizarTareas(); 
    } catch (err) {
      console.error(err);
      e.target.checked = !nuevoEstado;
    }
  }

  // eliminar tarea
  if (e.target.classList.contains("boton_eliminar")) {
    try {
      if (!tareaSeleccionada.esLocal) {
        const res = await fetch(`${API}todos/${idTarea}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Error al eliminar la tarea en el servidor");
        }
      }

      // sacar tarea del arreglo
      arregloTareas = arregloTareas.filter((t) => t.id !== idTarea);
      guardarTareasAlmacenamiento();
      renderizarTareas();
    } catch (err) {
      console.error(err);
    }
  }
});

// evento cargar pagina

window.addEventListener("DOMContentLoaded", () => {
  const tokenGuardado = localStorage.getItem("accessToken");
  if (tokenGuardado) {
    obtenerPerfil(tokenGuardado);
  }
});

// usar id diferente a date now para nuevas tareas
// guardar en almacenamiento local el arreglo
