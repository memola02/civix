Feature: Confirmar registro del reporte

  Scenario: Confirmación de reporte exitoso
    Given que el ciudadano haya enviado un reporte correctamente
    When el sistema procese el envío
    Then deberá mostrar un mensaje de confirmación