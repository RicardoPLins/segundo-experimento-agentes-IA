Feature: Email digest

  Scenario: Multiple changes in one day produce one email
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    And a class with topic "Introdução à Programação" year 2026 semester 1 exists
    And "Ana" is enrolled in "Introdução à Programação"
    When I set meta "backend" to "MA" for "Ana" in "Introdução à Programação"
    And I set meta "frontend" to "MPA" for "Ana" in "Introdução à Programação"
    And I run the daily digest job
    Then one digest email is sent to "ana@example.com"
    And the digest includes "backend" and "frontend"
