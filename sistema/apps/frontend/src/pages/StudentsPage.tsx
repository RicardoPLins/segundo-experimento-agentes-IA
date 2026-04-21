import { useEffect, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
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

interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11)
  ];
  if (digits.length <= 3) return parts[0];
  if (digits.length <= 6) return `${parts[0]}.${parts[1]}`;
  if (digits.length <= 9) return `${parts[0]}.${parts[1]}.${parts[2]}`;
  return `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`;
};

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ name: "", cpf: "", email: "" });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const data = await api.get<Student[]>("/students");
    setStudents(data);
  };

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const submit = async () => {
    setError(null);
    try {
      await api.post<Student>("/students", form);
      setForm({ name: "", cpf: "", email: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.del(`/students/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Box component="section" sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h4" component="h2">
        Students
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <TextField
            label="CPF"
            value={form.cpf}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, cpf: formatCpf(e.target.value) })
            }
            placeholder="000.000.000-00"
            helperText="Format: 000.000.000-00"
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, email: e.target.value })
            }
          />
          <Button variant="contained" onClick={submit}>
            Add Student
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.cpf}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell align="right">
                  <Button color="error" onClick={() => remove(student.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default StudentsPage;
