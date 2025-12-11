import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx"; // <--- IMPORT THIS
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const App = () => {
  // ... (Your existing Favicon logic here) ...

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationProvider>
                   <AppRoutes />
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;