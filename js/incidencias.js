let incidencias = [];
let incidenciaSeleccionada = null;

const incidentsBody = document.getElementById("incidentsBody");
const searchIncident = document.getElementById("searchIncident");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const processCount = document.getElementById("processCount");
const derivedCount = document.getElementById("derivedCount");
const resolvedCount = document.getElementById("resolvedCount");

const modalOverlay = document.querySelector(".modal-overlay");
const modalClose = document.querySelector(".modal-close");

const modalTitle = document.getElementById("modalTitle");
const modalImage = document.getElementById("modalImage");
const modalIncidentTitle = document.getElementById("modalIncidentTitle");
const modalCategory = document.getElementById("modalCategory");
const modalAreaAssigned = document.getElementById("modalAreaAssigned");
const modalLocation = document.getElementById("modalLocation");
const modalDate = document.getElementById("modalDate");
const modalCitizen = document.getElementById("modalCitizen");
const modalDescription = document.getElementById("modalDescription");
const modalStatus = document.getElementById("modalStatus");
const modalArea = document.getElementById("modalArea");
const historyList = document.getElementById("historyList");
const historyTotalEvents = document.getElementById("historyTotalEvents");
const historyCreatedAt = document.getElementById("historyCreatedAt");
const historyLastUpdate = document.getElementById("historyLastUpdate");
const historyCurrentStatus = document.getElementById("historyCurrentStatus");
const historyCurrentArea = document.getElementById("historyCurrentArea");
const saveChangesButton = document.getElementById("saveChangesButton");

async function cargarIncidencias() {
  incidencias = await obtenerIncidencias();

  renderizarTabla(incidencias);
  actualizarContadores(incidencias);
}

function renderizarTabla(lista) {
  incidentsBody.innerHTML = "";

  lista.forEach((incidencia) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>#${incidencia.id}</td>
      <td>${incidencia.titulo}</td>
      <td>${incidencia.categoria}</td>
      <td>${incidencia.area}</td>
      <td>${incidencia.ubicacion}</td>
      <td>${incidencia.fecha}</td>
      <td>${incidencia.ciudadano}</td>
      <td>
        <span class="badge ${obtenerClasePrioridad(incidencia.prioridad)}">
          ${incidencia.prioridad}
        </span>
      </td>
      <td>
        <span class="badge ${obtenerClaseEstado(incidencia.estado)}">
          ${incidencia.estado}
        </span>
      </td>
      <td>
        <button class="table-action" type="button" data-id="${incidencia.id}">
          Ver detalle
        </button>
      </td>
    `;

    incidentsBody.appendChild(fila);
  });

  totalCount.textContent = `${lista.length} reportes encontrados`;

  document.querySelectorAll(".table-action").forEach((boton) => {
    boton.addEventListener("click", () => {
      abrirModal(boton.dataset.id);
    });
  });
}

function obtenerClasePrioridad(prioridad) {
  if (prioridad === "Alta") return "priority-high";
  if (prioridad === "Media") return "priority-medium";
  return "priority-low";
}

function obtenerClaseEstado(estado) {
  if (estado === "Pendiente") return "status-pending";
  if (estado === "Procesando") return "status-process";
  if (estado === "Derivado") return "status-derived";
  return "status-resolved";
}

function filtrarIncidencias() {
  const texto = searchIncident.value.toLowerCase();
  const categoria = categoryFilter.value;
  const estado = statusFilter.value;

  const filtradas = incidencias.filter((incidencia) => {
    const coincideTexto =
      incidencia.id.toLowerCase().includes(texto) ||
      incidencia.titulo.toLowerCase().includes(texto) ||
      incidencia.ciudadano.toLowerCase().includes(texto) ||
      incidencia.ubicacion.toLowerCase().includes(texto);

    const coincideCategoria =
      categoria === "" || incidencia.categoria === categoria;

    const coincideEstado = estado === "" || incidencia.estado === estado;

    return coincideTexto && coincideCategoria && coincideEstado;
  });

  renderizarTabla(filtradas);
  actualizarContadores(filtradas);
}

function actualizarContadores(lista) {
  pendingCount.textContent = lista.filter(
    (incidencia) => incidencia.estado === "Pendiente",
  ).length;

  processCount.textContent = lista.filter(
    (incidencia) => incidencia.estado === "Procesando",
  ).length;

  derivedCount.textContent = lista.filter(
    (incidencia) => incidencia.estado === "Derivado",
  ).length;

  resolvedCount.textContent = lista.filter(
    (incidencia) => incidencia.estado === "Resuelto",
  ).length;
}

function abrirModal(id) {
  incidenciaSeleccionada = incidencias.find(
    (incidencia) => incidencia.id === id,
  );

  if (!incidenciaSeleccionada) return;

  modalTitle.textContent = `Incidencia #${incidenciaSeleccionada.id}`;
  modalImage.src = incidenciaSeleccionada.imagen;
  modalIncidentTitle.textContent = incidenciaSeleccionada.titulo;
  modalCategory.textContent = incidenciaSeleccionada.categoria;
  modalAreaAssigned.textContent = incidenciaSeleccionada.area;
  modalLocation.textContent = incidenciaSeleccionada.ubicacion;
  modalDate.textContent = incidenciaSeleccionada.fecha;
  modalCitizen.textContent = incidenciaSeleccionada.ciudadano;
  modalDescription.textContent = incidenciaSeleccionada.descripcion;

  modalStatus.value = incidenciaSeleccionada.estado;
  modalArea.value = incidenciaSeleccionada.area;

  renderizarHistorialCompleto(incidenciaSeleccionada);

  modalOverlay.classList.remove("hidden");
}

function renderizarHistorialCompleto(incidencia) {
  const historial = incidencia.historial || [];

  historyList.innerHTML = "";

  historyTotalEvents.textContent = `${historial.length} eventos`;
  historyCreatedAt.textContent =
    historial.length > 0 ? formatearFecha(historial[0].fecha) : incidencia.fecha;
  historyLastUpdate.textContent =
    historial.length > 0
      ? formatearFecha(historial[historial.length - 1].fecha)
      : incidencia.fecha;
  historyCurrentStatus.textContent = incidencia.estado;
  historyCurrentArea.textContent = incidencia.area;

  if (historial.length === 0) {
    historyList.innerHTML = `
      <div class="complete-history-empty">
        Esta incidencia todavía no cuenta con eventos registrados.
      </div>
    `;
    return;
  }

  const historialOrdenado = [...historial].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });

  historialOrdenado.forEach((registro, index) => {
    const item = document.createElement("article");
    item.classList.add("complete-history-item", obtenerClaseEvento(registro.accion));

    item.innerHTML = `
      <div class="history-timeline-marker">
        <span>${historialOrdenado.length - index}</span>
      </div>

      <div class="history-event-content">
        <div class="history-event-top">
          <strong>${formatearFecha(registro.fecha)}</strong>
          <span>${obtenerEtiquetaEvento(registro.accion)}</span>
        </div>

        <p>${registro.accion}</p>
      </div>
    `;

    historyList.appendChild(item);
  });
}

