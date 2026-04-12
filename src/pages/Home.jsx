import React from 'react';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Home() {
  // Imágenes reales de tecnología y hogar para tu carrusel
  const ofertas = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&h=450&auto=format&fit=crop",
      title: "Audio de Alta Fidelidad",
      desc: "Parlantes y sistemas de sonido JLC con garantía certificada."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&h=450&auto=format&fit=crop",
      title: "Lo Último en Computación",
      desc: "Portátiles Dell y Lenovo para estudio y trabajo pesado."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1200&h=450&auto=format&fit=crop",
      title: "Cine en tu Sala",
      desc: "Smart TVs 4K de última generación en oferta especial."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&h=450&auto=format&fit=crop",
      title: "Hogar Moderno",
      desc: "Electrodomésticos y estufas de alto rendimiento."
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&h=450&auto=format&fit=crop",
      title: "Muebles y Escritorios",
      desc: "Organiza tu espacio con estilo y comodidad."
    }
  ];

  return (
    <div className="container text-center my-4">
      
      {/* Carrusel de Ofertas */}
      <Carousel fade className="mb-5 shadow-lg rounded overflow-hidden mt-3">
        {ofertas.map((item) => (
          <Carousel.Item key={item.id} interval={3500}>
            <img
              className="d-block w-100"
              src={item.image}
              alt={item.title}
              style={{ 
                height: '450px', 
                objectFit: 'cover',
                filter: 'brightness(0.8)' // Oscurece un poco la imagen para leer mejor el texto
              }}
            />
            <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-3 d-none d-md-block shadow">
              <h3 className="fw-bold text-white">{item.title}</h3>
              <p className="fs-5">{item.desc}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Hero Section */}
      <div className="p-5 bg-white rounded-3 shadow-sm border mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">
          ¡Bienvenido a Mi Almacén! 🛍️
        </h1>
        <p className="fs-5 text-muted mb-4">
          Tu destino para los mejores productos de Audio, Tecnología y Electrodomésticos.
        </p>
        <Link to="/productos" className="btn btn-primary btn-lg px-5 shadow-sm">
          Ver Productos Ahora
        </Link>
      </div>
      
      {/* Sección Informativa */}
      <div className="row mt-5 g-4 text-center">
        <div className="col-md-4">
          <div className="p-4 h-100 border-top border-primary border-4 shadow-sm bg-light rounded">
            <h3 className="fw-bold">Calidad Garantizada</h3>
            <p className="text-muted">Marcas líderes y garantía oficial en cada compra.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 h-100 border-top border-primary border-4 shadow-sm bg-light rounded">
            <h3 className="fw-bold">Atención Personalizada</h3>
            <p className="text-muted">Cotiza al instante a través de nuestro botón de WhatsApp.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 h-100 border-top border-primary border-4 shadow-sm bg-light rounded">
            <h3 className="fw-bold">Novedades Semanales</h3>
            <p className="text-muted">Inventario actualizado con lo último en tecnología.</p>
          </div>
        </div>
      </div>
    </div>
  );
}