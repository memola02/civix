Feature: Filtrar análisis estratégico

  Scenario: Filtrado de información exitoso
    Given que el gestor municipal se encuentre en el mapa interactivo de análisis territorial
    When aplique filtros de consulta
    Then el sistema deberá actualizar la visualización según los filtros seleccionados
    And mostrar únicamente la información correspondiente