import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore';

export default function ProductoDetalle() {
    const { id } = useParams(); 
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(''); 
    
    // Estados para el efecto Lupa
    const [isZoomed, setIsZoomed] = useState(false); 
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }); 

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const docRef = doc(db, "productos", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Buscamos imagenesUrls o urlImagen (compatibilidad con ambos nombres)
                    const images = data.imagenesUrls || (data.urlImagen ? [data.urlImagen] : []);
                    setProducto({ ...data, imagenesUrls: images });
                    if (images.length > 0) setMainImage(images[0]);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProducto();
    }, [id]);
    
    const handleMouseMove = (e) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        setCursorPosition({ x: (e.clientX - left) / width, y: (e.clientY - top) / height });
    };

    if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Cargando Almacén Sanandresito...</div>;
    if (!producto) return <div className="container my-5">Producto no encontrado.</div>;

    // --- ESTILOS DE EMERGENCIA (Fuerza Bruta para el diseño) ---
    const s = {
        wrapper: {
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 600px) 1fr', // Bloquea el ancho de la imagen
            gap: '40px',
            backgroundColor: '#fff',
            padding: '20px',
            marginTop: '20px'
        },
        galleryRow: {
            display: 'flex',
            gap: '15px',
            height: '500px' // Altura fija para que la imagen no crezca hacia abajo
        },
        thumbsColumn: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '60px',
            overflowY: 'auto'
        },
        thumb: {
            width: '50px',
            height: '50px',
            border: '1px solid #ddd',
            cursor: 'pointer',
            objectFit: 'contain',
            padding: '2px'
        },
        viewer: {
            flex: 1,
            height: '100%',
            overflow: 'hidden', // CLAVE: Corta el zoom si se sale
            position: 'relative',
            border: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in'
        },
        mainImg: {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transition: 'transform 0.1s ease-out',
            transform: isZoomed ? 'scale(2)' : 'scale(1)',
            transformOrigin: `${cursorPosition.x * 100}% ${cursorPosition.y * 100}%`
        }
    };

    return (
        <div className="container-xl">
            <div style={s.wrapper}>
                
                {/* SECCIÓN IZQUIERDA: MINIATURAS + IMAGEN */}
                <div style={s.galleryRow}>
                    {/* Lista de Miniaturas */}
                    <div style={s.thumbsColumn}>
                        {producto.imagenesUrls.map((url, i) => (
                            <img 
                                key={i} 
                                src={url} 
                                style={{...s.thumb, borderColor: url === mainImage ? '#3483fa' : '#ddd'}}
                                onMouseEnter={() => { setMainImage(url); setIsZoomed(false); }}
                            />
                        ))}
                    </div>

                    {/* Visor con Zoom */}
                    <div 
                        style={s.viewer}
                        onMouseEnter={() => setIsZoomed(true)} 
                        onMouseLeave={() => setIsZoomed(false)} 
                        onMouseMove={handleMouseMove}
                    >
                        <img 
                            src={mainImage} 
                            alt="producto" 
                            style={s.mainImg} 
                        />
                    </div>
                </div>

                {/* SECCIÓN DERECHA: TEXTOS */}
                <div>
                    <small style={{color:'#666'}}>Nuevo | Almacén Sanandresito</small>
                    <h1 style={{fontSize:'26px', fontWeight:'bold', margin:'10px 0'}}>{producto.nombre}</h1>
                    <p style={{color:'#666'}}>Marca: {producto.marca} | Ref: {producto.codigo}</p>
                    
                    <button className="btn btn-success w-100 py-3 fw-bold mt-4" style={{fontSize:'1.2rem'}}>
                        <i className="fab fa-whatsapp me-2"></i> Preguntar por WhatsApp
                    </button>

                    <div style={{marginTop:'40px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
                        <h5 style={{fontWeight:'bold'}}>Descripción</h5>
                        <p style={{whiteSpace:'pre-wrap', lineHeight:'1.6', color:'#333', marginTop:'15px'}}>
                            {producto.descripcion}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}