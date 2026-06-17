import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase"; 
import { 
    collection, addDoc, doc, getDoc, updateDoc, deleteDoc,
    query, where, getDocs, orderBy, onSnapshot 
} from "firebase/firestore"; 
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams, useNavigate } from "react-router-dom"; 

const MAX_IMAGES = 10;

const CATEGORIAS_PRODUCTOS = [
    { 
        label: "Sonido", 
        value: "Sonido", 
        options: [
            { label: "Cabinas", value: "Cabinas" },
            { label: "Cabinas profesionales", value: "Cabinas profesionales" },
            { label: "Torres de sonido", value: "Torres de sonido" },
            { label: "Parlantes portables", value: "Parlantes portables" }
        ] 
    },
    { 
        label: "Video", 
        value: "Video",
        options: [
            { label: "Televisores", value: "Televisores" },
            { label: "Bases para Televisores", value: "Bases para Televisores" }
        ]
    },
    { 
        label: "Tecnología", 
        value: "Tecnología",
        options: [
            { label: "Computadores portátiles", value: "Computadores portátiles" },
            { label: "Gamer", value: "Gamer" },
            { label: "Celulares", value: "Celulares" },
            { label: "Tablet", value: "Tablet" },
            { label: "Monitores", value: "Monitores" },
            { label: "Accesorios", value: "Accesorios" },
            { label: "Repuestos para portátil", value: "Repuestos para portátil" }
        ]
    },
    { 
        label: "Refrigeración", 
        value: "Refrigeración",
        options: [
            { label: "Congeladores", value: "Congeladores" },
            { label: "Exhibidores", value: "Exhibidores" },
            { label: "Minibar", value: "Minibar" },
            { label: "Vitrinas", value: "Vitrinas" },
            { label: "Neveras", value: "Neveras" },
            { label: "Nevecones", value: "Nevecones" }
        ]
    },
    { 
        label: "Cocina", 
        value: "Cocina",
        options: [
            { label: "Cafeteras", value: "Cafeteras" },
            { label: "Exprimidor", value: "Exprimidor" },
            { label: "Freidora", value: "Freidora" },
            { label: "Hervidor", value: "Hervidor" },
            { label: "Hornos", value: "Hornos" },
            { label: "Licuadora", value: "Licuadora" },
            { label: "Olla Arrocera", value: "Olla Arrocera" },
            { label: "Olla a Presión", value: "Olla a Presión" }
        ]
    },
    { 
        label: "Lavado", 
        value: "Lavado", 
        options: [
            { label: "Lavadoras automáticas", value: "Lavadoras automáticas" },
            { label: "Lavadoras semiautomáticas", value: "Lavadoras semiautomáticas" }
        ] 
    },
    { 
        label: "Mueblería", 
        value: "Mueblería", 
        options: [
            { label: "Colchones", value: "Colchones" },
            { label: "Basecamas y Espaldares", value: "Basecamas y Espaldares" },
            { label: "Armario", value: "Armario" },
            { label: "Nocheros", value: "Nocheros" },
            { label: "Juegos de Sala", value: "Juegos de Sala" },
            { label: "Sofacamas", value: "Sofacamas" },
            { label: "Comedores", value: "Comedores" },
            { label: "Alacenas (Piso y Pared)", value: "Alacenas (Piso y Pared)" },
            { label: "Espejos y Tocadores", value: "Espejos y Tocadores" }
        ] 
    },
    { 
        label: "Oficina", 
        value: "Oficina", 
        options: [
            { label: "Escritorios", value: "Escritorios" },
            { label: "Sillas Ergonómicas", value: "Sillas Ergonómicas" },
            { label: "Sillas Gamer", value: "Sillas Gamer" }
        ] 
    }
];

const ESTADO_INICIAL = { 
    nombre: "", categoria: "", subcategoria: "", codigo: "", descripcion: "", 
    marca: "", imagenesUrls: [], oculto: false 
};

