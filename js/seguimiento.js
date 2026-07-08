document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalDetalle');
  const btnCerrar = document.getElementById('btnCerrarModal');
  const botonesDetalle = document.querySelectorAll('.boton-detalle');


  // Variables para controlar la fila seleccionada y los botones de acción
  let filaActual = null; 
  const btnConfirmar = document.querySelector('.boton-primario.confirmar');
  const btnRechazar = document.querySelector('.boton-secundario.rechazar');


  // Datos extra simulados
  const datosExtra = {
    "#INC-005": { desc: "Poste apagado generando total oscuridad e inseguridad.", plazo: "15/06/2026" },
    "#INC-004": { desc: "Acumulación de basura en la esquina del parque. Atrae insectos.", plazo: "13/06/2026" },
    "#INC-003": { desc: "Bache profundo en la vía principal. Dificulta el tránsito vehicular.", plazo: "20/06/2026" },
    "#INC-001": { desc: "Semáforo intermitente causando congestión y riesgo de accidentes.", plazo: "Solucionado el 12/06/2026" }
  };


  botonesDetalle.forEach(boton => {
    boton.addEventListener('click', (e) => {
      filaActual = e.target.closest('tr');
      
      const id = filaActual.querySelector('.td-id').textContent;
      const titulo = filaActual.cells[1].textContent;
      const categoria = filaActual.cells[2].textContent;
      const area = filaActual.cells[3].textContent;
      const ubicacion = filaActual.cells[4].textContent;
      const fecha = filaActual.cells[5].textContent;
      
      const spanEstado = filaActual.querySelector('.etiqueta-estado-tabla');
      const estadoTexto = spanEstado.textContent;
      const claseEstado = spanEstado.classList[1]; 


      document.getElementById('modalId').textContent = "Incidencia " + id;
      document.getElementById('modalTitulo').textContent = titulo;
      document.getElementById('modalCategoria').textContent = categoria;
      document.getElementById('modalArea').textContent = area;
      document.getElementById('modalUbicacion').textContent = ubicacion;
      document.getElementById('modalFecha').textContent = fecha;
      
      if(datosExtra[id]) {
        document.getElementById('modalDescripcion').textContent = datosExtra[id].desc;
        document.getElementById('modalPlazo').textContent = datosExtra[id].plazo;
      }


      const ulHistorial = document.getElementById('modalLineaTiempo');
      let htmlHistorial = '';
      
      if(estadoTexto === "Solucionado") {
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
      
      if(estadoTexto === "En proceso" || estadoTexto === "Solucionado") {
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
      
      if(estadoTexto !== "Pendiente") {
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


      const tarjetaConfirmacion = document.getElementById('modalConfirmacion');
      if(estadoTexto === "Solucionado") {
        tarjetaConfirmacion.removeAttribute('hidden');
        document.getElementById('inputConfirmacionId').value = id;
      } else {
        tarjetaConfirmacion.setAttribute('hidden', '');
      }


      const modalEstado = document.getElementById('modalEstado');
      modalEstado.textContent = estadoTexto;
      modalEstado.className = "etiqueta-estado-tabla " + claseEstado;


      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    });
  });


  // --- LÓGICA DE CONFIRMACIÓN / RECHAZO ---
  function cambiarEstado(nuevoTexto, nuevaClase) {
    if(!filaActual) return;
    
    // 1. Actualiza el estado en la tabla que está detrás del modal
    const spanEstadoTabla = filaActual.querySelector('.etiqueta-estado-tabla');
    spanEstadoTabla.textContent = nuevoTexto;
    spanEstadoTabla.className = "etiqueta-estado-tabla " + nuevaClase;
    
    // 2. Actualiza el estado en el pie de la ventana modal
    const modalEstado = document.getElementById('modalEstado');
    modalEstado.textContent = nuevoTexto;
    modalEstado.className = "etiqueta-estado-tabla " + nuevaClase;
    
    // 3. Oculta la tarjeta de confirmación
    document.getElementById('modalConfirmacion').setAttribute('hidden', '');
    
    // 4. Inyecta la acción del usuario en el historial visual
    const ulHistorial = document.getElementById('modalLineaTiempo');
    const nuevoEvento = document.createElement('li');
    nuevoEvento.className = "evento-historial";
    nuevoEvento.innerHTML = `
        <div class="marcador-tiempo"></div>
        <div class="contenido-evento">
          <time class="fecha-evento">Justo ahora</time>
          <p class="accion-evento">El ciudadano marcó el reporte como <strong>${nuevoTexto}</strong>.</p>
          <span class="responsable-evento">Responsable: Ciudadano</span>
        </div>
    `;
    ulHistorial.insertBefore(nuevoEvento, ulHistorial.firstChild);
  }


  // Interceptamos los clics en los botones para que no recarguen la página
  btnConfirmar.addEventListener('click', (e) => {
    e.preventDefault(); 
    cambiarEstado('Confirmado', 'confirmado');
  });


  btnRechazar.addEventListener('click', (e) => {
    e.preventDefault(); 
    cambiarEstado('Derivado', 'derivado');
  });


  // Cerrar Modal
  function cerrarModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }


  btnCerrar.addEventListener('click', cerrarModal);
  modal.addEventListener('click', (e) => {
    if(e.target === modal) cerrarModal();
  });
});
