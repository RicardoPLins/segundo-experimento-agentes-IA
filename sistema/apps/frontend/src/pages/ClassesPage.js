import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Alert, Box, Button, FormControl, InputLabel, List, ListItem, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { api } from "../api";
const ClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [roster, setRoster] = useState([]);
    const [form, setForm] = useState({ topic: "", year: 2026, semester: 1 });
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [error, setError] = useState(null);
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
            return;
        }
        const data = await api.get(`/classes/${classId}/students`);
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
    return (_jsxs(Box, { component: "section", sx: { display: "grid", gap: 2 }, children: [_jsx(Typography, { variant: "h4", component: "h2", children: "Classes" }), error && _jsx(Alert, { severity: "error", children: error }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Stack, { spacing: 2, sx: { maxWidth: 480 }, children: [_jsx(TextField, { label: "Topic", value: form.topic, onChange: (e) => setForm({ ...form, topic: e.target.value }) }), _jsx(TextField, { type: "number", label: "Year", value: form.year, onChange: (e) => setForm({ ...form, year: Number(e.target.value) }) }), _jsx(TextField, { type: "number", label: "Semester", value: form.semester, onChange: (e) => setForm({ ...form, semester: Number(e.target.value) }) }), _jsx(Button, { variant: "contained", onClick: submit, children: "Add Class" })] }) }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "class-select-label", children: "Select class" }), _jsxs(Select, { labelId: "class-select-label", value: selectedClassId, label: "Select class", onChange: (e) => setSelectedClassId(String(e.target.value)), children: [_jsx(MenuItem, { value: "", children: "-- select --" }), classes.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.topic, " (", c.year, "/", c.semester, ")"] }, c.id)))] })] }), selectedClassId && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", component: "h3", sx: { mb: 1 }, children: "Enrollments" }), _jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { alignItems: "center" }, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "student-select-label", children: "Select student" }), _jsxs(Select, { labelId: "student-select-label", value: selectedStudentId, label: "Select student", onChange: (e) => setSelectedStudentId(String(e.target.value)), children: [_jsx(MenuItem, { value: "", children: "-- select student --" }), students.map((s) => (_jsx(MenuItem, { value: s.id, children: s.name }, s.id)))] })] }), _jsx(Button, { variant: "contained", onClick: enroll, children: "Enroll" })] }), _jsx(List, { dense: true, children: roster.map((student) => (_jsx(ListItem, { children: student.name }, student.id))) })] }))] }) })] }));
};
export default ClassesPage;
