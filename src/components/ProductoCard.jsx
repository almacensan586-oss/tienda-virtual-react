import React from 'react';
import { useAuth } from "../context/AuthContext"; 
import { Link } from 'react-router-dom'; 

const ProductoCard = ({ producto, onEliminar, onModificar }) => {
    const { isAdmin } = useAuth(); 

    const imagen = (producto.imagenesUrls && producto.imagenesUrls.length > 0) 
        ? producto.imagenesUrls[0] 
        : 'https://via.placeholder.com/300';

    return (
        <div className="col">
            <div className="card h-100 shadow-sm border-0 overflow-hidden">
                <Link to={`/productos/${producto.id}`}>
                    <img src={imagen} className="card-img-top p-3" alt={producto.nombre} style={{ height: '200px', objectFit: 'contain' }} />
                </Link>
                <div className="card-body d-flex flex-column text-center pt-0">
                    <small className="text-primary fw-bold text-uppercase">{producto.marca}</small>
                    <h6 className="card-title fw-bold text-dark text-truncate">{producto.nombre}</h6>
                    
                    <div className="my-2">
                        <span className="badge bg-light text-dark border me-1">{producto.categoria}</span>
                        {producto.subcategoria && <span className="badge bg-info-subtle text-info border border-info-subtle">{producto.subcategoria}</span>}
                    </div>

                    <p className="small text-muted mb-3">Ref: {producto.codigo}</p>

                    {isAdmin && (
                        <div className="d-flex gap-2 mt-auto border-top pt-2">
                            <button className="btn btn-sm btn-outline-primary w-100" onClick={() => onModificar(producto.id)}>Editar</button>
                            <button className="btn btn-sm btn-outline-danger w-100" onClick={() => onEliminar(producto.id)}>Borrar</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductoCard;