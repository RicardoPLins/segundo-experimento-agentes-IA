Feature: Evaluations

  Scenario: Update backend meta
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    And a class with topic "Introdução à Programação" year 2026 semester 1 exists
    And "Ana" is enrolled in "Introdução à Programação"
    When I set meta "backend" to "MA" for "Ana" in "Introdução à Programação"
    Then the evaluations table for "Introdução à Programação" shows "Ana" has "backend" = "MA"

  Scenario: Reject invalid meta
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    And a class with topic "Introdução à Programação" year 2026 semester 1 exists
    And "Ana" is enrolled in "Introdução à Programação"
    When I set meta "invalid-meta" to "MA" for "Ana" in "Introdução à Programação"
    Then the request fails with status 400

  Scenario: Reject invalid status
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    And a class with topic "Introdução à Programação" year 2026 semester 1 exists
    And "Ana" is enrolled in "Introdução à Programação"
    When I set meta "backend" to "INVALID" for "Ana" in "Introdução à Programação"
    Then the request fails with status 400

  Scenario: Reject evaluation for non-enrolled student
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    And a class with topic "Introdução à Programação" year 2026 semester 1 exists
    When I set meta "backend" to "MA" for "Ana" in "Introdução à Programação"
    Then the request fails with status 409
