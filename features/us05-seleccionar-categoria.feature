Feature: Seleccionar categoría de incidencia

  Scenario: Categorización de incidencia manual
    Given que el ciudadano está enviando un reporte
    When seleccione una categoría de incidencia
    Then el sistema deberá clasificar el reporte bajo dicha categoría