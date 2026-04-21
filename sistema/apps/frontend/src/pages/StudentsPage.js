import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { api } from "../api";
const formatCpf = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const parts = [
        digits.slice(0, 3),
        digits.slice(3, 6),
        digits.slice(6, 9),
        digits.slice(9, 11)
    ];
    if (digits.length <= 3)
        return parts[0];
    if (digits.length <= 6)
        return `${parts[0]}.${parts[1]}`;
    if (digits.length <= 9)
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
    return `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`;
};
const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ name: "", cpf: "", email: "" });
    const [error, setError] = useState(null);
    const load = async () => {
        const data = await api.get("/students");
        setStudents(data);
    };
    useEffect(() => {
        load().catch((err) => setError(err instanceof Error ? err.message : String(err)));
    }, []);
    const submit = async () => {
        setError(null);
        try {
            await api.post("/students", form);
            setForm({ name: "", cpf: "", email: "" });
            await load();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    const remove = async (id) => {
        setError(null);
        try {
            await api.del(`/students/${id}`);
            await load();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    return (_jsxs(Box, { component: "section", sx: { display: "grid", gap: 2 }, children: [_jsx(Typography, { variant: "h4", component: "h2", children: "Students" }), error && _jsx(Alert, { severity: "error", children: error }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Stack, { spacing: 2, sx: { maxWidth: 480 }, children: [_jsx(TextField, { label: "Name", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }), _jsx(TextField, { label: "CPF", value: form.cpf, onChange: (e) => setForm({ ...form, cpf: formatCpf(e.target.value) }), placeholder: "000.000.000-00", helperText: "Format: 000.000.000-00" }), _jsx(TextField, { label: "Email", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) }), _jsx(Button, { variant: "contained", onClick: submit, children: "Add Student" })] }) }), _jsx(Paper, { sx: { p: 2 }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "CPF" }), _jsx(TableCell, { children: "Email" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: students.map((student) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: student.name }), _jsx(TableCell, { children: student.cpf }), _jsx(TableCell, { children: student.email }), _jsx(TableCell, { align: "right", children: _jsx(Button, { color: "error", onClick: () => remove(student.id), children: "Delete" }) })] }, student.id))) })] }) })] }));
};
export default StudentsPage;
