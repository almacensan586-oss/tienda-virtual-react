import React, { useState, useEffect } from 'react';
import ProductoCard from "../components/ProductoCard";
import CategoryBar from "../components/CategoryBar";
import { useNavigate } from 'react-router-dom'; 
import { db } from '../firebase'; 
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'; 

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    // Función de normalización: quita tildes, espacios y deja en minúsculas
    const normalizarTexto = (texto) => {
        if (!texto) return '';
        return texto
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    // Cargar todos los productos desde Firestore
    const fetchProductos = async () => {
        try {
            const productosCollection = collection(db, "productos");
            const snapshot = await getDocs(productosCollection);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                let imageArray = data.imagenesUrls && Array.isArray(data.imagenesUrls) 
                    ? data.imagenesUrls 
                    : (data.urlImagen ? [data.urlImagen] : []);
                return { id: doc.id, ...data, imagenesUrls: imageArray }; 
            });
        } catch (err) {
            console.error("Error al cargar productos:", err);
            throw new Error("Error de conexión con la base de datos.");
        }
    };
    
    // Eliminar un producto del catálogo
    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Eliminar este producto?")) return;
        try {
            await deleteDoc(doc(db, "productos", id));
            setAllProducts(prev => prev.filter(p => p.id !== id));
            setProductos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const modificarProducto = (id) => navigate(`/admin?productoId=${id}`); 
    const handleCategoryChange = (category) => setActiveCategory(category);

    // Efecto para inicializar la carga de datos de la tienda
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchProductos();
                setAllProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Efecto encargado del filtrado híbrido y flexible
    useEffect(() => {
        if (allProducts.length === 0) {
            setProductos([]);
            return;
        }

        if (activeCategory === "") {
            setProductos(allProducts);
        } else {
            const target = normalizarTexto(activeCategory);

            const filtered = allProducts.filter(product => {
                // Unificamos los campos de categoría y subcategoría en una sola cadena de búsqueda segura
                const categoriaProd = normalizarTexto(product.categoria);
                const subcategoriaProd = normalizarTexto(product.subcategoria);
                const textoCompletoTienda = `${categoriaProd} ${subcategoriaProd}`;

                // CASO 1: Si se hace clic en la categoría principal "Tecnología"
                if (target === 'tecnologia') {
                    // Muestra todo lo que contenga la palabra "tecnologia" en su categoría
                    // (Esto atrapará tanto "Tecnología" como "Tecnología-Celulares")
                    return categoriaProd.includes('tecnologia');
                }

                // CASO 2: Si es una subcategoría ("celulares", "gamer", "computadores portatiles")
                // Mapeo flexible para variaciones en el nombre del menú ("Portátiles" vs "Computadores portátiles")
                if (target === 'celulares' || target === 'celular') {
                    return textoCompletoTienda.includes('celular');
                }
                if (target === 'gamer') {
                    return textoCompletoTienda.includes('gamer');
                }
                if (target === 'computadores portatiles' || target === 'portatiles' || target === 'portatil') {
                    return textoCompletoTienda.includes('portatil');
                }
                if (target === 'tablet' || target === 'tablets') {
                    return textoCompletoTienda.includes('tablet');
                }
                if (target === 'monitores' || target === 'monitor') {
                    return textoCompletoTienda.includes('monitor');
                }
                if (target === 'accesorios' || target === 'accesorio') {
                    return textoCompletoTienda.includes('accesorio');
                }
                if (target === 'repuestos para portatil' || target === 'repuestos' || target === 'repuesto') {
                    return textoCompletoTienda.includes('repuesto');
                }

                // CASO POR DEFECTO: Para cualquier otra categoría del sistema (Mueblería, Cocina, Sonido, etc.)
                return categoriaProd.includes(target) || subcategoriaProd.includes(target);
            });

            setProductos(filtered);
        }
    }, [activeCategory, allProducts]);

    if (loading) return <div className="text-center my-5 fs-4 text-primary fw-bold">Cargando catálogo...</div>;
    if (error) return <div className="alert alert-danger text-center my-5 mx-auto w-50">{error}</div>;

    return (
        <div className="container-fluid px-lg-5 mt-4">
            <div className="row">
                {/* SIDEBAR IZQUIERDO */}
                <aside className="col-lg-3 col-xl-2 border-end-lg">
                    <div className="sticky-sidebar">
                        <h5 className="fw-bold mb-3 ps-2 d-none d-lg-block text-secondary">Categorías</h5>
                        <CategoryBar 
                            activeCategory={activeCategory} 
                            onCategoryChange={handleCategoryChange} 
                        />
                    </div>
                </aside>

                {/* CONTENIDO PRINCIPAL */}
                <main className="col-lg-9 col-xl-10 ps-lg-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold h4 mb-0 text-dark">
                            {activeCategory === "" ? "Todos los productos" : activeCategory}
                            <span className="badge bg-primary rounded-pill ms-2 fs-6 shadow-sm">{productos.length}</span>
                        </h2>
                    </div>

                    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-5">
                        {productos.map(producto => (
                            <ProductoCard 
                                key={producto.id} 
                                producto={producto} 
                                onEliminar={eliminarProducto} 
                                onModificar={modificarProducto} 
                            />
                        ))}
                    </div>

                    {productos.length === 0 && (
                        <div className="alert alert-light text-center border py-5 shadow-sm">
                            <i className="bi bi-search d-block fs-1 mb-3 text-muted"></i>
                            No encontramos productos en esta categoría por ahora.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}