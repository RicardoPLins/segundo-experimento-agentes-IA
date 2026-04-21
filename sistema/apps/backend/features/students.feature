Feature: Students

  Scenario: Create a student successfully
    When I create a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com"
    Then the student is created
    And the students list includes "Ana"

  Scenario: Reject duplicate CPF
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    When I create a student named "Bruno" with cpf "111.222.333-44" and email "bruno@example.com"
    Then the request fails with status 409

  Scenario: Reject duplicate email
    Given a student named "Ana" with cpf "111.222.333-44" and email "ana@example.com" exists
    When I create a student named "Bruno" with cpf "222.333.444-55" and email "ana@example.com"
    Then the request fails with status 409

  Scenario: Reject invalid CPF format
    When I create a student named "Ana" with cpf "11122233344" and email "ana@example.com"
    Then the request fails with status 400

  Scenario: Reject invalid email format
    When I create a student named "Ana" with cpf "111.222.333-44" and email "anaexample.com"
    Then the request fails with status 400
