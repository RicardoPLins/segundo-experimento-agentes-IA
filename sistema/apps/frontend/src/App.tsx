import { Link, Route, Routes } from "react-router-dom";
import StudentsPage from "./pages/StudentsPage";
import ClassesPage from "./pages/ClassesPage";
import EvaluationsPage from "./pages/EvaluationsPage";

const App = () => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "24px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1>Web Scholar</h1>
        <nav style={{ display: "flex", gap: "12px" }}>
          <Link to="/students">Students</Link>
          <Link to="/classes">Classes</Link>
          <Link to="/evaluations">Evaluations</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<StudentsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/evaluations" element={<EvaluationsPage />} />
      </Routes>
    </div>
  );
};

export default App;
