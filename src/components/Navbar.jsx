import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top py-3">
        <div className="container d-flex justify-content-between align-items-center">
          
          {/* LOGO CENTRADO Y ESTÉTICO */}
          <Link 
            to="/" 
            className="navbar-brand d-flex align-items-center fw-bold"
            style={{ letterSpacing: '0.5px' }}
          >
            <img 
              src="/logo_Sanandresito.png" 
              alt="Logo" 
              style={{ height: '40px', marginRight: '10px' }} 
            />
            <span style={{ 
              fontSize: '1.2rem', 
              color: '#333',
              textTransform: 'uppercase',
              display: 'inline-block'
            }}>
              Almacén <span style={{ color: '#3483fa' }}>Sanandresito</span>
            </span>
          </Link>

          {/* BOTÓN MENÚ MÓVIL */}
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* LINKS DE NAVEGACIÓN */}
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><Link to="/" className="nav-link px-3 fw-medium">Inicio</Link></li>
              <li className="nav-item"><Link to="/productos" className="nav-link px-3 fw-medium">Productos</Link></li>
              <li className="nav-item"><Link to="/contacto" className="nav-link px-3 fw-medium">Contacto</Link></li>
              
              {user ? (
                <>
                  {isAdmin && (
                    <li className="nav-item">
                      <Link to="/admin" className="btn btn-outline-primary btn-sm ms-lg-3 mt-2 mt-lg-0 px-3">Panel Admin</Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <button onClick={handleLogout} className="btn btn-danger btn-sm ms-lg-2 mt-2 mt-lg-0 px-3">Salir</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link to="/login" className="btn btn-primary btn-sm ms-lg-3 mt-2 mt-lg-0 px-4 shadow-sm" style={{ backgroundColor: '#3483fa', border: 'none' }}>
                    Ingresar
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* ESPACIADOR CORREGIDO: Aumentamos a 90px para dar más aire */}
      <div style={{ height: '90px' }}></div>
    </header>
  );
}