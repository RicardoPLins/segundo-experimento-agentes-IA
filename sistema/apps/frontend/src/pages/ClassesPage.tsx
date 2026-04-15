import { useEffect, useState, type ChangeEvent } from "react";
import { api } from "../api";

interface ClassEntity {
  id: string;
  topic: string;
  year: number;
  semester: number;
}

interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

const ClassesPage = () => {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [roster, setRoster] = useState<Student[]>([]);
  const [form, setForm] = useState({ topic: "", year: 2026, semester: 1 });
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [classesData, studentsData] = await Promise.all([
      api.get<ClassEntity[]>("/classes"),
      api.get<Student[]>("/students")
    ]);
    setClasses(classesData);
    setStudents(studentsData);
  };

  const loadRoster = async (classId: string) => {
    if (!classId) {
      setRoster([]);
      return;
    }
    const data = await api.get<Student[]>(`/classes/${classId}/students`);
    setRoster(data);
  };

  useEffect(() => {
    load().catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    loadRoster(selectedClassId).catch((err) => setError(String(err)));
  }, [selectedClassId]);

  const submit = async () => {
    setError(null);
    try {
      await api.post<ClassEntity>("/classes", form);
      setForm({ topic: "", year: 2026, semester: 1 });
      await load();
    } catch (err) {
      setError(String(err));
    }
  };

  const enroll = async () => {
    if (!selectedClassId || !selectedStudentId) {
      return;
    }
    setError(null);
    try {
      await api.post(`/classes/${selectedClassId}/students/${selectedStudentId}`, {});
      await loadRoster(selectedClassId);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <section>
      <h2>Classes</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "grid", gap: "8px", maxWidth: "400px" }}>
        <input
          placeholder="Topic"
          value={form.topic}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, topic: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, year: Number(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Semester"
          value={form.semester}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, semester: Number(e.target.value) })
          }
        />
        <button onClick={submit}>Add Class</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>
          Select class:
          <select
            value={selectedClassId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSelectedClassId(e.target.value)
            }
          >
            <option value="">-- select --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.topic} ({c.year}/{c.semester})
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedClassId && (
        <div style={{ marginTop: "20px" }}>
          <h3>Enrollments</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={selectedStudentId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setSelectedStudentId(e.target.value)
              }
            >
              <option value="">-- select student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button onClick={enroll}>Enroll</button>
          </div>
          <ul>
            {roster.map((student) => (
              <li key={student.id}>{student.name}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ClassesPage;
