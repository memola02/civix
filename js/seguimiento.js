const datosExtra = {
  "#INC-005": {
    desc: "Poste apagado generando total oscuridad e inseguridad.",
    plazo: "15/06/2026",
    foto: "../assets/incidencias/incidencia1.jpg"
  },
  "#INC-004": {
    desc: "Acumulación de basura en la esquina del parque. Atrae insectos.",
    plazo: "13/06/2026",
    foto: "../assets/incidencias/incidencia2.jpg"
  },
  "#INC-003": {
    desc: "Bache profundo en la vía principal. Dificulta el tránsito vehicular.",
    plazo: "20/06/2026",
    foto: "../assets/incidencias/incidencia3.jpg"
  },
  "#INC-001": {
    desc: "Semáforo intermitente causando congestión y riesgo de accidentes.",
    plazo: "Solucionado el 12/06/2026",
    foto: "../assets/incidencias/incidencia5.jpg"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalDetalle");
  const btnCerrar = document.getElementById("btnCerrarModal");
  const botonesDetalle = document.querySelectorAll(".boton-detalle");
  const btnConfirmar = document.querySelector(".boton-primario.confirmar");
  const btnRechazar = document.querySelector(".boton-secundario.rechazar");

  let filaActual = null;

  const notificationButton = document.getElementById("notificationButton");
  const notificationPanel = document.getElementById("notificationPanel");
  const notificationClose = document.getElementById("notificationClose");
  const notificationCount = document.getElementById("notificationCount");
  const notificationsList = document.getElementById("notificationsList");

  renderizarNotificaciones();
  activarPanelNotificaciones();

  function activarPanelNotificaciones() {
    if (!notificationButton || !notificationPanel || !notificationClose) {
      return;
    }

    notificationButton.addEventListener("click", (event) => {
      event.stopPropagation();

      if (notificationPanel.hasAttribute("hidden")) {
        notificationPanel.removeAttribute("hidden");
      } else {
        notificationPanel.setAttribute("hidden", "");
      }
    });

    notificationClose.addEventListener("click", () => {
      notificationPanel.setAttribute("hidden", "");
    });

    document.addEventListener("click", (event) => {
      const clickDentro = event.target.closest(".notification-wrapper");

      if (!clickDentro) {
        notificationPanel.setAttribute("hidden", "");
      }
    });
  }

  function renderizarNotificaciones() {
    if (!notificationsList || !notificationCount) {
      return;
    }

    const notificaciones = construirNotificaciones();
    notificationCount.textContent = notificaciones.length;
    notificationsList.innerHTML = "";

    if (notificaciones.length === 0) {
      notificationsList.innerHTML = `
        <div class="notification-empty">
          No tienes actualizaciones nuevas por el momento.
        </div>
      `;
      return;
    }

    notificaciones.forEach((notificacion) => {
      const article = document.createElement("article");
      article.classList.add("notification-item", notificacion.clase);

      article.innerHTML = `
        <div class="notification-dot"></div>

        <div>
          <div class="notification-title-row">
            <strong>${notificacion.id}</strong>
            <span>${notificacion.estado}</span>
          </div>

          <p>${notificacion.mensaje}</p>
          <small>${notificacion.ubicacion}</small>
        </div>
      `;

      notificationsList.appendChild(article);
    });
  }

  function construirNotificaciones() {
    const filas = Array.from(
      document.querySelectorAll("#tablaIncidencias tbody tr")
    );

    return filas.map((fila) => {
      const id = fila.querySelector(".td-id").textContent;
      const titulo = fila.cells[1].textContent;
      const ubicacion = fila.cells[4].textContent;
      const estado = fila.querySelector(".etiqueta-estado-tabla").textContent;

      return {
        id,
        estado,
        ubicacion,
        clase: obtenerClaseNotificacion(estado),
        mensaje: obtenerMensajeNotificacion(id, titulo, estado),
      };
    });
  }

  function obtenerMensajeNotificacion(id, titulo, estado) {
    if (estado === "Pendiente") {
      return `${titulo} aún se encuentra pendiente de primera atención.`;
    }

    if (estado === "Derivado") {
      return `${titulo} fue derivada al área responsable para evaluación.`;
    }

    if (estado === "En proceso") {
      return `${titulo} se encuentra en atención por la municipalidad.`;
    }

    if (estado === "Solucionado") {
      return `${titulo} fue marcada como solucionada. Puedes confirmar o reabrir el caso.`;
    }

    if (estado === "Confirmado") {
      return `${titulo} fue confirmada como atendida correctamente.`;
    }

    if (estado === "Reabierto") {
      return `${titulo} fue reabierta porque el problema aún persiste.`;
    }

    return `Se registró una actualización para la incidencia ${id}.`;
  }

  function obtenerClaseNotificacion(estado) {
    if (estado === "Pendiente") {
      return "notification-pending";
    }

    if (estado === "Derivado") {
      return "notification-derived";
    }

    if (estado === "En proceso") {
      return "notification-process";
    }

    if (estado === "Solucionado" || estado === "Confirmado") {
      return "notification-solved";
    }

    if (estado === "Reabierto") {
      return "notification-reopened";
    }

    return "notification-general";
  }

  botonesDetalle.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      filaActual = e.target.closest("tr");

      const id = filaActual.querySelector(".td-id").textContent;
      const titulo = filaActual.cells[1].textContent;
      const categoria = filaActual.cells[2].textContent;
      const area = filaActual.cells[3].textContent;
      const ubicacion = filaActual.cells[4].textContent;
      const fecha = filaActual.cells[5].textContent;

      const spanEstado = filaActual.querySelector(".etiqueta-estado-tabla");
      const estadoTexto = spanEstado.textContent;
      const claseEstado = spanEstado.classList[1];

      document.getElementById("modalId").textContent = "Incidencia " + id;
      document.getElementById("modalTitulo").textContent = titulo;
      document.getElementById("modalCategoria").textContent = categoria;
      document.getElementById("modalArea").textContent = area;
      document.getElementById("modalUbicacion").textContent = ubicacion;
      document.getElementById("modalFecha").textContent = fecha;

      cargarDatosExtra(id);
      renderizarHistorial(estadoTexto, area, fecha);
      controlarConfirmacion(id, estadoTexto);
      actualizarEstadoModal(estadoTexto, claseEstado);

      modal.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    });
  });

  function cargarDatosExtra(id) {
    const info = datosExtra[id];

    if (!info) {
      document.getElementById("modalDescripcion").textContent =
        "No se registró una descripción adicional para esta incidencia.";
      document.getElementById("modalPlazo").textContent = "Por confirmar";
      return;
    }

    document.getElementById("modalDescripcion").textContent = info.desc;
    document.getElementById("modalPlazo").textContent = info.plazo;
    document.getElementById("modalImagen").src = info.foto;
  }

  function renderizarHistorial(estadoTexto, area, fecha) {
    const ulHistorial = document.getElementById("modalLineaTiempo");
    let htmlHistorial = "";

    if (estadoTexto === "Reabierto") {
      htmlHistorial += `
        <li class="evento-historial">
          <div class="marcador-tiempo reabierto"></div>
          <div class="contenido-evento">
            <time class="fecha-evento">Justo ahora</time>
            <p class="accion-evento">El ciudadano reabrió la incidencia porque el problema aún persiste.</p>
            <span class="responsable-evento">Responsable: Ciudadano</span>
          </div>
        </li>`;
    }

    if (estadoTexto === "Confirmado") {
      htmlHistorial += `
        <li class="evento-historial">
          <div class="marcador-tiempo confirmado"></div>
          <div class="contenido-evento">
            <time class="fecha-evento">Justo ahora</time>
            <p class="accion-evento">El ciudadano confirmó que la incidencia fue atendida correctamente.</p>
            <span class="responsable-evento">Responsable: Ciudadano</span>
          </div>
        </li>`;
    }

    if (
      estadoTexto === "Solucionado" ||
      estadoTexto === "Confirmado" ||
      estadoTexto === "Reabierto"
    ) {
      htmlHistorial += `
        <li class="evento-historial">
          <div class="marcador-tiempo"></div>
          <div class="contenido-evento">
            <time class="fecha-evento">Hace un momento</time>
            <p class="accion-evento">La municipalidad marcó la incidencia como <strong>Solucionada</strong>.</p>
            <span class="responsable-evento">Responsable: ${area}</span>
          </div>
        </li>`;
    }

    if (
      estadoTexto === "En proceso" ||
      estadoTexto === "Solucionado" ||
      estadoTexto === "Confirmado" ||
      estadoTexto === "Reabierto"
    ) {
      htmlHistorial += `
        <li class="evento-historial">
          <div class="marcador-tiempo"></div>
          <div class="contenido-evento">
            <time class="fecha-evento">Ayer</time>
            <p class="accion-evento">El reporte cambió a <strong>En proceso</strong>.</p>
            <span class="responsable-evento">Responsable: ${area}</span>
          </div>
        </li>`;
    }

    if (estadoTexto !== "Pendiente") {
      htmlHistorial += `
        <li class="evento-historial">
          <div class="marcador-tiempo"></div>
          <div class="contenido-evento">
            <time class="fecha-evento">Hace unos días</time>
            <p class="accion-evento">La incidencia fue <strong>derivada</strong> a ${area}.</p>
            <span class="responsable-evento">Responsable: Mesa de Partes</span>
          </div>
        </li>`;
    }

    htmlHistorial += `
      <li class="evento-historial">
        <div class="marcador-tiempo"></div>
        <div class="contenido-evento">
          <time class="fecha-evento">${fecha}</time>
          <p class="accion-evento">Incidencia <strong>registrada</strong> en el sistema de Civix.</p>
          <span class="responsable-evento">Responsable: Ciudadano</span>
        </div>
      </li>`;

    ulHistorial.innerHTML = htmlHistorial;
  }

  function controlarConfirmacion(id, estadoTexto) {
    const tarjetaConfirmacion = document.getElementById("modalConfirmacion");

    if (estadoTexto === "Solucionado") {
      tarjetaConfirmacion.removeAttribute("hidden");
      document.getElementById("inputConfirmacionId").value = id;
      return;
    }

    tarjetaConfirmacion.setAttribute("hidden", "");
  }

  function actualizarEstadoModal(estadoTexto, claseEstado) {
    const modalEstado = document.getElementById("modalEstado");

    modalEstado.textContent = estadoTexto;
    modalEstado.className = "etiqueta-estado-tabla " + claseEstado;
  }

  function cambiarEstado(nuevoTexto, nuevaClase, mensajeHistorial) {
    if (!filaActual) {
      return;
    }

    const spanEstadoTabla = filaActual.querySelector(".etiqueta-estado-tabla");
    spanEstadoTabla.textContent = nuevoTexto;
    spanEstadoTabla.className = "etiqueta-estado-tabla " + nuevaClase;

    actualizarEstadoModal(nuevoTexto, nuevaClase);

    document.getElementById("modalConfirmacion").setAttribute("hidden", "");

    const ulHistorial = document.getElementById("modalLineaTiempo");
    const nuevoEvento = document.createElement("li");

    nuevoEvento.className = "evento-historial";
    nuevoEvento.innerHTML = `
      <div class="marcador-tiempo ${nuevaClase}"></div>
      <div class="contenido-evento">
        <time class="fecha-evento">Justo ahora</time>
        <p class="accion-evento">${mensajeHistorial}</p>
        <span class="responsable-evento">Responsable: Ciudadano</span>
      </div>
    `;

    ulHistorial.insertBefore(nuevoEvento, ulHistorial.firstChild);
    renderizarNotificaciones();
  }

  btnConfirmar.addEventListener("click", (e) => {
    e.preventDefault();

    cambiarEstado(
      "Confirmado",
      "confirmado",
      "El ciudadano confirmó que la incidencia fue atendida correctamente."
    );
  });

  btnRechazar.addEventListener("click", (e) => {
    e.preventDefault();

    cambiarEstado(
      "Reabierto",
      "reabierto",
      "El ciudadano reabrió la incidencia porque el problema aún persiste."
    );
  });

  function cerrarModal() {
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  btnCerrar.addEventListener("click", cerrarModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });
});
