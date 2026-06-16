Feature: Revisar incidencias registradas

  Scenario: Revisión de incidencias exitosa
    Given que el personal administrativo accede al módulo de gestión de incidencias
    When ingrese a la bandeja principal
    Then el sistema deberá mostrar el listado de incidencias registradas
    And presentar información clave como categoría, ubicación, fecha y estado