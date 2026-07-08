document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalDetalle');
  const btnCerrar = document.getElementById('btnCerrarModal');
  const botonesDetalle = document.querySelectorAll('.boton-detalle');


  // Datos extra simulados
  const datosExtra = {
    "#INC-005": { desc: "Poste apagado generando total oscuridad e inseguridad.", plazo: "15/06/2026" },
    "#INC-004": { desc: "Acumulación de basura en la esquina del parque. Atrae insectos.", plazo: "13/06/2026" },
    "#INC-003": { desc: "Bache profundo en la vía principal. Dificulta el tránsito vehicular.", plazo: "20/06/2026" },
    "#INC-001": { desc: "Semáforo intermitente causando congestión y riesgo de accidentes.", plazo: "Solucionado el 12/06/2026" }
  };


  botonesDetalle.forEach(boton => {
    boton.addEventListener('click', (e) => {
      const fila = e.target.closest('tr');
      
      // Extraer datos de la fila
      const id = fila.querySelector('.td-id').textContent;
      const titulo = fila.cells[1].textContent;
      const categoria = fila.cells[2].textContent;
      const area = fila.cells[3].textContent;
      const ubicacion = fila.cells[4].textContent;
      const fecha = fila.cells[5].textContent;
      
      const spanEstado = fila.querySelector('.etiqueta-estado-tabla');
      const estadoTexto = spanEstado.textContent;
      const claseEstado = spanEstado.classList[1]; 


      // Inyectar info básica
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


      // 1. Construir el Historial Dinámico
      const ulHistorial = document.getElementById('modalLineaTiempo');
      let htmlHistorial = '';
      
      // Si está solucionado
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
      
      // Si está en proceso o solucionado
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
      
      // Si está derivado o más avanzado
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


      // Todas tienen el evento base de registro
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


      // 2. Controlar la caja de Confirmación de Resolución (US27)
      const tarjetaConfirmacion = document.getElementById('modalConfirmacion');
      if(estadoTexto === "Solucionado") {
        tarjetaConfirmacion.removeAttribute('hidden');
        document.getElementById('inputConfirmacionId').value = id;
      } else {
        tarjetaConfirmacion.setAttribute('hidden', '');
      }


      // Actualizar pie del modal
      const modalEstado = document.getElementById('modalEstado');
      modalEstado.textContent = estadoTexto;
      modalEstado.className = "etiqueta-estado-tabla " + claseEstado;


      // Mostrar modal
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    });
  });


  // Cerrar Modal
  function cerrarModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }


  btnCerrar.addEventListener('click', cerrarModal);
  
  modal.addEventListener('click', (e) => {
    if(e.target === modal) {
      cerrarModal();
    }
  });
});
