document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalDetalle');
  const btnCerrar = document.getElementById('btnCerrarModal');
  const botonesDetalle = document.querySelectorAll('.boton-detalle');


  // Datos extras simulados que no aparecen en la tabla
  const datosExtra = {
    "#INC-005": { desc: "Poste de alumbrado público apagado durante varias noches, generando total oscuridad e inseguridad para los vecinos de la cuadra 12.", plazo: "15/06/2026" },
    "#INC-004": { desc: "Acumulación severa de basura en la esquina del parque debido a que el camión recolector no pasó los últimos 3 días. Atrae insectos.", plazo: "13/06/2026" },
    "#INC-003": { desc: "Bache muy profundo en el carril derecho de la vía principal. Dificulta el tránsito y ha dañado la llanta de varios vehículos.", plazo: "20/06/2026" },
    "#INC-001": { desc: "Semáforo intermitente en cruce altamente peligroso. Está causando congestión vehicular y riesgo inminente de accidentes.", plazo: "Solucionado el 12/06/2026" }
  };


  // Abrir Modal
  botonesDetalle.forEach(boton => {
    boton.addEventListener('click', (e) => {
      // Obtener la fila correspondiente
      const fila = e.target.closest('tr');
      
      // Extraer datos de la tabla
      const id = fila.querySelector('.td-id').textContent;
      const titulo = fila.cells[1].textContent;
      const categoria = fila.cells[2].textContent;
      const area = fila.cells[3].textContent;
      const ubicacion = fila.cells[4].textContent;
      const fecha = fila.cells[5].textContent;
      
      const spanEstado = fila.querySelector('.etiqueta-estado-tabla');
      const estadoTexto = spanEstado.textContent;
      const claseEstado = spanEstado.classList[1]; 


      // Inyectar en el Modal
      document.getElementById('modalId').textContent = "Incidencia " + id;
      document.getElementById('modalTitulo').textContent = titulo;
      document.getElementById('modalCategoria').textContent = categoria;
      document.getElementById('modalArea').textContent = area;
      document.getElementById('modalUbicacion').textContent = ubicacion;
      document.getElementById('modalFecha').textContent = fecha;
      
      // Inyectar los datos extras (simulados)
      if(datosExtra[id]) {
        document.getElementById('modalDescripcion').textContent = datosExtra[id].desc;
        document.getElementById('modalPlazo').textContent = datosExtra[id].plazo;
      }


      // Actualizar etiqueta de estado
      const modalEstado = document.getElementById('modalEstado');
      modalEstado.textContent = estadoTexto;
      modalEstado.className = "etiqueta-estado-tabla " + claseEstado;


      // Mostrar modal
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
    });
  });


  // Cerrar Modal
  function cerrarModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = ''; // Devuelve el scroll
  }


  btnCerrar.addEventListener('click', cerrarModal);
  
  modal.addEventListener('click', (e) => {
    if(e.target === modal) {
      cerrarModal();
    }
  });
});
