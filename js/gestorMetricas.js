const metricsTotal = document.getElementById("metricsTotal");
const metricsActive = document.getElementById("metricsActive");
const metricsResolution = document.getElementById("metricsResolution");
const metricsHigh = document.getElementById("metricsHigh");

const metricsInsights = document.getElementById("metricsInsights");

async function cargarMetricasGestor() {
  const incidencias = await obtenerIncidencias();

  actualizarKpisMetricas(incidencias);

  crearGraficoBarras(
    "metricsCategoryChart",
    contarPorCampo(incidencias, "categoria"),
    "Reportes",
  );

  crearGraficoDona(
    "metricsStatusChart",
    contarPorCampo(incidencias, "estado"),
  );

  crearGraficoLinea(
    "metricsTrendChart",
    contarPorFecha(incidencias),
  );

  crearGraficoBarras(
    "metricsAreaChart",
    contarPorCampo(
      incidencias.filter((incidencia) => incidencia.estado !== "Resuelto"),
      "area",
    ),
    "Casos activos",
  );

  renderizarInsights(incidencias);
}

function abreviarCategoria(categoria) {
  const abreviaturas = {
    "Seguridad ciudadana": "Seguridad",
    "Limpieza pública": "Limpieza",
    "Servicios públicos": "Servicios",
    "Alumbrado público": "Alumbrado",
    "Acumulación de residuos": "Residuos",
    "Baches y hundimientos": "Baches",
    "Poda de árboles": "Poda",
    "Infraestructura vial": "Infr. Vial",
  };

  return abreviaturas[categoria] || categoria;
}

function actualizarKpisMetricas(incidencias) {
  const total = incidencias.length;
  const resueltas = incidencias.filter((i) => i.estado === "Resuelto").length;
  const activas = incidencias.filter((i) => i.estado !== "Resuelto").length;
  const altaPrioridad = incidencias.filter((i) => i.prioridad === "Alta").length;

  metricsTotal.textContent = total;
  metricsActive.textContent = activas;
  metricsHigh.textContent = altaPrioridad;
  metricsResolution.textContent =
    total === 0 ? "0%" : `${Math.round((resueltas / total) * 100)}%`;
}

function contarPorCampo(lista, campo) {
  const conteo = {};

  lista.forEach((item) => {
    const clave = item[campo] || "Sin asignar";
    conteo[clave] = (conteo[clave] || 0) + 1;
  });

  return conteo;
}

function contarPorFecha(incidencias) {
  const conteo = {};

  incidencias.forEach((incidencia) => {
    const fecha = incidencia.fechaReporte
      ? incidencia.fechaReporte.slice(0, 10)
      : convertirFechaTextoAISO(incidencia.fecha);

    conteo[fecha] = (conteo[fecha] || 0) + 1;
  });

  return Object.fromEntries(
    Object.entries(conteo).sort((a, b) => new Date(a[0]) - new Date(b[0])),
  );
}

function crearGraficoBarras(canvasId, conteo, label) {
  const labels = Object.keys(conteo).map(abreviarCategoria);
  const values = Object.values(conteo);

  new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderRadius: 12,
          backgroundColor: "#0fa8a5",
          borderColor: "#0f5fa8",
          borderWidth: 1,
        },
      ],
    },
    options: obtenerOpcionesBase(),
  });
}

function crearGraficoDona(canvasId, conteo) {
  const labels = Object.keys(conteo);
  const values = Object.values(conteo);

  new Chart(document.getElementById(canvasId), {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#0f5fa8", "#0fa8a5", "#f59e0b", "#22c55e"],
          borderColor: "#ffffff",
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function crearGraficoLinea(canvasId, conteoFechas) {
  const labels = Object.keys(conteoFechas).map(formatearFechaCorta);
  const values = Object.values(conteoFechas);

  new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Reportes diarios",
          data: values,
          tension: 0.35,
          fill: true,
          borderColor: "#0f5fa8",
          backgroundColor: "rgba(15, 168, 165, 0.16)",
          pointBackgroundColor: "#0fa8a5",
          pointRadius: 5,
        },
      ],
    },
    options: obtenerOpcionesBase(),
  });
}

function obtenerOpcionesBase() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };
}

function convertirFechaTextoAISO(fechaTexto) {
  const partes = fechaTexto.split("/");

  if (partes.length !== 3) return fechaTexto;

  const [dia, mes, anio] = partes;
  return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function formatearFechaCorta(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00`);

  return fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
  });
}

function renderizarInsights(incidencias) {
  metricsInsights.innerHTML = "";

  const categoriaTop = obtenerTop(contarPorCampo(incidencias, "categoria"));
  const areaTop = obtenerTop(
    contarPorCampo(
      incidencias.filter((incidencia) => incidencia.estado !== "Resuelto"),
      "area",
    ),
  );

  const altaPrioridad = incidencias.filter((i) => i.prioridad === "Alta").length;
  const total = incidencias.length;
  const resueltas = incidencias.filter((i) => i.estado === "Resuelto").length;
  const tasa = total === 0 ? 0 : Math.round((resueltas / total) * 100);

  const insights = [
    {
      etiqueta: "Categoría crítica",
      titulo: categoriaTop ? categoriaTop[0] : "Sin datos suficientes",
      texto: categoriaTop
        ? `Es la categoría con más reportes registrados: ${categoriaTop[1]} caso(s).`
        : "Todavía no hay reportes para analizar.",
    },
    {
      etiqueta: "Carga operativa",
      titulo: areaTop ? areaTop[0] : "Sin carga activa",
      texto: areaTop
        ? `Esta área concentra la mayor cantidad de casos activos: ${areaTop[1]} caso(s).`
        : "No hay incidencias activas asignadas.",
    },
    {
      etiqueta: "Desempeño",
      titulo: `${tasa}% de resolución`,
      texto:
        altaPrioridad > 0
          ? `Hay ${altaPrioridad} incidencia(s) de alta prioridad que deben monitorearse.`
          : "No hay incidencias de alta prioridad activas.",
    },
  ];

  insights.forEach((insight) => {
    const card = document.createElement("article");
    card.classList.add("insight-card");

    card.innerHTML = `
      <span>${insight.etiqueta}</span>
      <h3>${insight.titulo}</h3>
      <p>${insight.texto}</p>
    `;

    metricsInsights.appendChild(card);
  });
}

function obtenerTop(conteo) {
  return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
}

cargarMetricasGestor();