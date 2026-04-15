import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography
} from "@mui/material";
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
const statusValues = ["NONE", "MPA", "MA"] as const;

const EvaluationsPage = () => {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [rows, setRows] = useState<EvaluationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [digestInfo, setDigestInfo] = useState<string | null>(null);

  const allEvaluated =
    rows.length > 0 &&
    rows.every((row) =>
      metaKeys.every((meta) => row.metas[meta] && row.metas[meta] !== "NONE")
    );

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
    setDigestInfo(null);
    try {
      await api.put(`/classes/${selectedClassId}/evaluations/${studentId}`, { meta, status });
      await loadEvaluations(selectedClassId);
    } catch (err) {
      setError(String(err));
    }
  };

  const sendDigest = async () => {
    setError(null);
    setDigestInfo(null);
    try {
      const result = await api.post<{ sent: Array<{ to: string }>; skipped: number }>(
        "/jobs/send-daily-digests",
        {}
      );
      setDigestInfo(
        `Sent ${result.sent.length} email(s). Skipped: ${result.skipped}.`
      );
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <Box component="section" sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h4" component="h2">
        Evaluations
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {digestInfo && <Alert severity="success">{digestInfo}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack
          spacing={2}
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: "center" }}
        >
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
          <Button variant="contained" onClick={sendDigest} disabled={!allEvaluated}>
            Send Daily Digest
          </Button>
        </Stack>
      </Paper>

      {selectedClassId && (
        <Paper sx={{ p: 2 }}>
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
              {rows.map((row) => (
                <TableRow key={row.studentId}>
                  <TableCell>{row.studentName}</TableCell>
                  {metaKeys.map((meta) => (
                    <TableCell key={meta}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={row.metas[meta]}
                          onChange={(e: SelectChangeEvent) =>
                            update(row.studentId, meta, String(e.target.value))
                          }
                        >
                          {statusValues.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status === "NONE" ? "None" : status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default EvaluationsPage;
