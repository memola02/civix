Feature: Registrar ubicación de la incidencia

  Scenario: Ubicación guardada exitosamente
    Given que el ciudadano está completando un reporte
    When indique la ubicación de la incidencia
    Then el sistema deberá guardar la ubicación asociada al reporte
    And mostrar el punto seleccionado en un mapa