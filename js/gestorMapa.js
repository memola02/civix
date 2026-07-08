const mapCategoryFilter = document.getElementById("mapCategoryFilter");
const mapStatusFilter = document.getElementById("mapStatusFilter");
const mapPriorityFilter = document.getElementById("mapPriorityFilter");
const resetMapFilters = document.getElementById("resetMapFilters");

const visibleIncidentsCount = document.getElementById("visibleIncidentsCount");
const visibleHighPriorityCount = document.getElementById(
  "visibleHighPriorityCount",
);
const visiblePendingCount = document.getElementById("visiblePendingCount");
const mapResultsList = document.getElementById("mapResultsList");
const criticalZonesList = document.getElementById("criticalZonesList");

let incidenciasMapa = [];
let markersLayer = null;
let criticalZonesLayer = null;

const managerMap = L.map("managerMap").setView([-12.0464, -77.0428], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap",
}).addTo(managerMap);

markersLayer = L.layerGroup().addTo(managerMap);
criticalZonesLayer = L.layerGroup().addTo(managerMap);

async function iniciarMapaGestor() {
  incidenciasMapa = await obtenerIncidencias();

  llenarFiltroCategorias(incidenciasMapa);
  aplicarFiltrosMapa();
}

function llenarFiltroCategorias(incidencias) {
  const categorias = [...new Set(incidencias.map((i) => i.categoria))].sort();

  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    mapCategoryFilter.appendChild(option);
  });
}

function aplicarFiltrosMapa() {
  const categoria = mapCategoryFilter.value;
  const estado = mapStatusFilter.value;
  const prioridad = mapPriorityFilter.value;

  const filtradas = incidenciasMapa.filter((incidencia) => {
    const coincideCategoria =
      categoria === "" || incidencia.categoria === categoria;

    const coincideEstado = estado === "" || incidencia.estado === estado;

    const coincidePrioridad =
      prioridad === "" || incidencia.prioridad === prioridad;

    const tieneCoordenadas =
      incidencia.coordenadas &&
      typeof incidencia.coordenadas.lat === "number" &&
      typeof incidencia.coordenadas.lng === "number";

    return (
      coincideCategoria &&
      coincideEstado &&
      coincidePrioridad &&
      tieneCoordenadas
    );
  });

  renderizarMarcadores(filtradas);
  renderizarZonasCriticas(filtradas);
  actualizarResumenMapa(filtradas);
  renderizarListaMapa(filtradas);
}

function renderizarMarcadores(incidencias) {
  markersLayer.clearLayers();

  const bounds = [];

  incidencias.forEach((incidencia) => {
    const { lat, lng } = incidencia.coordenadas;

    const marker = L.marker([lat, lng], {
      icon: crearIconoPorPrioridad(incidencia.prioridad),
    });

    marker.bindPopup(`
      <div class="map-popup">
        <h3>${incidencia.titulo}</h3>
        <p><strong>Categoría:</strong> ${incidencia.categoria}</p>
        <p><strong>Estado:</strong> ${incidencia.estado}</p>
        <p><strong>Prioridad:</strong> ${incidencia.prioridad}</p>
        <p><strong>Ubicación:</strong> ${incidencia.ubicacion}</p>
      </div>
    `);

    marker.addTo(markersLayer);
    bounds.push([lat, lng]);
  });

  if (bounds.length > 0) {
    managerMap.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    });
  }
}

function renderizarZonasCriticas(incidencias) {
  criticalZonesLayer.clearLayers();

  if (!criticalZonesList) {
    return;
  }

  const zonas = calcularZonasCriticas(incidencias);
  criticalZonesList.innerHTML = "";

  if (zonas.length === 0) {
    criticalZonesList.innerHTML = `
      <div class="empty-critical-zone">
        No hay zonas críticas visibles con los filtros actuales.
      </div>
    `;
    return;
  }

  zonas.slice(0, 5).forEach((zona, index) => {
    pintarZonaCriticaEnMapa(zona);

    const article = document.createElement("article");
    article.classList.add("critical-zone-card", obtenerClaseZona(zona.nivel));

    article.innerHTML = `
      <div class="zone-rank">${index + 1}</div>

      <div class="zone-content">
        <div class="zone-header">
          <h3>${zona.ubicacion}</h3>
          <span>${zona.nivel}</span>
        </div>

        <p>${zona.motivo}</p>

        <div class="zone-meta">
          <strong>${zona.total}</strong>
          <span>reportes asociados</span>
        </div>
      </div>

      <button
        class="zone-focus-button"
        data-lat="${zona.lat}"
        data-lng="${zona.lng}"
      >
        Ver zona
      </button>
    `;

    criticalZonesList.appendChild(article);
  });

  document.querySelectorAll(".zone-focus-button").forEach((button) => {
    button.addEventListener("click", () => {
      const lat = Number(button.dataset.lat);
      const lng = Number(button.dataset.lng);

      managerMap.setView([lat, lng], 16);
    });
  });
}

