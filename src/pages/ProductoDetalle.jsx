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

    // DETECTOR DE MÓVIL: Esto ajustará el diseño automáticamente
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProducto();
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);
    
    const handleMouseMove = (e) => {
        if (!isZoomed || isMobile) return; // Desactivamos zoom en móvil para evitar saltos
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        setCursorPosition({ x: (e.clientX - left) / width, y: (e.clientY - top) / height });
    };

    if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Cargando...</div>;
    if (!producto) return <div className="container my-5">Producto no encontrado.</div>;

    // --- ESTILOS DINÁMICOS (Adaptados para Móvil) ---
    const s = {
        wrapper: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row', // En móvil: uno abajo del otro
            gap: isMobile ? '20px' : '40px',
            backgroundColor: '#fff',
            padding: isMobile ? '10px' : '20px',
        },
        gallerySection: {
            display: 'flex',
            flexDirection: isMobile ? 'column-reverse' : 'row', // En móvil: miniaturas abajo de la imagen
            gap: '15px',
            width: isMobile ? '100%' : '600px',
            height: isMobile ? 'auto' : '500px'
        },
        thumbsTrack: {
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column', // En móvil: miniaturas horizontales
            gap: '10px',
            width: isMobile ? '100%' : '60px',
            overflowX: isMobile ? 'auto' : 'hidden',
            paddingBottom: isMobile ? '10px' : '0'
        },
        thumb: {
            width: '50px',
            height: '50px',
            flexShrink: 0,
            border: '1px solid #ddd',
            borderRadius: '4px',
            objectFit: 'contain',
            padding: '2px'
        },
        viewer: {
            flex: 1,
            height: isMobile ? '350px' : '100%',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        mainImg: {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: (!isMobile && isZoomed) ? 'scale(2)' : 'scale(1)',
            transformOrigin: `${cursorPosition.x * 100}% ${cursorPosition.y * 100}%`,
            transition: 'transform 0.1s ease-out'
        }
    };

    return (
        <div className="container-fluid" style={{maxWidth:'1200px', margin:'0 auto'}}>
            <div style={s.wrapper}>
                
                {/* GALERÍA REPSONSIVE */}
                <div style={s.gallerySection}>
                    <div style={s.thumbsTrack}>
                        {producto.imagenesUrls.map((url, i) => (
                            <img 
                                key={i} 
                                src={url} 
                                style={{...s.thumb, borderColor: url === mainImage ? '#3483fa' : '#ddd'}}
                                onMouseEnter={() => setMainImage(url)}
                                onClick={() => setMainImage(url)}
                            />
                        ))}
                    </div>

                    <div 
                        style={s.viewer}
                        onMouseEnter={() => !isMobile && setIsZoomed(true)} 
                        onMouseLeave={() => setIsZoomed(false)} 
                        onMouseMove={handleMouseMove}
                    >
                        <img src={mainImage} alt="producto" style={s.mainImg} />
                    </div>
                </div>

                {/* INFO DEL PRODUCTO */}
                <div style={{flex: 1}}>
                    <small style={{color:'#666'}}>Nuevo | Almacén Sanandresito</small>
                    <h1 style={{fontSize: isMobile ? '20px' : '26px', fontWeight:'bold', margin:'10px 0'}}>
                        {producto.nombre}
                    </h1>
                    <p style={{color:'#666'}}>Marca: {producto.marca} | Ref: {producto.codigo}</p>
                    
                    <button className="btn btn-success w-100 py-3 fw-bold mt-3">
                        <i className="fab fa-whatsapp me-2"></i> Preguntar por WhatsApp
                    </button>

                    <div style={{marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
                        <h5 style={{fontWeight:'bold'}}>Descripción</h5>
                        <p style={{whiteSpace:'pre-wrap', lineHeight:'1.6', color:'#333', fontSize: '14px'}}>
                            {producto.descripcion}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}