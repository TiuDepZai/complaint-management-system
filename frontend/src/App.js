import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Home from './pages/Home';
import Complaints from './pages/Complaints';

function App() {
  return (
    <Router>
      <Navbar />

      {/* Spacer: empuja todo el contenido hacia abajo */}
      <div className="h-18 md:h-20" />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/" element={<Home />} />
        <Route path="/complaints" element={<Complaints />} />
      </Routes>
    </Router>
  );
}

export default App;
