const dashboardPending = document.getElementById("dashboardPending");
const dashboardProcessing = document.getElementById("dashboardProcessing");
const dashboardHighPriority = document.getElementById("dashboardHighPriority");
const dashboardResolved = document.getElementById("dashboardResolved");

const dashboardActivityList = document.getElementById("dashboardActivityList");
const dashboardAreaList = document.getElementById("dashboardAreaList");

async function cargarDashboard() {
  const incidencias = await obtenerIncidencias();

  actualizarTarjetas(incidencias);
  renderizarActividadReciente(incidencias);
  renderizarCargaPorArea(incidencias);
}

function actualizarTarjetas(incidencias) {
  dashboardPending.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Pendiente",
  ).length;

  dashboardProcessing.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Procesando",
  ).length;

  dashboardHighPriority.textContent = incidencias.filter(
    (incidencia) => incidencia.prioridad === "Alta",
  ).length;

  dashboardResolved.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Resuelto",
  ).length;
}

function renderizarActividadReciente(incidencias) {
  dashboardActivityList.innerHTML = "";

  const movimientos = [];

  incidencias.forEach((incidencia) => {
    incidencia.historial.forEach((registro) => {
      movimientos.push({
        titulo: incidencia.titulo,
        categoria: incidencia.categoria,
        fecha: registro.fecha,
        movimiento: registro.accion,
      });
    });
  });

  movimientos.sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });

  const recientes = movimientos.slice(0, 5);

  recientes.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("activity-item");

    div.innerHTML = `
      <span class="activity-dot"></span>
      <div>
        <p><strong>${item.titulo}</strong></p>

        <p>
          ${item.categoria} ·
          ${new Date(item.fecha).toLocaleString("es-PE")}
        </p>

        <i>${item.movimiento}</i>
      </div>
    `;

    dashboardActivityList.appendChild(div);
  });
}

function renderizarCargaPorArea(incidencias) {
  dashboardAreaList.innerHTML = "";

  const cargaPorArea = {};

  incidencias.forEach((incidencia) => {
    if (incidencia.estado === "Resuelto") return;

    if (!cargaPorArea[incidencia.area]) {
      cargaPorArea[incidencia.area] = 0;
    }

    cargaPorArea[incidencia.area]++;
  });

  const areasOrdenadas = Object.entries(cargaPorArea).sort((a, b) => {
    return b[1] - a[1];
  });

  if (areasOrdenadas.length === 0) {
    dashboardAreaList.innerHTML =
      "<p>No hay áreas con carga pendiente.</p>";
    return;
  }

  areasOrdenadas.forEach(([area, cantidad]) => {
    const div = document.createElement("div");
    div.classList.add("area-row");

    div.innerHTML = `
      <span>${area}</span>
      <strong>${cantidad} ${cantidad === 1 ? "caso" : "casos"}</strong>
    `;

    dashboardAreaList.appendChild(div);
  });
}

cargarDashboard();
