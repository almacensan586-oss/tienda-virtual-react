import React from 'react';
import { useAuth } from "../context/AuthContext"; 
import { Link } from 'react-router-dom'; 

const ProductoCard = ({ producto, onEliminar, onModificar }) => {
    const { isAdmin } = useAuth(); 

    const primaryImageUrl = (producto.imagenesUrls && producto.imagenesUrls.length > 0) 
        ? producto.imagenesUrls[0] 
        : 'https://via.placeholder.com/400x300?text=SIN+IMAGEN';

    return (
        <div className="col">
            <div className="card h-100 shadow-sm border-0 card-hover-effect">
                {/* Contenedor de imagen con altura fija */}
                <Link to={`/productos/${producto.id}`} className="product-img-container">
                    <img src={primaryImageUrl} className="card-img-top" alt={producto.nombre} />
                </Link>
                
                <div className="card-body d-flex flex-column text-center">
                    <h6 className="text-primary fw-bold mb-1 small text-uppercase">{producto.marca}</h6>
                    <h5 className="card-title fw-bold text-dark text-truncate mb-2">{producto.nombre}</h5>
                    <p className="text-muted small mb-0">Ref: {producto.codigo}</p>
                    <p className="text-secondary small mb-3">{producto.categoria}</p>

                    <div className="mt-auto">
                        {isAdmin && (
                            <div className="d-flex justify-content-between mt-2 gap-2 border-top pt-3"> 
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
        </div>
    );
};

export default ProductoCard;