export default function Admin() {
    const [formData, setFormData] = useState(ESTADO_INICIAL);
    const [mensaje, setMensaje] = useState(null);
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [imagenArchivo, setImagenArchivo] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const [progreso, setProgreso] = useState(0);
    
    // Lista de la BD completa cargada de forma reactiva
    const [todosLosProductos, setTodosLosProductos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const productoId = searchParams.get("productoId"); 
    const [isEditing, setIsEditing] = useState(false); 

    const normalizarTexto = (texto) => {
        if (!texto) return '';
        return texto
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    const mostrarMensaje = (msg, tipo) => {
        setMensaje(msg);
        setTipoMensaje(tipo);
        setTimeout(() => setMensaje(null), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, categoria: value, subcategoria: "" }));
    };

    const handleRemoveImage = (indexToRemove) => {
        const newUrls = formData.imagenesUrls.filter((_, index) => index !== indexToRemove);
        setFormData(prev => ({ ...prev, imagenesUrls: newUrls }));
    };

    const handleUpload = () => {
        if (!imagenArchivo) return mostrarMensaje("Selecciona una imagen", "error");
        if (formData.imagenesUrls.length >= MAX_IMAGES) return mostrarMensaje("Límite alcanzado", "error");

        const fileName = `${Date.now()}_${imagenArchivo.name}`;
        const storageRef = ref(storage, `imagenes_productos/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, imagenArchivo);
        setSubiendo(true);

        uploadTask.on('state_changed', 
            (snapshot) => setProgreso(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
            (error) => { setSubiendo(false); mostrarMensaje(error.message, "error"); },
            () => {
                setSubiendo(false);
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setFormData(prev => ({ ...prev, imagenesUrls: [...prev.imagenesUrls, downloadURL] }));
                    setImagenArchivo(null);
                    setProgreso(0);
                    mostrarMensaje("Imagen subida con éxito", "exito");
                });
            }
        );
    };

    // Trae toda la colección sin limitadores para buscar globalmente
    useEffect(() => {
        const q = query(
            collection(db, "productos"), 
            orderBy("fechaCreacion", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTodosLosProductos(lista);
        }, (error) => {
            console.error("Error cargando productos:", error);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (productoId) {
            setIsEditing(true);
            const fetchProducto = async () => {
                const docSnap = await getDoc(doc(db, "productos", productoId));
                if (docSnap.exists()) {
                    setFormData({ ...ESTADO_INICIAL, ...docSnap.data(), id: docSnap.id });
                }
            };
            fetchProducto();
        } else {
            setIsEditing(false);
            setFormData(ESTADO_INICIAL);
        }
    }, [productoId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.imagenesUrls.length === 0) return mostrarMensaje("Sube al menos una imagen", "error");

        try {
            if (!isEditing) {
                const qCodigo = query(collection(db, "productos"), where("codigo", "==", formData.codigo.trim()));
                const querySnapshot = await getDocs(qCodigo);
                if (!querySnapshot.empty) {
                    return mostrarMensaje(`El código o referencia "${formData.codigo}" ya existe en el sistema`, "error");
                }
            }

            const dataToSave = {
                nombre: formData.nombre,
                categoria: formData.categoria,
                subcategoria: formData.subcategoria || "N/A",
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion,
                marca: formData.marca,
                imagenesUrls: formData.imagenesUrls,
                oculto: formData.oculto || false,
                fechaActualizacion: new Date()
            };

            if (isEditing) {
                await updateDoc(doc(db, "productos", productoId), dataToSave);
                mostrarMensaje("Producto modificado correctamente", "exito");
                setSearchParams({}); 
            } else {
                await addDoc(collection(db, "productos"), { ...dataToSave, fechaCreacion: new Date() });
                mostrarMensaje("Producto agregado correctamente", "exito");
            }
            
            setFormData(ESTADO_INICIAL);
        } catch (error) {
            mostrarMensaje("Error al guardar en base de datos", "error");
        }
    };

    const handleEditarTabla = (id) => {
        setSearchParams({ productoId: id });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAlternarVisibilidad = async (producto) => {
        try {
            const nuevoEstadoOculto = !producto.oculto;
            await updateDoc(doc(db, "productos", producto.id), { oculto: nuevoEstadoOculto });
            mostrarMensaje(`Producto ${nuevoEstadoOculto ? 'ocultado' : 'visible'} con éxito`, "exito");
        } catch (error) {
            mostrarMensaje("Error al cambiar estado de visibilidad", "error");
        }
    };

    const handleEliminarProducto = async (id) => {
        if (window.confirm("¿Estás completamente seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")) {
            try {
                await deleteDoc(doc(db, "productos", id));
                mostrarMensaje("Producto eliminado de la base de datos", "exito");
                if (productoId === id) setSearchParams({});
            } catch (error) {
                mostrarMensaje("Error al intentar eliminar el producto", "error");
            }
        }
    };

    const subcategoriasDisponibles = CATEGORIAS_PRODUCTOS.find(c => c.label === formData.categoria)?.options || [];

    // Filtro global reactivo
    const productosFiltrados = todosLosProductos.filter(prod => {
        if (!searchTerm.trim()) return true;
        const term = normalizarTexto(searchTerm);
        return (
            normalizarTexto(prod.codigo).includes(term) ||
            normalizarTexto(prod.nombre).includes(term) ||
            normalizarTexto(prod.marca).includes(term) ||
            normalizarTexto(prod.categoria).includes(term) ||
            normalizarTexto(prod.subcategoria).includes(term)
        );
    });

    return (
        <div className="container my-5 pb-5">
            {mensaje && (
                <div className={`alert alert-${tipoMensaje === "exito" ? "success" : "danger"} fixed-top end-0 m-4 shadow-lg`} style={{ zIndex: 1050 }}>
                    {mensaje}
                </div>
            )}

            <h2 className="mb-5 text-center text-primary fw-bold">
                {isEditing ? "MODIFICAR PRODUCTO" : "AGREGAR NUEVO PRODUCTO"}
            </h2>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <form onSubmit={handleSubmit}>
                        {/* SECCIÓN 1: Información General */}
                        <div className="card shadow-lg mb-4 border-0">
                            <div className="card-header bg-primary text-white fw-bold py-3">Información General</div>
                            <div className="card-body p-4">
                                <div className="row g-4 text-start">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">NOMBRE DEL PRODUCTO</label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" placeholder="Ej: Parlante JLC 2000W" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">MARCA</label>
                                        <input type="text" name="marca" value={formData.marca} onChange={handleChange} className="form-control" placeholder="Ej: JLC" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">CATEGORÍA PRINCIPAL</label>
                                        <select name="categoria" value={formData.categoria} onChange={handleCategoryChange} className="form-select" required>
                                            <option value="">Seleccionar Categoría...</option>
                                            {CATEGORIAS_PRODUCTOS.map(cat => <option key={cat.label} value={cat.label}>{cat.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">SUBCATEGORÍA</label>
                                        <select name="subcategoria" value={formData.subcategoria} onChange={handleChange} className="form-select" disabled={!formData.categoria}>
                                            <option value="">{subcategoriasDisponibles.length > 0 ? "Seleccione específica..." : "N/A (No requiere)"}</option>
                                            {subcategoriasDisponibles.map(sub => <option key={sub.value} value={sub.value}>{sub.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold">CÓDIGO / REFERENCIA</label>
                                        <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className="form-control" placeholder="Ej: JLC-14290" required disabled={isEditing} />
                                        {isEditing && <small className="text-muted">El código de referencia único no puede modificarse.</small>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold">DESCRIPCIÓN</label>
                                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="form-control" rows="3" placeholder="Detalles técnicos..."></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: Galería de Imágenes */}
                        <div className="card shadow-lg mb-4 border-0">
                            <div className="card-header bg-primary text-white fw-bold py-3">Galería de Imágenes</div>
                            <div className="card-body p-4 text-start">
                                <div className="row g-3 align-items-center">
                                    <div className="col-md-8">
                                        <input type="file" className="form-control" onChange={(e) => setImagenArchivo(e.target.files[0])} disabled={subiendo} />
                                    </div>
                                    <div className="col-md-4 d-grid">
                                        <button type="button" onClick={handleUpload} className="btn btn-dark fw-bold" disabled={subiendo || !imagenArchivo}>
                                            {subiendo ? `Subiendo ${progreso}%` : "Añadir Imagen"}
                                        </button>
                                    </div>
                                    <div className="d-flex flex-wrap gap-3 mt-4">
                                        {formData.imagenesUrls.map((url, index) => (
                                            <div key={index} className="position-relative border p-2 rounded bg-white shadow-sm" style={{ width: '100px' }}>
                                                <img src={url} alt="preview" style={{ width: '100%', height: '80px', objectFit: 'contain' }} />
                                                <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle m-1" style={{width: '24px', height: '24px', padding: '0'}} onClick={() => handleRemoveImage(index)}>&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-3 justify-content-center col-md-8 mx-auto mt-4 mb-5">
                            {isEditing && (
                                <button type="button" className="btn btn-secondary btn-lg fw-bold px-4 shadow-sm" onClick={() => { setFormData(ESTADO_INICIAL); setSearchParams({}); }}>
                                    CANCELAR EDICIÓN
                                </button>
                            )}
                            <button type="submit" className={`btn ${isEditing ? 'btn-warning text-dark' : 'btn-primary'} btn-lg shadow fw-bold py-3 px-5 flex-grow-1`}>
                                {isEditing ? "GUARDAR CAMBIOS" : "FINALIZAR Y GUARDAR"}
                            </button>
                        </div>
                    </form>

                    {/* SECCIÓN 3: PANEL DEL INVENTARIO GENERAL */}
                    <div className="card shadow-lg border-0 mt-5 text-start">
                        <div className="card-header bg-dark text-white fw-bold py-3">
                            <div className="row align-items-center g-3">
                                <div className="col-12 col-md-5">
                                    <span><i className="bi bi-list-stars me-2"></i> INVENTARIO GENERAL DE PRODUCTOS</span>
                                </div>
                                
                                {/* BUSCADOR TOTALMENTE LIMPIO Y ARREGLADO */}
                                <div className="col-12 col-md-5">
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-secondary border-secondary text-white">
                                            <i className="bi bi-search"></i>
                                        </span>
                                        <input 
                                            type="text" 
                                            className="form-control text-white border-secondary" 
                                            placeholder="Buscar código, producto o marca..." 
                                            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button className="btn btn-secondary border-secondary text-white" type="button" onClick={() => setSearchTerm("")}>
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="col-12 col-md-2 text-md-end">
                                    <span className="badge bg-primary">Tiempo Real</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="card-body p-0">
                            <div className="table-responsive" style={{maxHeight: '550px', overflowY: 'auto'}}>
                                <table className="table table-hover table-striped mb-0 align-middle">
                                    <thead className="table-light sticky-top" style={{zIndex: 1}}>
                                        <tr>
                                            <th className="py-3 ps-3" style={{width: '130px'}}>CÓDIGO</th>
                                            <th className="py-3">PRODUCTO</th>
                                            <th className="py-3">MARCA</th>
                                            <th className="py-3">CATEGORÍA</th>
                                            <th className="py-3">SUBCATEGORÍA</th>
                                            <th className="py-3 text-center" style={{width: '240px'}}>ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-muted">
                                                    <i className="bi bi-search d-block fs-3 mb-2"></i>
                                                    No se encontraron coincidencias para "{searchTerm}" en la base de datos.
                                                </td>
                                            </tr>
                                        ) : (
                                            productosFiltrados.map((prod) => (
                                                <tr key={prod.id} style={{opacity: prod.oculto ? 0.6 : 1}}>
                                                    <td className="fw-bold ps-3 text-secondary">{prod.codigo}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {prod.imagenesUrls && prod.imagenesUrls.length > 0 && (
                                                                <img src={prod.imagenesUrls[0]} alt="p-thumb" className="rounded border" style={{width: '35px', height: '35px', objectFit: 'contain', backgroundColor:'#fff'}} />
                                                            )}
                                                            <span className="text-dark fw-semibold text-truncate" style={{maxWidth: '180px'}} title={prod.nombre}>{prod.nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="badge bg-secondary text-light">{prod.marca}</span></td>
                                                    <td>{prod.categoria}</td>
                                                    <td><small className="text-muted">{prod.subcategoria || "N/A"}</small></td>
                                                    <td className="text-center pe-3">
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <button type="button" className="btn btn-outline-warning btn-sm fw-bold px-2" onClick={() => handleEditarTabla(prod.id)} title="Modificar">
                                                                <i className="bi bi-pencil-square"></i> Editar
                                                            </button>
                                                            
                                                            <button type="button" className={`btn btn-sm fw-bold px-2 ${prod.oculto ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => handleAlternarVisibilidad(prod)} title={prod.oculto ? "Mostrar en tienda" : "Ocultar de la tienda"}>
                                                                <i className={`bi ${prod.oculto ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i> {prod.oculto ? 'Mostrar' : 'Ocultar'}
                                                            </button>

                                                            <button type="button" className="btn btn-outline-danger btn-sm fw-bold px-2" onClick={() => handleEliminarProducto(prod.id)} title="Eliminar definitivamente">
                                                                <i className="bi bi-trash3-fill"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}