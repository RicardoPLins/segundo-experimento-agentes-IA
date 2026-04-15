# Requirements — Web Scholar - Students and students evaluations Management 

## 1) Features
- Student management (CRUD) with a specific page of students list. each student must have be (name, CPF and email)
- In another page, Students evaluation management, shows a table with the students name in the first collum, and for each student your respective evaluation em differents metas (Requisitos, testes, backend, frontend, security). Each meta in a different collum. The types of evaluations are three (3): (MANA, MPA, MA) are Meta Ainda Não Atingida, Meta Parcialmente Atingida e Meta atingida.
- Persist (with JSON) the students register, and the evaluations of metas register
- Classes Management (CRUD) with topic description (Ex: Introdução à Programação), year, semester, the students matriculate in the class, and info about the students evaluations in this class. Must be possible view each class with the students and students evaluations separated.
- Send a email for each student when the teacher fill or modify the student evaluation for any meta. Just one email per day with all the modify students evaluations, in the each class of that student.