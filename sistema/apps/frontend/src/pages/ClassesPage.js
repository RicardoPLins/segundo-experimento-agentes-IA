import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, FormControl, InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { api } from "../api";
const metaKeys = ["requisitos", "testes", "backend", "frontend", "security"];
const ClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [roster, setRoster] = useState([]);
    const [evaluationRows, setEvaluationRows] = useState([]);
    const [form, setForm] = useState({ topic: "", year: 2026, semester: 1 });
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [error, setError] = useState(null);
    const rosterIds = useMemo(() => new Set(roster.map((s) => s.id)), [roster]);
    const availableStudents = useMemo(() => students.filter((student) => !rosterIds.has(student.id)), [students, rosterIds]);
    const load = async () => {
        const [classesData, studentsData] = await Promise.all([
            api.get("/classes"),
            api.get("/students")
        ]);
        setClasses(classesData);
        setStudents(studentsData);
    };
    const loadRoster = async (classId) => {
        if (!classId) {
            setRoster([]);
            setEvaluationRows([]);
            return;
        }
        const [rosterData, evaluationsData] = await Promise.all([
            api.get(`/classes/${classId}/students`),
            api.get(`/classes/${classId}/evaluations`)
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
            await api.post("/classes", form);
            setForm({ topic: "", year: 2026, semester: 1 });
            await load();
        }
        catch (err) {
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
        }
        catch (err) {
            setError(String(err));
        }
    };
    const unenroll = async (studentId) => {
        if (!selectedClassId) {
            return;
        }
        setError(null);
        try {
            await api.del(`/classes/${selectedClassId}/students/${studentId}`);
            await loadRoster(selectedClassId);
            await load();
        }
        catch (err) {
            setError(String(err));
        }
    };
    const removeClass = async (classId) => {
        setError(null);
        try {
            await api.del(`/classes/${classId}`);
            if (selectedClassId === classId) {
                setSelectedClassId("");
                setRoster([]);
            }
            await load();
        }
        catch (err) {
            setError(String(err));
        }
    };
    return (_jsxs(Box, { component: "section", sx: { display: "grid", gap: 2 }, children: [_jsx(Typography, { variant: "h4", component: "h2", children: "Classes" }), error && _jsx(Alert, { severity: "error", children: error }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Stack, { spacing: 2, sx: { maxWidth: 480 }, children: [_jsx(TextField, { label: "Topic", value: form.topic, onChange: (e) => setForm({ ...form, topic: e.target.value }) }), _jsx(TextField, { type: "number", label: "Year", value: form.year, onChange: (e) => setForm({ ...form, year: Number(e.target.value) }) }), _jsxs(FormControl, { children: [_jsx(InputLabel, { id: "semester-select-label", children: "Semester" }), _jsxs(Select, { labelId: "semester-select-label", label: "Semester", value: String(form.semester), onChange: (e) => setForm({ ...form, semester: Number(e.target.value) }), children: [_jsx(MenuItem, { value: "1", children: "1" }), _jsx(MenuItem, { value: "2", children: "2" })] })] }), _jsx(Button, { variant: "contained", onClick: submit, children: "Add Class" })] }) }), _jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", component: "h3", sx: { mb: 1 }, children: "Registered Classes" }), _jsx(List, { dense: true, children: classes.map((c) => (_jsxs(ListItem, { divider: true, children: [_jsx(ListItemText, { primary: c.topic, secondary: `${c.year}/${c.semester}` }), _jsx(ListItemSecondaryAction, { children: _jsx(Button, { color: "error", onClick: () => removeClass(c.id), children: "Remove" }) })] }, c.id))) })] }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "class-select-label", children: "Select class" }), _jsxs(Select, { labelId: "class-select-label", value: selectedClassId, label: "Select class", onChange: (e) => setSelectedClassId(String(e.target.value)), children: [_jsx(MenuItem, { value: "", children: "-- select --" }), classes.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.topic, " (", c.year, "/", c.semester, ")"] }, c.id)))] })] }), selectedClassId && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", component: "h3", sx: { mb: 1 }, children: "Enrollments" }), _jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { alignItems: "center" }, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "student-select-label", children: "Select student" }), _jsxs(Select, { labelId: "student-select-label", value: selectedStudentId, label: "Select student", onChange: (e) => setSelectedStudentId(String(e.target.value)), children: [_jsx(MenuItem, { value: "", children: "-- select student --" }), availableStudents.map((s) => (_jsx(MenuItem, { value: s.id, children: s.name }, s.id)))] })] }), _jsx(Button, { variant: "contained", onClick: enroll, disabled: !selectedStudentId || availableStudents.length === 0, children: "Enroll" })] }), _jsx(List, { dense: true, children: roster.map((student) => (_jsxs(ListItem, { divider: true, children: [_jsx(ListItemText, { primary: student.name }), _jsx(ListItemSecondaryAction, { children: _jsx(Button, { color: "error", onClick: () => unenroll(student.id), children: "Remove" }) })] }, student.id))) }), _jsx(Typography, { variant: "h6", component: "h4", sx: { mt: 3, mb: 1 }, children: "Evaluations" }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Student" }), metaKeys.map((meta) => (_jsx(TableCell, { children: meta }, meta)))] }) }), _jsx(TableBody, { children: evaluationRows.map((row) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: row.studentName }), metaKeys.map((meta) => (_jsx(TableCell, { children: row.metas[meta] === "NONE" ? "None" : row.metas[meta] }, meta)))] }, row.studentId))) })] })] }))] }) })] }));
};
export default ClassesPage;
