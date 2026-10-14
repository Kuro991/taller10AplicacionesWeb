# Panel con DummyJSON — Taller Semana 10

Pagina web desarrollada con js, HTML5 y css usando la API [DummyJSON](https://dummyjson.com/docs).

---

## 1. Donde y como se uso cada metodo de arreglo

Segun las especificaciones del taller, no se deben utilizar bucles for tradicionales para recorrer arreglos. En vez de esto se deben implementar los diferentes metodos vistos en clase.

### • `reduce`
* **Ubicacion:** Dentro de la funcion `calcularMetricas()`.
* **Para que se uso:** Recorre el arreglo `arregloTareas` e incrementa un acumulador en `1` unicamente cuando `tarea.completed` es verdadero (`true`), calculando asi el total de tareas completadas.

### • `filter`
* **Ubicacion:** 
  1. En la funcion `renderizarTareas()`.
  2. En el evento `click` sobre `lista_tareas` al eliminar tareas.
* **Para que se uso:** 
  1. Para filtrar las tareas según la pestaña activa (Todas, Pendientes o Completadas) y verificar si el texto coincide con lo escrito en el buscador `buscador_tarea`.
  2. Al eliminar una tarea, crea un nuevo arreglo sin incluir el elemento con `id` que coincida con el que el usuario decidió borrar (`arregloTareas.filter((t) => t.id !== idTarea)`).

### • `sort`
* **Ubicacion:** En la funcion `renderizarTareas()`.
* **Para que se uso:** Ordena una copia del arreglo filtrado antes de mostrarlo en pantalla (`[...tareasFiltradas].sort(...)`), colocando las tareas pendientes primero y las tareas completadas al final segun su estado (`Number(a.completed) - Number(b.completed)`).

### • `map`
* **Ubicacion:** En la funcion `renderizarTareas()`.
* **Para que se uso:** Transforma cada objeto del arreglo de tareas ordenadas en una plantilla de texto HTML (`<li data-id="...">...</li>`) que incluye el checkbox de completado, el texto descriptivo y el boton para eliminar. El arreglo resultante de cadenas se une con `.join("")`.

### • `find`
* **Ubicacion:** En el evento `click` sobre `lista_tareas` (delegacion de eventos).
* **Para que se uso:** Localiza la referencia del objeto exacto de la tarea dentro de `arregloTareas` comparando su identificador (`idTarea`) con la propiedad `t.id`, permitiendo saber si la tarea es de origen local o si debe alternar su propiedad booleana `completed`.
