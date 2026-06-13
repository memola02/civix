Feature: Cambiar estado de atención

  Scenario: Registro de nuevo estado de atención
    Given que una incidencia se encuentre en gestión
    When el personal administrativo actualice su estado
    Then el sistema deberá registrar el nuevo estado
    And guardar la fecha de actualización correspondiente