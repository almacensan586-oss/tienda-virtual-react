import React, { useState, useEffect } from 'react';
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

    // Detectamos si es móvil para ajustar el diseño y márgenes
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    if (loading) return <div style={{textAlign:'center', padding:'100px', fontSize:'20px'}}>Cargando Almacén Sanandresito...</div>;
    if (!producto) return <div className="container my-5 alert alert-danger">Producto no encontrado.</div>;

    // --- ESTILOS FINALES Y RESPONSIVOS ---
    const s = {
        wrapper: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : '40px',
            backgroundColor: '#fff',
            padding: isMobile ? '15px' : '30px',
            // MARGEN SUPERIOR: Ajustado para que no choque con la Navbar fija
            marginTop: isMobile ? '10px' : '30px', 
            borderRadius: '12px',
            boxShadow: isMobile ? 'none' : '0 2px 15px rgba(0,0,0,0.05)'
        },
        gallerySection: {
            display: 'flex',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            gap: '15px',
            width: isMobile ? '100%' : '650px',
            height: isMobile ? 'auto' : '550px'
        },
        thumbsTrack: {
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: '10px',
            width: isMobile ? '100%' : '65px',
            overflowX: isMobile ? 'auto' : 'hidden',
            paddingBottom: isMobile ? '10px' : '0',
            flexShrink: 0
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
            backgroundColor: '#fff'
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
            // Efecto lupa solo para escritorio
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
            <div style={s.wrapper}>
                
                {/* LADO IZQUIERDO: GALERÍA */}
                <div style={s.gallerySection}>
                    {/* Miniaturas */}
                    <div style={s.thumbsTrack}>
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

                    {/* Visor Principal */}
                    <div 
                        style={s.viewer}
                        onMouseEnter={() => !isMobile && setIsZoomed(true)} 
                        onMouseLeave={() => setIsZoomed(false)} 
                        onMouseMove={handleMouseMove}
                    >
                        <img src={mainImage} alt={producto.nombre} style={s.mainImg} />
                    </div>
                </div>

                {/* LADO DERECHO: INFORMACIÓN */}
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

                    <div style={{marginTop:'40px', borderTop:'1px solid #eee', paddingTop:'25px'}}>
                        <h5 className="fw-bold mb-3">Descripción detallada</h5>
                        <p style={{
                            whiteSpace:'pre-wrap', 
                            lineHeight:'1.8', 
                            color:'#444', 
                            fontSize: isMobile ? '15px' : '16px'
                        }}>
                            {producto.descripcion}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}