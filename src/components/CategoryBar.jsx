import React, { useState } from 'react';

const CATEGORIAS_LIST = [
    { label: "📦 CATALOGO", value: "" }, 
    { 
      label: "🔊 Sonido", 
      value: "Sonido",
      isParent: true,
      subcategorias: [
        { label: "Cabinas", value: "Cabinas" },
        { label: "Cabinas profesionales", value: "Cabinas-profesionales" },
        { label: "Torres de sonido", value: "Torres-sonido" },
        { label: "Parlantes portables", value: "Parlantes-portables" },
      ]
    },
    { 
      label: "📺 Video", 
      value: "Video",
      isParent: true,
      subcategorias: [
        { label: "Televisores", value: "TV" },
        { label: "Bases para Televisores", value: "Bases-TV" },
      ]
    },
    { 
      label: "💻 Tecnología", 
      value: "Tecnologia",
      isParent: true,
      subcategorias: [
        { label: "Computadores portátiles", value: "Portatiles" },
        { label: "Gamer", value: "Gamer" },
        { label: "Celulares", value: "Celulares" },
        { label: "Tablet", value: "Tablet" },
        { label: "Monitores", value: "Monitores" },
        { label: "Accesorios", value: "Accesorios-Tec" },
        { label: "Repuestos para portátil", value: "Repuestos-Portatil" },
      ]
    },
    { 
      label: "❄️ Refrigeración", 
      value: "Refrigeracion",
      isParent: true,
      subcategorias: [
        { label: "Congeladores", value: "Congeladores" },
        { label: "Exhibidores", value: "Exhibidores" },
        { label: "Minibar", value: "Minibar" },
        { label: "Vitrinas", value: "Vitrinas" },
        { label: "Neveras", value: "Neveras" },
        { label: "Nevecones", value: "Nevecones" },
      ]
    },
    { 
      label: "🍳 Cocina", 
      value: "Cocina",
      isParent: true,
      subcategorias: [
        { label: "Cafeteras", value: "Cafeteras" },
        { label: "Exprimidor", value: "Exprimidor" },
        { label: "Freidora", value: "Freidora" },
        { label: "Hervidor", value: "Hervidor" },
        { label: "Hornos", value: "Hornos" },
        { label: "Licuadora", value: "Licuadora" },
        { label: "Olla Arrocera", value: "Olla-Arrocera" },
        { label: "Olla Presión", value: "Olla-Presion" },
      ]
    },
    { 
      label: "🧺 Lavado", 
      value: "Lavado",
      isParent: true,
      subcategorias: [
        { label: "Lavadoras automáticas", value: "Lavadoras-automaticas" },
        { label: "Lavadoras semiautomáticas", value: "Lavadoras-semiautomaticas" },
      ]
    },
    { 
      label: "🛋️ Mueblería", 
      value: "Muebleria",
      isParent: true,
      subcategorias: [
        { label: "Colchones", value: "Colchones" },
        { label: "Basecamas y Espaldares", value: "Basecamas-Espaldares" },
        { label: "Armarios", value: "Armarios" },
        { label: "Nocheros", value: "Nocheros" },
        { label: "Juegos de Sala", value: "Juegos-Sala" },
        { label: "Sofacamas", value: "Sofacamas" },
        { label: "Comedores", value: "Comedores" },
        { label: "Alacenas (Piso y Pared)", value: "Alacenas" },
        { label: "Espejos y Tocadores", value: "Espejos-Tocadores" },
      ]
    },
    { 
      label: "💼 Oficina", 
      value: "Oficina",
      isParent: true,
      subcategorias: [
        { label: "Escritorios", value: "Escritorios" },
        { label: "Sillas Ergonómicas", value: "Sillas-Ergonomicas" },
        { label: "Sillas Gamer", value: "Sillas-Gamer" },
      ]
    },
];

export default function CategoryBar({ activeCategory, onCategoryChange }) {
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    return (
        <div className="category-container py-2">
            <nav className="nav nav-pills flex-column gap-1">
                {CATEGORIAS_LIST.map((cat) => (
                    <div key={cat.label} className="mb-1">
                        <button
                            onClick={() => {
                                if (cat.isParent) toggleMenu(cat.label);
                                onCategoryChange(cat.value);
                            }}
                            className={`nav-link text-start border-0 px-3 py-2 fw-medium w-100 transition-all ${
                                activeCategory === cat.value || (cat.isParent && openMenus[cat.label])
                                ? 'bg-light text-primary' 
                                : 'bg-transparent text-dark hover-sidebar-item'
                            }`}
                            style={{
                                borderRadius: '10px',
                                fontSize: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 15px'
                            }}
                        >
                            <span>{cat.label}</span>
                            {cat.isParent && (
                                <span style={{ 
                                    fontSize: '10px', 
                                    transition: 'transform 0.3s',
                                    marginLeft: '10px' 
                                }} 
                                className={openMenus[cat.label] ? 'rotate-180' : ''}>
                                    ▼
                                </span>
                            )}
                        </button>

                        {cat.isParent && openMenus[cat.label] && (
                            <div className="ms-3 mt-1 d-flex flex-column gap-1 border-start ps-2 animation-fade-down">
                                {cat.subcategorias.map((sub) => (
                                    <button
                                        key={sub.value}
                                        onClick={() => onCategoryChange(sub.value)}
                                        className={`nav-link text-start border-0 px-3 py-1 fw-normal transition-all ${
                                            activeCategory === sub.value 
                                            ? 'text-primary fw-bold bg-light' 
                                            : 'bg-transparent text-secondary hover-sidebar-item'
                                        }`}
                                        style={{ fontSize: '13px', borderRadius: '6px' }}
                                    >
                                        • {sub.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <style jsx>{`
                .hover-sidebar-item:hover {
                    background-color: #f0f5ff !important;
                    color: #3483fa !important;
                    padding-left: 1.25rem !important;
                }
                .rotate-180 {
                    transform: rotate(180deg);
                }
                .animation-fade-down {
                    animation: fadeInDown 0.2s ease-out;
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
            `}</style>
        </div>
    );
}