import { useEffect, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography
} from "@mui/material";
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
    <Box component="section" sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h4" component="h2">
        Classes
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <TextField
            label="Topic"
            value={form.topic}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, topic: e.target.value })
            }
          />
          <TextField
            type="number"
            label="Year"
            value={form.year}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, year: Number(e.target.value) })
            }
          />
          <TextField
            type="number"
            label="Semester"
            value={form.semester}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, semester: Number(e.target.value) })
            }
          />
          <Button variant="contained" onClick={submit}>
            Add Class
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="class-select-label">Select class</InputLabel>
            <Select
              labelId="class-select-label"
              value={selectedClassId}
              label="Select class"
              onChange={(e: SelectChangeEvent) => setSelectedClassId(String(e.target.value))}
            >
              <MenuItem value="">-- select --</MenuItem>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.topic} ({c.year}/{c.semester})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedClassId && (
            <Box>
              <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                Enrollments
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <FormControl fullWidth>
                  <InputLabel id="student-select-label">Select student</InputLabel>
                  <Select
                    labelId="student-select-label"
                    value={selectedStudentId}
                    label="Select student"
                    onChange={(e: SelectChangeEvent) =>
                      setSelectedStudentId(String(e.target.value))
                    }
                  >
                    <MenuItem value="">-- select student --</MenuItem>
                    {students.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={enroll}>
                  Enroll
                </Button>
              </Stack>

              <List dense>
                {roster.map((student) => (
                  <ListItem key={student.id}>{student.name}</ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ClassesPage;
