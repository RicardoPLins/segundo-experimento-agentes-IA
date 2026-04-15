import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

interface EvaluationRow {
  studentId: string;
  studentName: string;
  metas: Record<string, string>;
}

const metaKeys = ["requisitos", "testes", "backend", "frontend", "security"] as const;

const ClassesPage = () => {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [roster, setRoster] = useState<Student[]>([]);
  const [evaluationRows, setEvaluationRows] = useState<EvaluationRow[]>([]);
  const [form, setForm] = useState({ topic: "", year: 2026, semester: 1 });
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const rosterIds = useMemo(() => new Set(roster.map((s) => s.id)), [roster]);
  const availableStudents = useMemo(
    () => students.filter((student) => !rosterIds.has(student.id)),
    [students, rosterIds]
  );

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
      setEvaluationRows([]);
      return;
    }
    const [rosterData, evaluationsData] = await Promise.all([
      api.get<Student[]>(`/classes/${classId}/students`),
      api.get<{ rows: EvaluationRow[] }>(`/classes/${classId}/evaluations`)
    ]);
    setRoster(rosterData);
    setEvaluationRows(evaluationsData.rows);
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

  const unenroll = async (studentId: string) => {
    if (!selectedClassId) {
      return;
    }
    setError(null);
    try {
      await api.del(`/classes/${selectedClassId}/students/${studentId}`);
      await loadRoster(selectedClassId);
      await load();
    } catch (err) {
      setError(String(err));
    }
  };

  const removeClass = async (classId: string) => {
    setError(null);
    try {
      await api.del(`/classes/${classId}`);
      if (selectedClassId === classId) {
        setSelectedClassId("");
        setRoster([]);
      }
      await load();
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
          <FormControl>
            <InputLabel id="semester-select-label">Semester</InputLabel>
            <Select
              labelId="semester-select-label"
              label="Semester"
              value={String(form.semester)}
              onChange={(e: SelectChangeEvent) =>
                setForm({ ...form, semester: Number(e.target.value) })
              }
            >
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={submit}>
            Add Class
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          Registered Classes
        </Typography>
        <List dense>
          {classes.map((c) => (
            <ListItem key={c.id} divider>
              <ListItemText primary={c.topic} secondary={`${c.year}/${c.semester}`} />
              <ListItemSecondaryAction>
                <Button color="error" onClick={() => removeClass(c.id)}>
                  Remove
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
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
                    {availableStudents.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={enroll}
                  disabled={!selectedStudentId || availableStudents.length === 0}
                >
                  Enroll
                </Button>
              </Stack>

              <List dense>
                {roster.map((student) => (
                  <ListItem key={student.id} divider>
                    <ListItemText primary={student.name} />
                    <ListItemSecondaryAction>
                      <Button color="error" onClick={() => unenroll(student.id)}>
                        Remove
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" component="h4" sx={{ mt: 3, mb: 1 }}>
                Evaluations
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    {metaKeys.map((meta) => (
                      <TableCell key={meta}>{meta}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluationRows.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell>{row.studentName}</TableCell>
                      {metaKeys.map((meta) => (
                        <TableCell key={meta}>
                          {row.metas[meta] === "NONE" ? "None" : row.metas[meta]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ClassesPage;
