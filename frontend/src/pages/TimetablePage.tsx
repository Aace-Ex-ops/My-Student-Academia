import React from "react";
import { Navigate } from "react-router-dom";

// Timetable module has been removed per user instruction.
export function TimetablePage() {
  return <Navigate to="/dashboard" replace />;
}
