import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, Stack, Typography } from "@mui/material";
import { api } from "../api";
const metaKeys = ["requisitos", "testes", "backend", "frontend", "security"];
const statusValues = ["MANA", "MPA", "MA"];
const EvaluationsPage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [digestInfo, setDigestInfo] = useState(null);
    const isRowComplete = (row) => metaKeys.every((meta) => row.metas[meta] && row.metas[meta] !== "NONE");
    const loadClasses = async () => {
        const data = await api.get("/classes");
        setClasses(data);
    };
    const loadEvaluations = async (classId) => {
        if (!classId) {
            setRows([]);
            return;
        }
        const data = await api.get(`/classes/${classId}/evaluations`);
        setRows(data.rows);
    };
    useEffect(() => {
        loadClasses().catch((err) => setError(err instanceof Error ? err.message : String(err)));
    }, []);
    useEffect(() => {
        loadEvaluations(selectedClassId).catch((err) => setError(err instanceof Error ? err.message : String(err)));
    }, [selectedClassId]);
    const update = async (studentId, meta, status) => {
        if (!selectedClassId) {
            return;
        }
        setError(null);
        setDigestInfo(null);
        try {
            await api.put(`/classes/${selectedClassId}/evaluations/${studentId}`, { meta, status });
            await loadEvaluations(selectedClassId);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    const sendStudentDigest = async (studentId, studentEmail) => {
        if (!selectedClassId) {
            return;
        }
        setError(null);
        setDigestInfo(null);
        try {
            const result = await api.post("/jobs/send-student-digest", { studentId, classId: selectedClassId });
            const sentTo = result.sent.map((item) => item.to).join(", ");
            setDigestInfo(`Sent ${result.sent.length} email(s) to ${sentTo || studentEmail}. Skipped: ${result.skipped}.`);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    return (_jsxs(Box, { component: "section", sx: { display: "grid", gap: 2 }, children: [_jsx(Typography, { variant: "h4", component: "h2", children: "Evaluations" }), error && _jsx(Alert, { severity: "error", children: error }), digestInfo && _jsx(Alert, { severity: "success", children: digestInfo }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Stack, { spacing: 2, direction: { xs: "column", sm: "row" }, sx: { alignItems: "center" }, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "class-select-label", children: "Select class" }), _jsxs(Select, { labelId: "class-select-label", value: selectedClassId, label: "Select class", onChange: (e) => setSelectedClassId(String(e.target.value)), children: [_jsx(MenuItem, { value: "", children: "-- select --" }), classes.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.topic, " (", c.year, "/", c.semester, ")"] }, c.id)))] })] })] }) }), selectedClassId && (_jsx(Paper, { sx: { p: 2 }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Student" }), _jsx(TableCell, { children: "Email" }), metaKeys.map((meta) => (_jsx(TableCell, { children: meta }, meta))), _jsx(TableCell, { align: "right", children: "Send" })] }) }), _jsx(TableBody, { children: rows.map((row) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: row.studentName }), _jsx(TableCell, { children: row.studentEmail }), metaKeys.map((meta) => (_jsx(TableCell, { children: _jsx(FormControl, { size: "small", fullWidth: true, children: _jsxs(Select, { value: row.metas[meta], onChange: (e) => update(row.studentId, meta, String(e.target.value)), children: [_jsx(MenuItem, { value: "NONE", disabled: true, children: "None" }), statusValues.map((status) => (_jsx(MenuItem, { value: status, children: status }, status)))] }) }) }, meta))), _jsx(TableCell, { align: "right", children: _jsx(Button, { variant: "outlined", onClick: () => sendStudentDigest(row.studentId, row.studentEmail), disabled: !isRowComplete(row), children: "Send" }) })] }, row.studentId))) })] }) })), _jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", component: "h3", sx: { mb: 1 }, children: "Legend" }), _jsx(Typography, { variant: "body2", children: "NONE: Sem avalia\u00E7\u00E3o \u00B7 MANA: Meta Ainda N\u00E3o Atingida \u00B7 MPA: Meta Parcialmente Atingida \u00B7 MA: Meta Atingida" })] })] }));
};
export default EvaluationsPage;
