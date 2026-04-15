import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Route, Routes } from "react-router-dom";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import StudentsPage from "./pages/StudentsPage";
import ClassesPage from "./pages/ClassesPage";
import EvaluationsPage from "./pages/EvaluationsPage";
const App = () => {
    return (_jsxs(Box, { sx: { minHeight: "100vh", bgcolor: "grey.50" }, children: [_jsx(AppBar, { position: "static", color: "primary", children: _jsx(Toolbar, { children: _jsxs(Container, { maxWidth: "lg", sx: { display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h6", component: "h1", sx: { flexGrow: 1 }, children: "Web Scholar" }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { color: "inherit", component: Link, to: "/students", children: "Students" }), _jsx(Button, { color: "inherit", component: Link, to: "/classes", children: "Classes" }), _jsx(Button, { color: "inherit", component: Link, to: "/evaluations", children: "Evaluations" })] })] }) }) }), _jsx(Container, { maxWidth: "lg", sx: { py: 4 }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(StudentsPage, {}) }), _jsx(Route, { path: "/students", element: _jsx(StudentsPage, {}) }), _jsx(Route, { path: "/classes", element: _jsx(ClassesPage, {}) }), _jsx(Route, { path: "/evaluations", element: _jsx(EvaluationsPage, {}) })] }) })] }));
};
export default App;
