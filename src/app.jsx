import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const App = () => {
  
  // --- FAVICON ANIMATION START ---
  useEffect(() => {
    // 1. Get or create the favicon link
    const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
    favicon.type = 'image/svg+xml';
    favicon.rel = 'icon';
    document.head.appendChild(favicon);

    // 2. The path for the 'F' logo
    const pathData = "M25 110 C22 90 18 40 28 25 C30 18 35 18 55 16 C65 15 75 14 82 15 L83 26 C70 28 55 30 42 32 L41 52 C50 51 60 50 68 50 L69 62 C60 63 50 63 40 64 C41 80 42 95 38 110 Z";
    
    // 3. Animation Loop
    let frame = 0;
    const intervalId = setInterval(() => {
      // Wiggle between -15 and 15 degrees
      const angle = Math.sin(frame / 2) * 15; 
      
      // Create SVG with rotation
      const svgString = `
        <svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <g transform="rotate(${angle} 50 60)">
            <path d="${pathData}" fill="#EF7D32"/>
          </g>
        </svg>
      `.trim();

      // Update browser tab icon
      favicon.href = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
      frame++;
    }, 100);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);
  // --- FAVICON ANIMATION END ---

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;