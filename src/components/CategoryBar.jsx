import React from 'react';

const CATEGORIAS_LIST = [
    { label: "🔥 Todos", value: "" }, 
    { label: "Audio y Sonido", value: "Audio" },
    { label: "Televisores (TV)", value: "TV" },
    { label: "Muebles", value: "Muebleria" },
    { label: "Congeladores", value: "Congeladores" },
    { label: "Escritorios", value: "Escritorios" },
    { label: "Computadores", value: "Tecnologia-Computadores" }, 
    { label: "Celulares", value: "Tecnologia-Celulares" },    
    { label: "Electrodomésticos", value: "Electro" }, 
];

export default function CategoryBar({ activeCategory, onCategoryChange }) {
    return (
        <nav className="nav nav-pills flex-column gap-1 category-nav-scroll">
            {CATEGORIAS_LIST.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => onCategoryChange(cat.value)}
                    className={`nav-link text-start border-0 px-3 py-2 fw-medium transition-all ${
                        activeCategory === cat.value 
                        ? 'active shadow-sm' 
                        : 'bg-transparent text-dark hover-sidebar-item'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </nav>
    );
}