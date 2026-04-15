Feature: Classes

  Scenario: Create a class successfully
    When I create a class with topic "Introdução à Programação" year 2026 semester 1
    Then the class is created

  Scenario: Enroll a student in a class
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    And a class with topic "Introdução à Programação" year 2026 semester 1 exists
    When I enroll "Ana" into "Introdução à Programação"
    Then the class roster for "Introdução à Programação" includes "Ana"