function obtenerClaseEvento(accion) {
  const texto = accion.toLowerCase();

  if (texto.includes("resuelto") || texto.includes("confirmó")) {
    return "event-resolved";
  }

  if (texto.includes("derivada") || texto.includes("área asignada")) {
    return "event-derived";
  }

  if (texto.includes("procesando") || texto.includes("intervención")) {
    return "event-process";
  }

  if (texto.includes("reabrió")) {
    return "event-reopened";
  }

  return "event-created";
}

function obtenerEtiquetaEvento(accion) {
  const texto = accion.toLowerCase();

  if (texto.includes("resuelto") || texto.includes("confirmó")) {
    return "Cierre / resolución";
  }

  if (texto.includes("derivada") || texto.includes("área asignada")) {
    return "Derivación";
  }

  if (texto.includes("procesando") || texto.includes("intervención")) {
    return "Atención";
  }

  if (texto.includes("reabrió")) {
    return "Reapertura";
  }

  return "Registro";
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString("es-PE");
}

function guardarCambios() {
  if (!incidenciaSeleccionada) return;

  const nuevoEstado = modalStatus.value;
  const nuevaArea = modalArea.value;

  const estadoAnterior = incidenciaSeleccionada.estado;
  const areaAnterior = incidenciaSeleccionada.area;

  incidenciaSeleccionada.estado = nuevoEstado;
  incidenciaSeleccionada.area = nuevaArea;

  if (areaAnterior !== nuevaArea) {
    incidenciaSeleccionada.historial.push({
      fecha: new Date().toISOString(),
      accion: `Área asignada actualizada de "${areaAnterior}" a "${nuevaArea}".`,
    });
  }

  if (estadoAnterior !== nuevoEstado) {
    incidenciaSeleccionada.historial.push({
      fecha: new Date().toISOString(),
      accion: `Estado actualizado de "${estadoAnterior}" a "${nuevoEstado}".`,
    });
  }

  modalAreaAssigned.textContent = incidenciaSeleccionada.area;

  guardarIncidencias(incidencias);
  filtrarIncidencias();
  renderizarHistorialCompleto(incidenciaSeleccionada);
  modalOverlay.classList.add("hidden");
}

searchIncident.addEventListener("input", filtrarIncidencias);
categoryFilter.addEventListener("change", filtrarIncidencias);
statusFilter.addEventListener("change", filtrarIncidencias);

modalClose.addEventListener("click", () => {
  modalOverlay.classList.add("hidden");
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    modalOverlay.classList.add("hidden");
  }
});

saveChangesButton.addEventListener("click", guardarCambios);

cargarIncidencias();
