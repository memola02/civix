const managerTotalIncidents = document.getElementById("managerTotalIncidents");
const managerHighPriority = document.getElementById("managerHighPriority");
const managerResolutionRate = document.getElementById("managerResolutionRate");
const managerCriticalZones = document.getElementById("managerCriticalZones");

const managerMappedIncidents = document.getElementById("managerMappedIncidents");
const managerCategoryChart = document.getElementById("managerCategoryChart");
const managerAreaRanking = document.getElementById("managerAreaRanking");
const managerImpactList = document.getElementById("managerImpactList");

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
  renderizarPrioridadImpacto(incidencias);
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

function renderizarPrioridadImpacto(incidencias) {
  if (!managerImpactList) {
    return;
  }

  managerImpactList.innerHTML = "";

  const priorizadas = incidencias
    .map((incidencia) => {
      const puntaje = calcularPuntajeImpacto(incidencia);
      const nivel = obtenerNivelImpacto(puntaje);

      return {
        ...incidencia,
        puntaje,
        nivel,
        motivoImpacto: construirMotivoImpacto(incidencia),
      };
    })
    .sort((a, b) => b.puntaje - a.puntaje);

  if (priorizadas.length === 0) {
    managerImpactList.innerHTML = `
      <div class="impact-empty">
        No hay incidencias disponibles para priorizar.
      </div>
    `;
    return;
  }

  priorizadas.slice(0, 5).forEach((incidencia, index) => {
    const article = document.createElement("article");
    article.classList.add(
      "impact-item",
      obtenerClaseImpacto(incidencia.nivel),
    );

    article.innerHTML = `
      <div class="impact-position">${index + 1}</div>

      <div class="impact-content">
        <div class="impact-title-row">
          <div>
            <span class="impact-code">${incidencia.id}</span>
            <h3>${incidencia.titulo}</h3>
          </div>

          <span class="impact-badge">${incidencia.nivel}</span>
        </div>

        <p>${incidencia.motivoImpacto}</p>

        <div class="impact-meta">
          <span>${incidencia.categoria}</span>
          <span>${incidencia.estado}</span>
          <span>${incidencia.area}</span>
        </div>

        <div class="impact-score">
          <div>
            <strong>${incidencia.puntaje}</strong>
            <span>puntos de impacto</span>
          </div>

          <div class="impact-track">
            <div
              class="impact-fill"
              style="width: ${Math.min(incidencia.puntaje, 100)}%"
            ></div>
          </div>
        </div>
      </div>
    `;

    managerImpactList.appendChild(article);
  });
}

function calcularPuntajeImpacto(incidencia) {
  let puntaje = 0;

  if (incidencia.prioridad === "Alta") {
    puntaje += 45;
  } else if (incidencia.prioridad === "Media") {
    puntaje += 30;
  } else {
    puntaje += 15;
  }

  if (incidencia.estado === "Pendiente") {
    puntaje += 30;
  } else if (incidencia.estado === "Derivado") {
    puntaje += 24;
  } else if (incidencia.estado === "Procesando") {
    puntaje += 20;
  } else if (incidencia.estado === "Reabierto") {
    puntaje += 32;
  } else {
    puntaje += 6;
  }

  if (
    incidencia.categoria === "Alumbrado público" ||
    incidencia.categoria === "Baches y hundimientos"
  ) {
    puntaje += 15;
  } else if (incidencia.categoria === "Acumulación de residuos") {
    puntaje += 10;
  } else {
    puntaje += 6;
  }

  if (incidencia.area === "Servicios públicos") {
    puntaje += 6;
  }

  return Math.min(puntaje, 100);
}

function obtenerNivelImpacto(puntaje) {
  if (puntaje >= 85) {
    return "Impacto crítico";
  }

  if (puntaje >= 70) {
    return "Impacto alto";
  }

  if (puntaje >= 50) {
    return "Impacto medio";
  }

  return "Impacto bajo";
}

function construirMotivoImpacto(incidencia) {
  const motivos = [];

  if (incidencia.prioridad === "Alta") {
    motivos.push("alta prioridad");
  }

  if (incidencia.estado !== "Resuelto") {
    motivos.push("caso aún no resuelto");
  }

  if (incidencia.estado === "Pendiente") {
    motivos.push("requiere primera atención");
  }

  if (incidencia.estado === "Reabierto") {
    motivos.push("reabierto por el ciudadano");
  }

  if (
    incidencia.categoria === "Alumbrado público" ||
    incidencia.categoria === "Baches y hundimientos"
  ) {
    motivos.push("posible afectación a seguridad o tránsito");
  }

  if (motivos.length === 0) {
    motivos.push("caso con impacto operativo bajo");
  }

  return `Priorizado por ${motivos.join(", ")}.`;
}

function obtenerClaseImpacto(nivel) {
  if (nivel === "Impacto crítico") {
    return "impact-critical";
  }

  if (nivel === "Impacto alto") {
    return "impact-high";
  }

  if (nivel === "Impacto medio") {
    return "impact-medium";
  }

  return "impact-low";
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
