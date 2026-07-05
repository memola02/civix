Feature: Validar información incompleta

  Scenario: Intento de envío de reporte incompleto
    Given que el ciudadano esté completando un reporte
    When intente enviarlo con información incompleta
    Then el sistema deberá señalar los datos faltantes
    And recomendar completar la información antes del envío