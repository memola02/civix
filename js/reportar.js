const form = document.querySelector("#reportForm");

const fields = {
  categoria: {
    element: document.querySelector("#categoria"),
    message: "Seleccione una categoría.",
  },
  descripcion: {
    element: document.querySelector("#descripcion"),
    message: "Ingrese una descripción breve.",
  },
  foto: {
    element: document.querySelector("#foto"),
    message: "Adjunte una foto como evidencia.",
  },
  ubicacion: {
    element: document.querySelector("#ubicacion"),
    message: "Ingrese una ubicación.",
  },
};

const progressFill = document.querySelector("#progressFill");
const progressPercent = document.querySelector("#progressPercent");
const progressText = document.querySelector("#progressText");

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
    if (input.files.length === 0) {
      showError(input, field.message);
      return false;
    }
  } else if (input.value.trim() === "") {
    showError(input, field.message);
    return false;
  }

  clearError(input);
  return true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let isValid = true;

  Object.values(fields).forEach((field) => {
    const fieldIsValid = validateField(field);

    if (!fieldIsValid) {
      isValid = false;
    }
  });

  if (isValid) {
    alert("Reporte enviado correctamente.");
    form.reset();
  }
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

// Simulación de progreso

function fieldHasValue(input) {
  if (input.type === "file") {
    return input.files.length > 0;
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
}