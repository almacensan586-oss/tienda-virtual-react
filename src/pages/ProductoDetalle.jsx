import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore';

export default function ProductoDetalle() {
    const { id } = useParams(); 
    
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState(''); 
    const [isZoomed, setIsZoomed] = useState(false); 
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }); 

    const WHATSAPP_NUMBER = "573001234567"; // Tu número real

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
                    setMainImage(images.length > 0 ? images[0] : 'https://via.placeholder.com/600x400?text=Sin+Imagen'); 
                } else {
                    setError("Producto no encontrado.");
                }
            } catch (err) {
                console.error("Error al cargar detalle:", err);
                setError("Hubo un error al cargar los detalles.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducto();
    }, [id]);
    
    const handleWhatsappClick = () => {
        const message = `Hola, estoy interesado en: ${producto.nombre} (Ref: ${producto.codigo}). Marca: ${producto.marca}.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    const handleMouseMove = (e) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        setCursorPosition({ x, y });
    };

    if (loading) return <div className="container my-5 text-center text-primary fs-5">Cargando...</div>;
    if (error) return <div className="container my-5 alert alert-danger text-center">{error}</div>;
    if (!producto) return null;

    const zoomStyle = isZoomed ? {
        transform: 'scale(2)', 
        transformOrigin: `${cursorPosition.x * 100}% ${cursorPosition.y * 100}%`,
        transition: 'none', 
        objectFit: 'cover'
    } : {
        transform: 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.3s ease-in-out',
        objectFit: 'contain'
    };

    return (
        <div className="container my-5">
            <div className="row mb-5 pb-5 border-bottom">
                
                {/* Lado Izquierdo: Galería */}
                <div className="col-md-7 d-flex flex-column flex-md-row"> 
                    
                    {/* Miniaturas */}
                    {producto.imagenesUrls.length > 1 && (
                        <div className="miniaturas-container d-flex flex-row flex-md-column gap-2 mb-3 mb-md-0 me-md-3">
                            {producto.imagenesUrls.map((url, index) => (
                                <img 
                                    key={index} src={url} alt="Mini"
                                    className={`img-thumbnail ${url === mainImage ? 'border-primary border-3' : 'border-secondary'}`}
                                    onClick={() => { setMainImage(url); setIsZoomed(false); }} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Imagen Principal */}
                    <div 
                        className="card shadow-lg p-3 flex-grow-1 main-product-container"
                        onMouseEnter={() => setIsZoomed(true)} 
                        onMouseLeave={() => setIsZoomed(false)} 
                        onMouseMove={handleMouseMove} 
                    >
                        <img 
                            src={mainImage} alt={producto.nombre} className="img-fluid rounded"
                            style={{ ...zoomStyle, maxHeight: isZoomed ? 'none' : '100%', width: '100%', cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
                        />
                    </div>
                </div>
                
                {/* Lado Derecho: Info */}
                <div className="col-md-5 mt-4 mt-md-0">
                    <h1 className="display-6 fw-bold text-dark">{producto.nombre}</h1>
                    <p className="text-muted small mb-3">
                        <span className="fw-bold text-dark">Marca:</span> {producto.marca} | 
                        <span className="fw-bold text-dark ms-2">Categoría:</span> {producto.categoria}
                    </p>
                    <p className="fw-bold fs-5 mb-4">Código: {producto.codigo}</p>

                    <button 
                        className="btn btn-success btn-lg w-100 shadow fw-bold py-3" 
                        onClick={handleWhatsappClick}
                    >
                        <i className="fab fa-whatsapp me-2"></i> Preguntar por WhatsApp
                    </button>
                </div>
            </div>

            {/* Descripción */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card shadow-sm p-4 border-0 bg-light">
                        <h4 className="text-primary fw-bold mb-3">Especificaciones</h4>
                        <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}> 
                            {producto.descripcion}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}