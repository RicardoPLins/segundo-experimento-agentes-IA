import { Link, Route, Routes } from "react-router-dom";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import StudentsPage from "./pages/StudentsPage";
import ClassesPage from "./pages/ClassesPage";
import EvaluationsPage from "./pages/EvaluationsPage";

const App = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              Web Scholar
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button color="inherit" component={Link} to="/students">
                Students
              </Button>
              <Button color="inherit" component={Link} to="/classes">
                Classes
              </Button>
              <Button color="inherit" component={Link} to="/evaluations">
                Evaluations
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<StudentsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/evaluations" element={<EvaluationsPage />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
