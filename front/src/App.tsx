import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Missions } from './pages/Missions';
import { PageNav } from './components/PageNav';
import { Inventaire } from './pages/Inventaire';
import { Aventure } from './pages/Aventure';
import { Boutique } from './pages/Boutique';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aventure" element={<Aventure />} />
        <Route path="/boutique" element={<Boutique />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/inventaire" element={<Inventaire />} />
      </Routes>
      <PageNav />
    </BrowserRouter>
  );
}