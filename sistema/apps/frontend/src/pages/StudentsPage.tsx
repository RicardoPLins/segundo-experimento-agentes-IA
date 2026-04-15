import { useEffect, useState, type ChangeEvent } from "react";
import { api } from "../api";

interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ name: "", cpf: "", email: "" });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const data = await api.get<Student[]>("/students");
    setStudents(data);
  };

  useEffect(() => {
    load().catch((err) => setError(String(err)));
  }, []);

  const submit = async () => {
    setError(null);
    try {
      await api.post<Student>("/students", form);
      setForm({ name: "", cpf: "", email: "" });
      await load();
    } catch (err) {
      setError(String(err));
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.del(`/students/${id}`);
      await load();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <section>
      <h2>Students</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "grid", gap: "8px", maxWidth: "400px" }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, name: e.target.value })
          }
        />
        <input
          placeholder="CPF"
          value={form.cpf}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, cpf: e.target.value })
          }
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        <button onClick={submit}>Add Student</button>
      </div>

      <table style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.cpf}</td>
              <td>{student.email}</td>
              <td>
                <button onClick={() => remove(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default StudentsPage;
