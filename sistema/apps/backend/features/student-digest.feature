Feature: Student digest email

  Scenario: Reject sending when evaluations are incomplete
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    And a class with topic "Introdução à Programação" year 2026 semester 1 exists
    And "Ana" is enrolled in "Introdução à Programação"
    When I set meta "backend" to "MA" for "Ana" in "Introdução à Programação"
    And I request the student digest for "Ana" in "Introdução à Programação"
    Then the request fails with status 400
