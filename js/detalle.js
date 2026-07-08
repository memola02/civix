const baseDeDatosIncidencias = {
    "INC-005": {
        categoria: "Alumbrado público",
        descripcion: "Poste apagado en Av. Arequipa que genera inseguridad por las noches.",
        estado: "Pendiente",
        claseEstado: "borrador" // Usamos el color gris o claro para pendiente
    },
    "INC-004": {
        categoria: "Acumulación de residuos",
        descripcion: "Acumulación de basura en la esquina del Parque Kennedy que atrae insectos.",
        estado: "Derivado",
        claseEstado: "registrada" // Usamos el azul claro
    },
    "INC-003": {
        categoria: "Baches y hundimientos",
        descripcion: "Bache profundo en la vía principal que dificulta el tránsito vehicular.",
        estado: "En proceso",
        claseEstado: "en-proceso" // Usamos el azul oscuro
    },
    "INC-001": {
        categoria: "Alumbrado público",
        descripcion: "Semáforo intermitente en cruce peligroso causando congestión.",
        estado: "Solucionado",
        claseEstado: "solucionado" // Usamos el turquesa
    }
};


const parametrosURL = new URLSearchParams(window.location.search);
const idReporte = parametrosURL.get('id');


if (idReporte && baseDeDatosIncidencias[idReporte]) {
    
    const datos = baseDeDatosIncidencias[idReporte];


    document.getElementById('hero-id-reporte').textContent = "Seguimiento de reporte #" + idReporte;
    
    document.getElementById('texto-categoria').textContent = datos.categoria;
    document.getElementById('texto-descripcion').textContent = datos.descripcion;
    
    document.getElementById('texto-estado').textContent = datos.estado;
    
    const contenedorEstado = document.getElementById('contenedor-estado');
    contenedorEstado.className = "indicador-estado " + datos.claseEstado;
    
    const tarjetaConfirmacion = document.querySelector('.tarjeta-confirmacion-resolucion');
    if(datos.estado !== "Solucionado") {
        tarjetaConfirmacion.style.display = 'none'; 
    }
}
