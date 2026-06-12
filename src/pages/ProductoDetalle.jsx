import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore';

export default function ProductoDetalle() {
    const { id } = useParams(); 
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(''); 
    const [isZoomed, setIsZoomed] = useState(false); 
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }); 
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Referencia al contenedor de miniaturas para controlar el scroll mediante código
    const thumbsTrackRef = useRef(null);

    const WHATSAPP_NUMBER = "573001234567"; 

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        const fetchProducto = async () => {
            try {
                const docRef = doc(db, "productos", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const images = data.imagenesUrls || (data.urlImagen ? [data.urlImagen] : []);
                    setProducto({ ...data, imagenesUrls: images });
                    if (images.length > 0) setMainImage(images[0]);
                }
            } catch (err) { console.error("Error:", err); }
            finally { setLoading(false); }
        };
        fetchProducto();
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);
    
    const handleMouseMove = (e) => {
        if (!isZoomed || isMobile) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        setCursorPosition({ x: (e.clientX - left) / width, y: (e.clientY - top) / height });
    };

    // Funciones de desplazamiento por software (Desplaza la lista arriba o abajo dinámicamente)
    const scrollThumbs = (direction) => {
        if (thumbsTrackRef.current) {
            const scrollAmount = 70; // Tamaño aproximado de una miniatura + su gap
            thumbsTrackRef.current.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) return <div style={{textAlign:'center', padding:'100px', fontSize:'20px'}}>Cargando Almacén Sanandresito...</div>;
    if (!producto) return <div className="container my-5 alert alert-danger">Producto no encontrado.</div>;

    // --- ESTILOS CONTROLADOS Y SEGUROS ---
    const s = {
        wrapper: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : '40px',
            backgroundColor: '#fff',
            padding: isMobile ? '15px' : '30px',
            marginTop: isMobile ? '10px' : '30px', 
            borderRadius: '12px',
            boxShadow: isMobile ? 'none' : '0 2px 15px rgba(0,0,0,0.05)'
        },
        descContainer: {
            backgroundColor: '#1e293b', 
            color: '#f8fafc',          
            padding: isMobile ? '20px' : '40px',
            marginTop: '30px',
            marginBottom: '40px',
            borderRadius: '16px',        
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            border: '1px solid #334155'  
        },
        gallerySection: {
            display: 'flex',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            gap: '15px',                  
            width: isMobile ? '100%' : '650px',
            height: isMobile ? 'auto' : '530px',
            alignItems: 'stretch'      
        },
        // Contenedor general del carrusel izquierdo
        carouselVerticalContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: isMobile ? '100%' : '65px',
            height: isMobile ? 'auto' : '100%',
            flexShrink: 0,
            gap: '5px'
        },
        // El track ahora oculta la barra gris pero permite el desplazamiento interno real mediante JS u scroll invisible
        thumbsTrack: {
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: '10px',
            width: '100%',
            height: isMobile ? 'auto' : '100%',
            overflowY: isMobile ? 'visible' : 'scroll', // Mantenemos scroll nativo por seguridad interna
            overflowX: isMobile ? 'auto' : 'hidden',
            scrollbarWidth: 'none', // Oculta la barra de scroll en Firefox
            msOverflowStyle: 'none', // Oculta la barra de scroll en IE/Edge
            paddingBottom: isMobile ? '10px' : '0',
            flexHydrate: 0,
            // Truco CSS para ocultar la barra gris de scroll en Chrome/Safari
            WebkitOverflowScrolling: 'touch'
        },
        thumb: {
            width: '55px',
            height: '55px',
            flexShrink: 0,
            border: '1px solid #ddd',
            borderRadius: '6px',
            objectFit: 'contain',
            padding: '3px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            transition: 'all 0.2s ease'
        },
        // Flechas mejoradas visualmente con formas CSS nativas por si fallan los iconos
        arrowBtn: {
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#3483fa',
            width: '28px',
            height: '28px',
            fontSize: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            zIndex: 2,
            transition: 'background 0.2s'
        },
        viewer: {
            flex: 1,
            height: isMobile ? '380px' : '100%',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            cursor: isMobile ? 'default' : (isZoomed ? 'zoom-out' : 'zoom-in')
        },
        mainImg: {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: (!isMobile && isZoomed) ? 'scale(2)' : 'scale(1)',
            transformOrigin: `${cursorPosition.x * 100}% ${cursorPosition.y * 100}%`,
            transition: isZoomed ? 'none' : 'transform 0.2s ease-out'
        },
        infoSide: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        }
    };

    return (
        <div className="container-xl">
            {/* Injectamos estilos CSS en línea rápidos para limpiar la barra de scroll en Chrome de forma definitiva */}
            <style>{`
                div::-webkit-scrollbar {
                    display: none !important;
                }
            `}</style>

            {/* 1. SECCIÓN SUPERIOR: Galería + Botón Compra */}
            <div style={s.wrapper}>
                <div style={s.gallerySection}>
                    
                    {/* SECCIÓN DE MINIATURAS CON CONTROL COMPLETO */}
                    <div style={s.carouselVerticalContainer}>
                        {/* Botón Superior */}
                        <button style={s.arrowBtn} onClick={() => scrollThumbs('up')} title="Subir">
                            ▲
                        </button>

                        {/* Track de miniaturas */}
                        <div ref={thumbsTrackRef} style={s.thumbsTrack}>
                            {producto.imagenesUrls.map((url, i) => (
                                <img 
                                    key={i} 
                                    src={url} 
                                    alt="thumb"
                                    style={{...s.thumb, borderColor: url === mainImage ? '#3483fa' : '#ddd', borderWidth: url === mainImage ? '2px' : '1px'}}
                                    onMouseEnter={() => { setMainImage(url); setIsZoomed(false); }}
                                    onClick={() => { setMainImage(url); setIsZoomed(false); }}
                                />
                            ))}
                        </div>

                        {/* Botón Inferior */}
                        <button style={s.arrowBtn} onClick={() => scrollThumbs('down')} title="Bajar">
                            ▼
                        </button>
                    </div>

                    {/* Visor de Imagen Principal */}
                    <div 
                        style={s.viewer}
                        onMouseEnter={() => !isMobile && setIsZoomed(true)} 
                        onMouseLeave={() => setIsZoomed(false)} 
                        onMouseMove={handleMouseMove}
                    >
                        <img src={mainImage} alt={producto.nombre} style={s.mainImg} />
                    </div>
                </div>

                <div style={s.infoSide}>
                    <span className="text-muted small mb-1">Nuevo | Almacén Sanandresito</span>
                    <h1 style={{fontSize: isMobile ? '22px' : '28px', fontWeight:'700', marginBottom:'8px', color:'#333'}}>
                        {producto.nombre}
                    </h1>
                    <p className="text-secondary mb-4" style={{fontSize: '0.9rem'}}>
                        Marca: <span className="fw-bold">{producto.marca}</span> | Ref: {producto.codigo}
                    </p>
                    
                    <button 
                        className="btn btn-success w-100 py-3 fw-bold shadow-sm"
                        style={{ fontSize: '1.1rem', borderRadius: '8px', backgroundColor: '#25d366', border: 'none' }}
                        onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola! Me interesa este producto: ${producto.nombre}`, '_blank')}
                    >
                        <i className="fab fa-whatsapp me-2"></i> Preguntar por WhatsApp
                    </button>
                </div>
            </div>

            {/* 2. SECCIÓN INFERIOR */}
            <div style={s.descContainer}>
                <div className="d-flex align-items-center mb-4 border-bottom pb-3" style={{borderColor: '#475569 !important'}}>
                    <div className="bg-primary p-2 rounded-3 me-3 text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                        <i className="bi bi-file-earmark-text fs-5"></i>
                    </div>
                    <h4 className="fw-bold mb-0" style={{color: '#ffffff', letterSpacing: '0.5px'}}>
                        Especificaciones y Descripción
                    </h4>
                </div>
                
                <p style={{
                    whiteSpace: 'pre-wrap', 
                    lineHeight: '1.9', 
                    color: '#cbd5e1', 
                    fontSize: isMobile ? '15px' : '16px',
                    letterSpacing: '0.2px',
                    paddingLeft: isMobile ? '0px' : '8px'
                }}>
                    {producto.descripcion}
                </p>
            </div>
        </div>
    );
}