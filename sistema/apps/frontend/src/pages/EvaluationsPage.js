import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Alert, Box, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { api } from "../api";
const metaKeys = ["requisitos", "testes", "backend", "frontend", "security"];
const statusValues = ["MANA", "MPA", "MA"];
const EvaluationsPage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
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
        loadClasses().catch((err) => setError(String(err)));
    }, []);
    useEffect(() => {
        loadEvaluations(selectedClassId).catch((err) => setError(String(err)));
    }, [selectedClassId]);
    const update = async (studentId, meta, status) => {
        if (!selectedClassId) {
            return;
        }
        setError(null);
        try {
            await api.put(`/classes/${selectedClassId}/evaluations/${studentId}`, { meta, status });
            await loadEvaluations(selectedClassId);
        }
        catch (err) {
            setError(String(err));
        }
    };
    return (_jsxs(Box, { component: "section", sx: { display: "grid", gap: 2 }, children: [_jsx(Typography, { variant: "h4", component: "h2", children: "Evaluations" }), error && _jsx(Alert, { severity: "error", children: error }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "class-select-label", children: "Select class" }), _jsxs(Select, { labelId: "class-select-label", value: selectedClassId, label: "Select class", onChange: (e) => setSelectedClassId(String(e.target.value)), children: [_jsx(MenuItem, { value: "", children: "-- select --" }), classes.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.topic, " (", c.year, "/", c.semester, ")"] }, c.id)))] })] }) }), selectedClassId && (_jsx(Paper, { sx: { p: 2 }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Student" }), metaKeys.map((meta) => (_jsx(TableCell, { children: meta }, meta)))] }) }), _jsx(TableBody, { children: rows.map((row) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: row.studentName }), metaKeys.map((meta) => (_jsx(TableCell, { children: _jsx(FormControl, { size: "small", fullWidth: true, children: _jsx(Select, { value: row.metas[meta], onChange: (e) => update(row.studentId, meta, String(e.target.value)), children: statusValues.map((status) => (_jsx(MenuItem, { value: status, children: status }, status))) }) }) }, meta)))] }, row.studentId))) })] }) }))] }));
};
export default EvaluationsPage;
