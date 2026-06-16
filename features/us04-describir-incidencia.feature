Feature: Describir la incidencia

  Scenario: Registro de descripción de incidencia
    Given que el ciudadano está registrando una incidencia
    When ingrese una descripción del problema
    Then el sistema deberá almacenar la descripción
    And validar que se haya ingresado información mínima requerida