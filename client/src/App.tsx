import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.scss";

// Globle route components
import AuthRoute from "./components/protected-route/auth-route/AuthRoute";
import PrivateRoute from "./components/protected-route/PrivateRoute/PrivateRoute";
import AdminRoute from "./components/protected-route/admin-route/AdminRoute";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import NotFound from "./components/not-found/NotFound";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-content">
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}

              {/* Auth routes */}
              <Route element={<AuthRoute />}></Route>

              {/* Protected routes */}
              <Route element={<PrivateRoute />}></Route>

              {/* Admin routes */}
              <Route element={<AdminRoute />}></Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
