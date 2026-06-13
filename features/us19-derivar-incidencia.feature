Feature: Derivar incidencia al área correspondiente

  Scenario: Derivación de incidencia
    Given que una incidencia haya sido revisada
    When el personal administrativo seleccione el área responsable
    Then el sistema deberá derivar el caso correctamente
    And registrar fecha, responsable y área asignada