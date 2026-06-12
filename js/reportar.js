const form = document.querySelector("#reportForm");

const progressFill = document.querySelector("#progressFill");
const progressPercent = document.querySelector("#progressPercent");
const progressText = document.querySelector("#progressText");

const addPhotoButton = document.querySelector("#addPhotoButton");
const photoInput = document.querySelector("#foto");
const photoList = document.querySelector("#photoList");

const reportModal = document.querySelector("#reportModal");
const modalClose = document.querySelector("#modalClose");
const modalIconImg = document.querySelector("#modalIconImg");
const modalTitle = document.querySelector("#modalTitle");
const modalMessage = document.querySelector("#modalMessage");
const modalPrimary = document.querySelector("#modalPrimary");
const modalSecondary = document.querySelector("#modalSecondary");

const saveDraftButton = document.querySelector("#saveDraftButton");
const loadDraftButton = document.querySelector("#loadDraftButton");

let selectedPhotos = [];

const fields = {
  categoria: {
    element: document.querySelector("#categoria"),
    message: "Seleccione una categoría.",
  },
  titulo: {
    element: document.querySelector("#titulo"),
    message: "Ingrese un título para la incidencia.",
  },
  descripcion: {
    element: document.querySelector("#descripcion"),
    message: "Ingrese una descripción breve.",
  },
  foto: {
    element: photoInput,
    message: "Adjunte al menos una foto como evidencia.",
  },
  ubicacion: {
    element: document.querySelector("#ubicacion"),
    message: "Ingrese o seleccione una ubicación.",
  },
};

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

async function registrarIncidenciaCiudadana() {
  const incidencias = await obtenerIncidencias();

  const nuevaIncidencia = {
    id: `INC-${String(incidencias.length + 1).padStart(3, "0")}`,
    titulo: fields.titulo.element.value,
    categoria: fields.categoria.element.value,
    ubicacion: fields.ubicacion.element.value,
    coordenadas: coordenadasSeleccionadas,
    fecha: new Date().toLocaleDateString("es-PE"),
    ciudadano: "Ciudadano demo",
    prioridad: "Media",
    estado: "Pendiente",
    area: "Por asignar",
    descripcion: fields.descripcion.element.value,
    imagen: "../assets/incidencias/default.jpg",
    fechaReporte: new Date().toISOString(),
    historial: [
      {
        fecha: new Date().toISOString(),
        accion: "Reporte creado por el ciudadano.",
      },
      {
        fecha: new Date().toISOString(),
        accion: "Incidencia recibida en bandeja administrativa.",
      },
    ],
  };

  incidencias.unshift(nuevaIncidencia);
  guardarIncidencias(incidencias);
}

function showError(input, message) {
  const group = input.closest(".form-group");
  const error = group.querySelector(".error-message");

  group.classList.add("has-error");
  error.textContent = message;
}

function clearError(input) {
  const group = input.closest(".form-group");
  const error = group.querySelector(".error-message");

  group.classList.remove("has-error");
  error.textContent = "";
}

function validateField(field) {
  const input = field.element;

  if (input.type === "file") {
    if (selectedPhotos.length === 0) {
      showError(input, field.message);
      return false;
    }

    clearError(input);
    return true;
  }

  if (input.value.trim() === "") {
    showError(input, field.message);
    return false;
  }

  clearError(input);
  return true;
}

function fieldHasValue(input) {
  if (input.type === "file") {
    return selectedPhotos.length > 0;
  }

  return input.value.trim() !== "";
}

function updateProgress() {
  const totalFields = Object.values(fields).length;

  const completedFields = Object.values(fields).filter((field) => {
    return fieldHasValue(field.element);
  }).length;

  const percent = Math.round((completedFields / totalFields) * 100);

  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;

  if (percent === 0) {
    progressText.textContent = "Completa los campos requeridos";
  } else if (percent < 100) {
    progressText.textContent = "Reporte en progreso";
  } else {
    progressText.textContent = "Listo para enviar";
  }

  return percent;
}

function renderPhotos() {
  photoList.innerHTML = "";

  selectedPhotos.forEach((file, index) => {
    const preview = document.createElement("div");
    preview.classList.add("photo-preview");

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "Foto adjuntada";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("remove-photo");
    removeButton.textContent = "×";

    removeButton.addEventListener("click", () => {
      selectedPhotos.splice(index, 1);
      renderPhotos();
      validateField(fields.foto);
      updateProgress();
    });

    preview.appendChild(img);
    preview.appendChild(removeButton);
    photoList.appendChild(preview);
  });
}

addPhotoButton.addEventListener("click", () => {
  photoInput.click();
});

