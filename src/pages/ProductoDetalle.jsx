// src/pages/ProductoDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore';

export default function ProductoDetalle() {
    // 1. Obtener el ID de la URL
    const { id } = useParams(); 
    
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState(''); 
    const [isZoomed, setIsZoomed] = useState(false); 
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }); 

    // Número de WhatsApp (ejemplo)
    const WHATSAPP_NUMBER = "573001234567";

    // 2. Cargar datos del producto
    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("ID de producto no proporcionado.");
            return;
        }

        const fetchProducto = async () => {
            try {
                const docRef = doc(db, "productos", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    const images = data.imagenesUrls || (data.urlImagen ? [data.urlImagen] : []);
                    data.imagenesUrls = images; 
                    
                    setProducto(data);
                    setMainImage(images.length > 0 ? images[0] : 'https://via.placeholder.com/600x400/AAAAAA/FFFFFF?text=Imagen+No+Disponible'); 
                } else {
                    setError("Producto no encontrado.");
                }
            } catch (err) {
                console.error("Error al cargar detalle:", err);
                setError("Hubo un error al cargar los detalles del producto.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducto();
    }, [id]);
    
    // Función para manejar el clic de WhatsApp
    const handleWhatsappClick = () => {
        const message = `Hola, estoy interesado en el producto: ${producto.nombre} (Código: ${producto.codigo || 'N/A'}). Marca: ${producto.marca || 'N/A'}. ¿Podrían darme más información?`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    // ⬅️ FUNCIÓN: Calcula la posición del cursor y el desplazamiento para el zoom
    const handleMouseMove = (e) => {
        if (!isZoomed) return;

        // Obtiene las dimensiones del contenedor
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        
        // Calcula la posición relativa del cursor dentro del contenedor (0 a 1)
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        // Establece la posición del cursor (usado para el transform-origin)
        setCursorPosition({ x, y });
    };

    // 3. Renderizado de carga y error
    if (loading) {
        return <div className="container my-5 text-center text-primary fs-5">Cargando detalles del producto...</div>;
    }

    if (error) {
        return <div className="container my-5 alert alert-danger text-center" role="alert">{error}</div>;
    }

    if (!producto) return null;

    // Estilos dinámicos para el efecto de lupa
    const zoomStyle = isZoomed ? {
        // Aumenta la escala (200% de zoom)
        transform: 'scale(2)', 
        // Hace que el punto de origen de la transformación siga al cursor
        transformOrigin: `${cursorPosition.x * 100}% ${cursorPosition.y * 100}%`,
        // Quita la transición cuando está activo para que el movimiento sea instantáneo
        transition: 'none', 
        objectFit: 'cover' // Asegura que cubra el área cuando está ampliada
    } : {
        transform: 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.3s ease-in-out',
        objectFit: 'contain'
    };


    // 4. Renderizado Final (Diseño con Bootstrap)
    return (
        <div className="container my-5">
            
            {/* ⬅️ CONTENEDOR PRINCIPAL: GALERÍA E INFORMACIÓN (COLUMNAS) */}
            <div className="row mb-5 pb-5 border-bottom">
                
                {/* ⬅️ Columna IZQUIERDA: Galería (AHORA 7/12) */}
                <div className="col-md-7 d-flex"> 
                    
                    {/* 1. Carrusel Vertical de Miniaturas (Nueva Columna) */}
                    {producto.imagenesUrls.length > 1 && (
                        <div 
                            className="d-flex flex-column gap-2 me-3" 
                            style={{ 
                                maxHeight: '32rem', // ⬅️ Altura aumentada para el contenedor principal
                                overflowY: 'scroll',
                                minWidth: '95px', // ⬅️ Ancho fijo para estabilidad
                                boxSizing: 'content-box'
                            }}
                        >
                            {producto.imagenesUrls.map((url, index) => (
                                <img 
                                    key={index} 
                                    src={url} 
                                    alt={`Miniatura ${index + 1}`} 
                                    className={`img-thumbnail p-0 ${url === mainImage ? 'border-primary border-3' : 'border-secondary'}`}
                                    style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        objectFit: 'cover', 
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s',
                                        flexShrink: 0,
                                    }}
                                    onClick={() => { setMainImage(url); setIsZoomed(false); }} 
                                />
                            ))}
                        </div>
                    )}

                    {/* 2. Imagen Principal Grande (Contenedor Estático y LUPA) */}
                    <div 
                        className="card shadow-lg p-3 flex-grow-1"
                        style={{ height: '32rem', overflow: 'hidden' }} // ⬅️ Altura aumentada para el contenedor principal
                        onMouseEnter={() => setIsZoomed(true)} 
                        onMouseLeave={() => setIsZoomed(false)} 
                        onMouseMove={handleMouseMove} 
                    >
                        {/* Aplicamos los estilos dinámicos de zoom */}
                        <img 
                            src={mainImage} 
                            alt={producto.nombre} 
                            className="img-fluid rounded"
                            style={{ 
                                ...zoomStyle,
                                maxHeight: isZoomed ? 'none' : '100%', 
                                width: '100%', 
                                cursor: isZoomed ? 'zoom-out' : 'zoom-in', 
                            }}
                        />
                    </div>
                </div>
                
                {/* ⬅️ Columna DERECHA: Información Clave y Contacto (AHORA 5/12) */}
                <div className="col-md-5">
                    <h1 className="display-5 fw-bold text-dark">{producto.nombre}</h1>
                    <p className="text-muted small mb-4">
                        <span className="fw-bold text-dark">Marca:</span> {producto.marca} | 
                        <span className="fw-bold text-dark ms-2">Categoría:</span> {producto.categoria}
                    </p>
                    
                    {/* Código y Botón (parte superior) */}
                    <p className="fw-bold">Código: {producto.codigo}</p>

                    {/* Botón de Contacto (WhatsApp) */}
                    <button 
                        className="btn btn-success btn-lg mt-3 w-100 shadow" 
                        onClick={handleWhatsappClick}
                    >
                        Preguntar por WhatsApp
                    </button>

                </div>
            </div>

            {/* ⬇️ SECCIÓN: DESCRIPCIÓN (ANCHO COMPLETO) ⬇️ */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="card shadow-sm p-4">
                        <h3 className="text-primary fw-bold mb-3">
                            Especificaciones y Descripción Detallada
                        </h3>
                        <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}> 
                            {producto.descripcion}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}   