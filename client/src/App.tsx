import { Routes, Route } from "react-router-dom";
import { Booking } from "./pages/Booking";
import { Daybed } from "./pages/Daybed";
import { Kds } from "./pages/Kds";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Booking />} />
      <Route path="/d/:id" element={<Daybed />} />
      <Route path="/kds" element={<Kds />} />
    </Routes>
  );
}
