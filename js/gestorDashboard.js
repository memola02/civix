const managerTotalIncidents = document.getElementById("managerTotalIncidents");
const managerHighPriority = document.getElementById("managerHighPriority");
const managerResolutionRate = document.getElementById("managerResolutionRate");
const managerCriticalZones = document.getElementById("managerCriticalZones");

const managerMappedIncidents = document.getElementById("managerMappedIncidents");
const managerCategoryChart = document.getElementById("managerCategoryChart");
const managerAreaRanking = document.getElementById("managerAreaRanking");

const managerPending = document.getElementById("managerPending");
const managerProcessing = document.getElementById("managerProcessing");
const managerDerived = document.getElementById("managerDerived");
const managerResolved = document.getElementById("managerResolved");

async function cargarDashboardGestor() {
  const incidencias = await obtenerIncidencias();

  actualizarKpisGestor(incidencias);
  renderizarCategorias(incidencias);
  renderizarEstadosGestor(incidencias);
  renderizarAreasGestor(incidencias);
}

function actualizarKpisGestor(incidencias) {
  const total = incidencias.length;

  const altaPrioridad = incidencias.filter(
    (incidencia) => incidencia.prioridad === "Alta",
  ).length;

  const resueltas = incidencias.filter(
    (incidencia) => incidencia.estado === "Resuelto",
  ).length;

  const conCoordenadas = incidencias.filter((incidencia) => {
    return incidencia.coordenadas?.lat && incidencia.coordenadas?.lng;
  }).length;

  const ubicaciones = new Set(
    incidencias.map((incidencia) => incidencia.ubicacion),
  );

  const tasaResolucion =
    total === 0 ? 0 : Math.round((resueltas / total) * 100);

  managerTotalIncidents.textContent = total;
  managerHighPriority.textContent = altaPrioridad;
  managerResolutionRate.textContent = `${tasaResolucion}%`;
  managerCriticalZones.textContent = ubicaciones.size;
  managerMappedIncidents.textContent = conCoordenadas;
}

function renderizarCategorias(incidencias) {
  managerCategoryChart.innerHTML = "";

  const conteo = contarPorCampo(incidencias, "categoria");
  const categorias = ordenarConteo(conteo);
  const maximo = obtenerMaximo(categorias);

  if (categorias.length === 0) {
    managerCategoryChart.innerHTML = "<p>No hay categorías registradas.</p>";
    return;
  }

  categorias.forEach(([categoria, cantidad]) => {
    const porcentaje = Math.round((cantidad / maximo) * 100);

    const div = document.createElement("div");
    div.classList.add("chart-row");

    div.innerHTML = `
      <div class="chart-row-header">
        <strong>${categoria}</strong>
        <span>${cantidad} ${cantidad === 1 ? "reporte" : "reportes"}</span>
      </div>

      <div class="chart-track">
        <div class="chart-fill" style="width: ${porcentaje}%"></div>
      </div>
    `;

    managerCategoryChart.appendChild(div);
  });
}

function renderizarEstadosGestor(incidencias) {
  managerPending.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Pendiente",
  ).length;

  managerProcessing.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Procesando",
  ).length;

  managerDerived.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Derivado",
  ).length;

  managerResolved.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Resuelto",
  ).length;
}

function renderizarAreasGestor(incidencias) {
  managerAreaRanking.innerHTML = "";

  const activas = incidencias.filter(
    (incidencia) => incidencia.estado !== "Resuelto",
  );

  const conteo = contarPorCampo(activas, "area");
  const areas = ordenarConteo(conteo);
  const maximo = obtenerMaximo(areas);

  if (areas.length === 0) {
    managerAreaRanking.innerHTML = "<p>No hay áreas con carga activa.</p>";
    return;
  }

  areas.forEach(([area, cantidad]) => {
    const porcentaje = Math.round((cantidad / maximo) * 100);

    const div = document.createElement("div");
    div.classList.add("area-row");

    div.innerHTML = `
      <div class="area-row-header">
        <strong>${area}</strong>
        <span>${cantidad} ${cantidad === 1 ? "caso" : "casos"}</span>
      </div>

      <div class="area-track">
        <div class="area-fill" style="width: ${porcentaje}%"></div>
      </div>
    `;

    managerAreaRanking.appendChild(div);
  });
}

function contarPorCampo(lista, campo) {
  const conteo = {};

  lista.forEach((item) => {
    const clave = item[campo] || "Sin asignar";

    if (!conteo[clave]) {
      conteo[clave] = 0;
    }

    conteo[clave]++;
  });

  return conteo;
}

function ordenarConteo(conteo) {
  return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
}

function obtenerMaximo(lista) {
  if (lista.length === 0) return 0;

  return Math.max(...lista.map((item) => item[1]));
}

cargarDashboardGestor();