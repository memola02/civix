Feature: Visualizar mapa geográfico de incidencias

  Scenario: Visualización de mapa exitosa
    Given que existan incidencias registradas en el sistema
    When el gestor municipal acceda al panel de análisis territorial
    Then el sistema deberá mostrar las incidencias ubicadas en un mapa interactivo
    And diferenciar visualmente categorías y niveles de prioridad