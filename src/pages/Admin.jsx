import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase"; 
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore"; 
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSearchParams, useNavigate } from "react-router-dom"; 

const MAX_IMAGES = 10;

// Estructura completa basada en tus menús laterales reales
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

export default function Admin() {
    const [formData, setFormData] = useState({ 
        nombre: "", categoria: "", subcategoria: "", codigo: "", descripcion: "", 
        marca: "", imagenesUrls: []   
    });
    const [mensaje, setMensaje] = useState(null);
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [imagenArchivo, setImagenArchivo] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const [progreso, setProgreso] = useState(0);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const productoId = searchParams.get("productoId"); 
    const [isEditing, setIsEditing] = useState(false); 

    const mostrarMensaje = (msg, tipo) => {
        setMensaje(msg);
        setTipoMensaje(tipo);
        setTimeout(() => setMensaje(null), 4000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoriaChange = (e) => {
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

    useEffect(() => {
        if (productoId) {
            setIsEditing(true);
            const fetchProducto = async () => {
                const docSnap = await getDoc(doc(db, "productos", productoId));
                if (docSnap.exists()) {
                    setFormData({ ...docSnap.data(), id: docSnap.id });
                }
            };
            fetchProducto();
        }
    }, [productoId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.imagenesUrls.length === 0) return mostrarMensaje("Sube al menos una imagen", "error");

        try {
            const dataToSave = {
                nombre: formData.nombre,
                categoria: formData.categoria,
                subcategoria: formData.subcategoria,
                codigo: formData.codigo,
                descripcion: formData.descripcion,
                marca: formData.marca,
                imagenesUrls: formData.imagenesUrls,
                fechaActualizacion: new Date()
            };

            if (isEditing) {
                await updateDoc(doc(db, "productos", productoId), dataToSave);
                mostrarMensaje("Producto modificado correctamente", "exito");
            } else {
                await addDoc(collection(db, "productos"), { ...dataToSave, fechaCreacion: new Date() });
                mostrarMensaje("Producto agregado correctamente", "exito");
            }
            setTimeout(() => navigate("/admin"), 1500);
        } catch (error) {
            mostrarMensaje("Error al guardar en base de datos", "error");
        }
    };

    const subcategoriasDisponibles = CATEGORIAS_PRODUCTOS.find(c => c.label === formData.categoria)?.options || [];

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
                                        <select name="categoria" value={formData.categoria} onChange={handleCategoriaChange} className="form-select" required>
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
                                        <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className="form-control" placeholder="Ej: JLC-14290" required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold">DESCRIPCIÓN</label>
                                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="form-control" rows="3" placeholder="Detalles técnicos..."></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

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

                        <div className="d-grid gap-2 col-md-6 mx-auto mt-5 pb-5">
                            <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'} btn-lg shadow fw-bold py-3`}>
                                {isEditing ? "GUARDAR CAMBIOS" : "FINALIZAR Y GUARDAR"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}