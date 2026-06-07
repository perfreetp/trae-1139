import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameLayout from '@/components/GameLayout';
import Home from '@/pages/Home';
import Procurement from '@/pages/Procurement';
import Inspection from '@/pages/Inspection';
import Warehouse from '@/pages/Warehouse';
import MenuPlanning from '@/pages/MenuPlanning';
import VehicleLoading from '@/pages/VehicleLoading';
import Emergency from '@/pages/Emergency';
import Settlement from '@/pages/Settlement';

export default function App() {
  return (
    <Router>
      <GameLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/menu" element={<MenuPlanning />} />
          <Route path="/loading" element={<VehicleLoading />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/settlement" element={<Settlement />} />
        </Routes>
      </GameLayout>
    </Router>
  );
}
