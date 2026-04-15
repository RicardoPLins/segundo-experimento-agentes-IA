import { useEffect, useState, type ChangeEvent } from "react";
import { api } from "../api";

interface ClassEntity {
  id: string;
  topic: string;
  year: number;
  semester: number;
}

interface EvaluationRow {
  studentId: string;
  studentName: string;
  metas: Record<string, string>;
}

const metaKeys = ["requisitos", "testes", "backend", "frontend", "security"] as const;
const statusValues = ["MANA", "MPA", "MA"] as const;

const EvaluationsPage = () => {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [rows, setRows] = useState<EvaluationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async () => {
    const data = await api.get<ClassEntity[]>("/classes");
    setClasses(data);
  };

  const loadEvaluations = async (classId: string) => {
    if (!classId) {
      setRows([]);
      return;
    }
    const data = await api.get<{ rows: EvaluationRow[] }>(`/classes/${classId}/evaluations`);
    setRows(data.rows);
  };

  useEffect(() => {
    loadClasses().catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    loadEvaluations(selectedClassId).catch((err) => setError(String(err)));
  }, [selectedClassId]);

  const update = async (studentId: string, meta: string, status: string) => {
    if (!selectedClassId) {
      return;
    }
    setError(null);
    try {
      await api.put(`/classes/${selectedClassId}/evaluations/${studentId}`, { meta, status });
      await loadEvaluations(selectedClassId);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <section>
      <h2>Evaluations</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginBottom: "16px" }}>
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Student</th>
              {metaKeys.map((meta) => (
                <th key={meta}>{meta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.studentId}>
                <td>{row.studentName}</td>
                {metaKeys.map((meta) => (
                  <td key={meta}>
                    <select
                      value={row.metas[meta]}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        update(row.studentId, meta, e.target.value)
                      }
                    >
                      {statusValues.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default EvaluationsPage;
