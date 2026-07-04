Feature: Guardar reporte como borrador

  Scenario: Creación de borrador de reporte
    Given que el ciudadano está completando un reporte
    When seleccione la opción guardar borrador
    Then el sistema deberá almacenar el progreso actual
    And permitir continuar la edición posteriormente