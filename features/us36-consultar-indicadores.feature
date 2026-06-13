Feature: Consultar indicadores de gestión

  Scenario: Consulta de indicadores exitosa
    Given que existan datos históricos de atención de incidencias
    When el gestor consulte el panel de indicadores
    Then el sistema deberá mostrar métricas relevantes de gestión
    And actualizar automáticamente los indicadores según nueva información registrada