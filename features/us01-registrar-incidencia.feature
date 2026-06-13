Feature: Registrar incidencia

  Scenario: Registro exitoso de incidencia
    Given que el ciudadano se encuentra en la pantalla de registro de incidencias
    When complete la información requerida y envíe el reporte
    Then el sistema deberá registrar la incidencia correctamente