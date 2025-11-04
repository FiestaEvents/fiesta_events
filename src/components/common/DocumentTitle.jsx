
// ============================================
// components/common/DocumentTitle.jsx - Helper Component
// ============================================
import React, { useEffect } from "react";

const DocumentTitle = ({ title, children }) => {
  useEffect(() => {
    document.title = title ? `${title} - Venue Manager` : "Venue Manager";
  }, [title]);

  return <>{children}</>;
};

export default DocumentTitle;