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

    const WHATSAPP_NUMBER = "573001234567"; // 👈 Asegúrate de poner tu número real aquí

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
                    setMainImage(images.length > 0 ? images[0] : 'https://via.placeholder.com/600x400?text=Imagen+No+Disponible'); 
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
    
    const handleWhatsappClick = () => {
        const message = `Hola, estoy interesado en el producto: ${producto.nombre} (Ref: ${producto.codigo}). Marca: ${producto.marca}. ¿Podrían darme más información?`;
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

    if (loading) return <div className="container my-5 text-center text-primary fs-5">Cargando detalles...</div>;
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
                <div className="col-md-7 d-flex"> 
                    {/* Miniaturas Laterales */}
                    {producto.imagenesUrls.length > 1 && (
                        <div className="d-flex flex-column gap-2 me-3" style={{ maxHeight: '32rem', overflowY: 'auto', minWidth: '95px' }}>
                            {producto.imagenesUrls.map((url, index) => (
                                <img 
                                    key={index} src={url} alt="Miniatura"
                                    className={`img-thumbnail p-0 ${url === mainImage ? 'border-primary border-3' : 'border-secondary'}`}
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={() => { setMainImage(url); setIsZoomed(false); }} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Imagen Principal con Lupa */}
                    <div 
                        className="card shadow-lg p-3 flex-grow-1"
                        style={{ height: '32rem', overflow: 'hidden' }}
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
                
                {/* Información del Producto */}
                <div className="col-md-5">
                    <h1 className="display-5 fw-bold text-dark">{producto.nombre}</h1>
                    <p className="text-muted small mb-4">
                        <span className="fw-bold text-dark">Marca:</span> {producto.marca} | 
                        <span className="fw-bold text-dark ms-2">Categoría:</span> {producto.categoria}
                    </p>
                    <p className="fw-bold fs-4">Ref: {producto.codigo}</p>

                    {/* BOTÓN WHATSAPP GRANDE Y VERDE */}
                    <button 
                        className="btn btn-success btn-lg mt-3 w-100 shadow fw-bold py-3" 
                        onClick={handleWhatsappClick}
                        style={{ backgroundColor: '#25d366', borderColor: '#25d366' }}
                    >
                        <i className="fab fa-whatsapp me-2"></i> Preguntar por WhatsApp
                    </button>
                </div>
            </div>

            {/* Descripción */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="card shadow-sm p-4 border-0 bg-light">
                        <h3 className="text-primary fw-bold mb-3">Especificaciones</h3>
                        <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}> 
                            {producto.descripcion}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}