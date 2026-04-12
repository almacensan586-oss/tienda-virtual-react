import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Estilo base para las dos partes del nombre
  const brandTextStyle = {
    color: '#3483fa', // El azul de Sanandresito
    textTransform: 'uppercase',
    fontWeight: '800', // Letra bien gruesa y fuerte
    letterSpacing: '0.5px'
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top py-2">
        <div className="container d-flex justify-content-between align-items-center">
          
          <Link to="/" className="navbar-brand d-flex align-items-center" style={{ textDecoration: 'none' }}>
            <img 
              src="/logo_Sanandresito.png" 
              alt="Logo" 
              style={{ height: isMobile ? '35px' : '45px', marginRight: '10px' }} 
            />
            
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row', 
              lineHeight: '1', // Pegamos un poco más las líneas en móvil
              textAlign: 'left',
              alignItems: isMobile ? 'flex-start' : 'center'
            }}>
              {/* PARTE 1: ALMACÉN (Ahora igual a la parte 2) */}
              <span style={{ 
                ...brandTextStyle,
                fontSize: isMobile ? '16px' : '1.2rem'
              }}>
                Almacén
              </span>
              
              {/* PARTE 2: SANANDRESITO */}
              <span style={{ 
                ...brandTextStyle,
                fontSize: isMobile ? '20px' : '1.2rem', // En móvil la marca principal destaca un poco más
                marginLeft: isMobile ? '0' : '7px'
              }}>
                Sanandresito
              </span>
            </div>
          </Link>

          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

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

      {/* Ajuste de espacio superior para que no tape nada */}
      <div style={{ height: isMobile ? '85px' : '90px' }}></div>
    </header>
  );
}