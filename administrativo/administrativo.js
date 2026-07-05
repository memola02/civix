document.addEventListener('DOMContentLoaded', () => {
  // 1. Estado y selección de elementos
  let hayCambiosSinGuardar = false;

  const selectEstado = document.querySelector('#modalStatus');
  const inputFecha = document.querySelector('#modalInterventionDate');
  const checkboxesAreas = document.querySelectorAll('.checkbox-group-areas input[type="checkbox"]');
  const inputEvidencia = document.querySelector('#modalEvidenceUpload');
  
  const botonGuardar = document.querySelector('#saveChangesButton');
  const botonCerrar = document.querySelector('.modal-close'); // Asegúrate que tu botón X tenga esta clase
  const modalOverlay = document.querySelector('.modal-overlay');
  
  // Elementos de vista previa
  const previewContainer = document.getElementById('previewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImageBtn');

  // 2. Funciones auxiliares
  const registrarCambio = () => {
    hayCambiosSinGuardar = true;
  };

  const cerrarModal = () => {
    modalOverlay.classList.add('hidden');
    hayCambiosSinGuardar = false;
    // Resetear formulario al cerrar
    if(inputEvidencia) inputEvidencia.value = '';
    if(previewContainer) previewContainer.classList.add('hidden');
  };

  // 3. Eventos de interacción
  if (selectEstado) selectEstado.addEventListener('change', registrarCambio);
  if (inputFecha) inputFecha.addEventListener('change', registrarCambio);
  
  checkboxesAreas.forEach(checkbox => {
    checkbox.addEventListener('change', registrarCambio);
  });

  // 4. Lógica de vista previa de imagen
  if (inputEvidencia) {
    inputEvidencia.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        registrarCambio(); // Marcamos como cambio
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewContainer.classList.remove('hidden');
          };
          reader.readAsDataURL(file);
        } else {
          // Si es PDF, ocultamos vista previa
          previewContainer.classList.add('hidden');
        }
      }
    });
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      inputEvidencia.value = '';
      imagePreview.src = '';
      previewContainer.classList.add('hidden');
      registrarCambio();
    });
  }

  // 5. Lógica de cierre (Validación de descarte)
  const intentarCerrarModal = () => {
    if (hayCambiosSinGuardar) {
      if (confirm("Tienes cambios sin guardar. ¿Deseas descartar tus selecciones?")) {
        cerrarModal();
      }
    } else {
      cerrarModal();
    }
  };

  if (botonCerrar) botonCerrar.addEventListener('click', intentarCerrarModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) intentarCerrarModal();
    });
  }

  // 6. Botón Guardar
  if (botonGuardar) {
    botonGuardar.addEventListener('click', () => {
      // Aquí ejecutarías tu lógica de envío al servidor
      alert("Cambios guardados exitosamente.");
      hayCambiosSinGuardar = false;
      cerrarModal();
    });
  }
});

function abrirModalDetalle(incidencia) {

    console.log(incidencia);

    document.getElementById('modalIncidentTitle').innerText = incidencia.titulo;

    document.getElementById("modalImage").src = incidencia.imagen;

    document.querySelector('.modal-overlay').classList.remove('hidden');
}
