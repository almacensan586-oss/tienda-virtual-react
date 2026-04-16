import { Link, NavLink, useNavigate } from "react-router-dom"; // Cambiamos Link por NavLink en los items
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) setMenuOpen(false); // Cierra menú al agrandar pantalla
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm}`);
      setMenuOpen(false); // Cerramos menú en móvil tras buscar
    }
  };

  const brandTextStyle = {
    color: '#3483fa',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: '0.5px'
  };

  // Función para estilo de links activos
  const activeLinkStyle = ({ isActive }) => ({
    color: isActive ? '#3483fa' : '#555',
    fontWeight: isActive ? '700' : '500',
    borderBottom: isActive && !isMobile ? '2px solid #3483fa' : 'none'
  });

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top py-2">
        <div className="container">
          
          <Link to="/" className="navbar-brand d-flex align-items-center" style={{ textDecoration: 'none' }}>
            <img 
              src="/logo_Sanandresito.png" 
              alt="Logo" 
              style={{ height: isMobile ? '35px' : '45px', marginRight: '10px' }} 
            />
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row', 
              lineHeight: '1',
              textAlign: 'left',
              alignItems: isMobile ? 'flex-start' : 'center'
            }}>
              <span style={{ ...brandTextStyle, fontSize: isMobile ? '16px' : '1.2rem' }}>Almacén</span>
              <span style={{ ...brandTextStyle, fontSize: isMobile ? '20px' : '1.2rem', marginLeft: isMobile ? '0' : '7px' }}>Sanandresito</span>
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
            {/* --- BARRA DE BÚSQUEDA --- */}
            <form onSubmit={handleSearch} className="ms-lg-4 mt-3 mt-lg-0 flex-grow-1" style={{ maxWidth: isMobile ? '100%' : '400px' }}>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control form-control-sm bg-light border-0" 
                  placeholder="Buscar productos..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '20px 0 0 20px', paddingLeft: '15px' }}
                />
                <button className="btn btn-light btn-sm border-0" type="submit" style={{ borderRadius: '0 20px 20px 0', color: '#3483fa' }}>
                  <i className="bi bi-search"></i> 🔍
                </button>
              </div>
            </form>

            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <NavLink to="/" className="nav-link px-3" style={activeLinkStyle} onClick={() => setMenuOpen(false)}>Inicio</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/productos" className="nav-link px-3" style={activeLinkStyle} onClick={() => setMenuOpen(false)}>Productos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contacto" className="nav-link px-3" style={activeLinkStyle} onClick={() => setMenuOpen(false)}>Contacto</NavLink>
              </li>
              
              {user ? (
                <>
                  {isAdmin && (
                    <li className="nav-item">
                      <Link to="/admin" className="btn btn-outline-primary btn-sm ms-lg-3 mt-2 mt-lg-0 px-3" onClick={() => setMenuOpen(false)}>Panel Admin</Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <button onClick={handleLogout} className="btn btn-danger btn-sm ms-lg-2 mt-2 mt-lg-0 px-3">Salir</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link to="/login" className="btn btn-primary btn-sm ms-lg-3 mt-2 mt-lg-0 px-4 shadow-sm" style={{ backgroundColor: '#3483fa', border: 'none' }} onClick={() => setMenuOpen(false)}>
                    Ingresar
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div style={{ height: isMobile ? '100px' : '90px' }}></div>
    </header>
  );
}