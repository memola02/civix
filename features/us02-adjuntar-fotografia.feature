Feature: Adjuntar fotografía como evidencia

  Scenario: Carga exitosa de fotografías
    Given que el ciudadano está creando un reporte
    When adjunte una o más fotografías
    Then el sistema deberá asociar las imágenes al reporte
    And mostrar una vista previa de los archivos cargados