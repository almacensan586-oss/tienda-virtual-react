import React from 'react';
import { useAuth } from "../context/AuthContext"; 
import { Link } from 'react-router-dom'; 

const WHATSAPP_NUMBER = "573001234567"; // Tu número real

const ProductoCard = ({ producto, onEliminar, onModificar }) => {
    const { isAdmin } = useAuth(); 

    const handleWhatsappClick = (e) => {
        e.preventDefault(); 
        const message = `¡Hola! Me interesa: ${producto.nombre} (Cod: ${producto.codigo})`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const primaryImageUrl = (producto.imagenesUrls && producto.imagenesUrls.length > 0) 
        ? producto.imagenesUrls[0] 
        : 'https://via.placeholder.com/400x300?text=SIN+IMAGEN';

    return (
        <div className="col">
            <div className="card h-100 shadow-sm border-0 card-hover-effect">
                <Link to={`/productos/${producto.id}`} className="product-img-container">
                    <img src={primaryImageUrl} className="card-img-top p-3" alt={producto.nombre} />
                </Link>
                
                <div className="card-body d-flex flex-column text-center">
                    <h6 className="text-primary fw-bold mb-1 small">{producto.marca}</h6>
                    <h5 className="card-title fw-bold text-dark text-truncate mb-2">{producto.nombre}</h5>
                    <p className="text-muted small mb-3">Código: {producto.codigo}</p>

                    <div className="mt-auto d-flex justify-content-center">
                        <button type="button" onClick={handleWhatsappClick} className="btn-whatsapp-circle">
                            <i className="fa-brands fa-whatsapp"></i>
                        </button>
                    </div>

                    {isAdmin && (
                        <div className="d-flex justify-content-between mt-3 gap-2 border-top pt-3"> 
                            <button className="btn btn-outline-info btn-sm flex-fill" onClick={() => onModificar(producto.id)}>
                                <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-outline-danger btn-sm flex-fill" onClick={() => onEliminar(producto.id)}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductoCard;