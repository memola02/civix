const STORAGE_KEY = "civixIncidencias";

async function obtenerIncidencias() {
  const datosGuardados = localStorage.getItem(STORAGE_KEY);

  if (datosGuardados) {
    return JSON.parse(datosGuardados);
  }

  const respuesta = await fetch("../data/incidencias.json");
  const incidencias = await respuesta.json();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidencias));

  return incidencias;
}

function guardarIncidencias(incidencias) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidencias));
}