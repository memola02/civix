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

let incidenciasMapa = [];
let markersLayer = null;

const managerMap = L.map("managerMap").setView([-12.0464, -77.0428], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap",
}).addTo(managerMap);

markersLayer = L.layerGroup().addTo(managerMap);

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