function calcularZonasCriticas(incidencias) {
  const zonas = {};

  incidencias.forEach((incidencia) => {
    const tieneCoordenadas =
      incidencia.coordenadas &&
      typeof incidencia.coordenadas.lat === "number" &&
      typeof incidencia.coordenadas.lng === "number";

    if (!tieneCoordenadas) {
      return;
    }

    const clave = incidencia.ubicacion;

    if (!zonas[clave]) {
      zonas[clave] = {
        ubicacion: incidencia.ubicacion,
        lat: incidencia.coordenadas.lat,
        lng: incidencia.coordenadas.lng,
        total: 0,
        altaPrioridad: 0,
        sinResolver: 0,
        puntaje: 0,
      };
    }

    zonas[clave].total += 1;

    if (incidencia.prioridad === "Alta") {
      zonas[clave].altaPrioridad += 1;
    }

    if (incidencia.estado !== "Resuelto") {
      zonas[clave].sinResolver += 1;
    }

    zonas[clave].puntaje += obtenerPuntajeCritico(incidencia);
  });

  return Object.values(zonas)
    .map((zona) => {
      const nivel = obtenerNivelZona(zona.puntaje);

      return {
        ...zona,
        nivel,
        motivo: construirMotivoZona(zona),
      };
    })
    .sort((a, b) => b.puntaje - a.puntaje);
}

function obtenerPuntajeCritico(incidencia) {
  let puntaje = 0;

  if (incidencia.prioridad === "Alta") {
    puntaje += 3;
  } else if (incidencia.prioridad === "Media") {
    puntaje += 2;
  } else {
    puntaje += 1;
  }

  if (incidencia.estado === "Pendiente") {
    puntaje += 3;
  } else if (incidencia.estado === "Procesando") {
    puntaje += 2;
  } else if (incidencia.estado === "Derivado") {
    puntaje += 2;
  } else {
    puntaje += 0.5;
  }

  return puntaje;
}

function obtenerNivelZona(puntaje) {
  if (puntaje >= 5) {
    return "Riesgo alto";
  }

  if (puntaje >= 3.5) {
    return "Riesgo medio";
  }

  return "Riesgo bajo";
}

function construirMotivoZona(zona) {
  const partes = [];

  if (zona.altaPrioridad > 0) {
    partes.push(`${zona.altaPrioridad} de alta prioridad`);
  }

  if (zona.sinResolver > 0) {
    partes.push(`${zona.sinResolver} sin resolver`);
  }

  if (partes.length === 0) {
    partes.push("sin alertas críticas activas");
  }

  return partes.join(" · ");
}

function pintarZonaCriticaEnMapa(zona) {
  const color = obtenerColorZona(zona.nivel);
  const radio = Math.min(760, 260 + zona.puntaje * 75 + zona.total * 45);

  L.circle([zona.lat, zona.lng], {
    radius: radio,
    color,
    weight: 2,
    opacity: 0.7,
    fillColor: color,
    fillOpacity: 0.18,
  })
    .bindPopup(`
      <div class="map-popup">
        <h3>${zona.ubicacion}</h3>
        <p><strong>Nivel:</strong> ${zona.nivel}</p>
        <p><strong>Reportes:</strong> ${zona.total}</p>
        <p><strong>Motivo:</strong> ${zona.motivo}</p>
      </div>
    `)
    .addTo(criticalZonesLayer);
}

function obtenerClaseZona(nivel) {
  if (nivel === "Riesgo alto") {
    return "zone-high";
  }

  if (nivel === "Riesgo medio") {
    return "zone-medium";
  }

  return "zone-low";
}

function obtenerColorZona(nivel) {
  if (nivel === "Riesgo alto") {
    return "#dc2626";
  }

  if (nivel === "Riesgo medio") {
    return "#f59e0b";
  }

  return "#0fa8a5";
}

function crearIconoPorPrioridad(prioridad) {
  let clase = "marker-low";

  if (prioridad === "Alta") {
    clase = "marker-high";
  } else if (prioridad === "Media") {
    clase = "marker-medium";
  }

  return L.divIcon({
    className: "",
    html: `<div class="custom-map-marker ${clase}"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

function actualizarResumenMapa(incidencias) {
  visibleIncidentsCount.textContent = incidencias.length;

  visibleHighPriorityCount.textContent = incidencias.filter(
    (incidencia) => incidencia.prioridad === "Alta",
  ).length;

  visiblePendingCount.textContent = incidencias.filter(
    (incidencia) => incidencia.estado === "Pendiente",
  ).length;
}

function renderizarListaMapa(incidencias) {
  mapResultsList.innerHTML = "";

  if (incidencias.length === 0) {
    mapResultsList.innerHTML =
      "<p>No hay incidencias que coincidan con los filtros.</p>";
    return;
  }

  incidencias.forEach((incidencia) => {
    const div = document.createElement("div");
    div.classList.add("map-result-item");

    div.innerHTML = `
      <div>
        <h3>${incidencia.titulo}</h3>
        <p>${incidencia.ubicacion}</p>
        <p>${incidencia.categoria} · ${incidencia.area}</p>
      </div>

      <div class="map-badges">
        <span class="map-badge ${obtenerClasePrioridadMapa(incidencia.prioridad)}">
          ${incidencia.prioridad}
        </span>

        <span class="map-badge">
          ${incidencia.estado}
        </span>
      </div>
    `;

    mapResultsList.appendChild(div);
  });
}

function obtenerClasePrioridadMapa(prioridad) {
  if (prioridad === "Alta") return "high";
  if (prioridad === "Media") return "medium";
  return "low";
}

mapCategoryFilter.addEventListener("change", aplicarFiltrosMapa);
mapStatusFilter.addEventListener("change", aplicarFiltrosMapa);
mapPriorityFilter.addEventListener("change", aplicarFiltrosMapa);

resetMapFilters.addEventListener("click", () => {
  mapCategoryFilter.value = "";
  mapStatusFilter.value = "";
  mapPriorityFilter.value = "";
  aplicarFiltrosMapa();
});

iniciarMapaGestor();