photoInput.addEventListener("change", () => {
  const files = Array.from(photoInput.files);
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  files.forEach((file) => {
    if (!allowedTypes.includes(file.type)) {
      showError(photoInput, "Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }

    selectedPhotos.push(file);
  });

  photoInput.value = "";

  renderPhotos();
  validateField(fields.foto);
  updateProgress();
});

Object.values(fields).forEach((field) => {
  field.element.addEventListener("input", () => {
    validateField(field);
    updateProgress();
  });

  field.element.addEventListener("change", () => {
    validateField(field);
    updateProgress();
  });
});

function closeModal() {
  reportModal.hidden = true;
}

function openModal(type) {
  if (type === "success") {
    modalIconImg.src = "../assets/icons/check.png";
    modalTitle.textContent = "Reporte enviado correctamente";
    modalMessage.textContent =
      "Tu incidencia fue registrada con éxito. Puedes revisar su avance desde la sección de seguimiento.";

    modalPrimary.textContent = "Ver seguimiento";
    modalSecondary.textContent = "Crear otro reporte";

    modalPrimary.onclick = () => {
      window.location.href = "seguimiento.html";
    };

    modalSecondary.onclick = () => {
      closeModal();
      form.reset();
      selectedPhotos = [];
      renderPhotos();
      updateProgress();
    };
  }

  else if (type === "error") {
    modalIconImg.src = "../assets/icons/x.png";
    modalTitle.textContent = "No se pudo enviar el reporte";
    modalMessage.textContent =
      "Aún faltan campos obligatorios. Revisa los campos marcados en rojo y completa la información pendiente.";

    modalPrimary.textContent = "Seguir llenando";
    modalSecondary.textContent = "Cerrar";

    modalPrimary.onclick = () => {
      closeModal();

      const firstError = document.querySelector(".form-group.has-error");

      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    };

    modalSecondary.onclick = closeModal;
  }

  else if (type === "draftSaved") {
    modalIconImg.src = "../assets/icons/check.png";

    modalTitle.textContent = "Borrador guardado";
    modalMessage.textContent =
      "Tu reporte fue guardado y podrás continuar completándolo más tarde.";

    modalPrimary.textContent = "Continuar editando";
    modalSecondary.textContent = "Cerrar";

    modalPrimary.onclick = closeModal;
    modalSecondary.onclick = closeModal;
  }

  else if (type === "draftLoaded") {
    modalIconImg.src = "../assets/icons/check.png";

    modalTitle.textContent = "Borrador cargado";
    modalMessage.textContent =
      "Se recuperó la información guardada previamente.";

    modalPrimary.textContent = "Continuar";
    modalSecondary.textContent = "Cerrar";

    modalPrimary.onclick = closeModal;
    modalSecondary.onclick = closeModal;
  }

  else if (type === "draftNotFound") {
    modalIconImg.src = "../assets/icons/x.png";

    modalTitle.textContent = "No se encontró un borrador";
    modalMessage.textContent =
      "Todavía no existe información guardada para recuperar.";

    modalPrimary.textContent = "Entendido";
    modalSecondary.textContent = "Cerrar";

    modalPrimary.onclick = closeModal;
    modalSecondary.onclick = closeModal;
  }

  reportModal.hidden = false;
}

function saveDraft() {
  const draft = {
    categoria: fields.categoria.element.value,
    descripcion: fields.descripcion.element.value,
    ubicacion: fields.ubicacion.element.value,
    fechaGuardado: new Date().toLocaleString(),
  };

  localStorage.setItem("civixDraft", JSON.stringify(draft));

  openModal("draftSaved");
}

function loadDraft() {
  const draft = localStorage.getItem("civixDraft");

  if (!draft) {
    openModal("draftNotFound");
    return;
  }

  const data = JSON.parse(draft);

  fields.categoria.element.value = data.categoria || "";
  fields.descripcion.element.value = data.descripcion || "";
  fields.ubicacion.element.value = data.ubicacion || "";

  Object.values(fields).forEach((field) => {
    if (field.element.type !== "file") {
      validateField(field);
    }
  });

  updateProgress();

  openModal("draftLoaded");
}

saveDraftButton.addEventListener("click", saveDraft);
loadDraftButton.addEventListener("click", loadDraft);

modalClose.addEventListener("click", closeModal);

reportModal.addEventListener("click", (event) => {
  if (event.target === reportModal) {
    closeModal();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  let isValid = true;

  Object.values(fields).forEach((field) => {
    const fieldIsValid = validateField(field);

    if (!fieldIsValid) {
      isValid = false;
    }
  });

  const percent = updateProgress();

  if (isValid && percent === 100) {
    await registrarIncidenciaCiudadana();
    localStorage.removeItem("civixDraft");
    openModal("success");
  } else {
    openModal("error");
  }
});

/* Mapa interactivo */

const ubicacionInput = document.querySelector("#ubicacion");

const map = L.map("map").setView([-12.0464, -77.0428], 13);

let coordenadasSeleccionadas = {
  lat: -12.0464,
  lng: -77.0428,
};

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

let marker = L.marker([-12.0464, -77.0428], {
  draggable: true,
}).addTo(map);

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.display_name) {
    ubicacionInput.value = data.display_name;
    validateField(fields.ubicacion);
    updateProgress();
  }
}

async function searchAddress(address) {
  if (address.trim() === "") {
    showError(ubicacionInput, "Ingrese una dirección para buscar.");
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address,
  )}&limit=1&countrycodes=pe`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.length === 0) {
    showError(ubicacionInput, "No se encontró la dirección.");
    return;
  }

  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);

  coordenadasSeleccionadas = {
    lat,
    lng: lon,
  };

  marker.setLatLng([lat, lon]);
  map.setView([lat, lon], 17);

  ubicacionInput.value = data[0].display_name;
  validateField(fields.ubicacion);
  updateProgress();
}

map.on("click", (event) => {
  const { lat, lng } = event.latlng;

  coordenadasSeleccionadas = {
    lat,
    lng,
  };

  marker.setLatLng([lat, lng]);
  reverseGeocode(lat, lng);
});

marker.on("dragend", () => {
  const position = marker.getLatLng();

  coordenadasSeleccionadas = {
    lat: position.lat,
    lng: position.lng,
  };

  reverseGeocode(position.lat, position.lng);
});

ubicacionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchAddress(ubicacionInput.value);
  }
});

updateProgress();
