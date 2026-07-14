export const CollectionsSection = () => {
  const collections = [
    {
      name: "Anillos de Compromiso",
      description: "Diamantes certificados en monturas de oro blanco y rosa",
      image: "https://images.unsplash.com/photo-1669485202867-429910d63ca3?w=600&q=80",
      accent: "bg-finas-pink",
    },
    {
      name: "Collares Exclusivos",
      description: "Diseños únicos que realzan tu elegancia natural",
      image: "https://images.unsplash.com/photo-1663044962650-6a2c26c117d6?w=600&q=80",
      accent: "bg-finas-gold",
    },
    {
      name: "Pulseras de Lujo",
      description: "Piezas artesanales que combinan tradición y modernidad",
      image: "https://images.unsplash.com/photo-1598463427387-9d7a2283bb9f?w=600&q=80",
      accent: "bg-finas-gray",
    },
    {
      name: "Aretes Sofisticados",
      description: "Detalles que completan tu look con distinción",
      image: "https://images.unsplash.com/photo-1664426558455-d4e5f0393275?w=600&q=80",
      accent: "bg-finas-pink-deep",
    },
  ];

  return (
    <section id="colecciones" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-finas-gold text-sm tracking-[0.3em] uppercase mb-4">
            Nuestras Colecciones
          </p>
          <h2 className="font-gravitas text-4xl md:text-5xl lg:text-6xl text-finas-black mb-6">
            Piezas que enamoran
          </h2>
          <p className="text-finas-gray max-w-2xl mx-auto">
            Cada joya es una obra de arte, cuidadosamente diseñada para capturar
            momentos inolvidables y expresar tu personalidad única.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection, index) => (
            <a
              key={collection.name}
              href={`https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20ver%20la%20colecci%C3%B3n%20de%20${encodeURIComponent(collection.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-finas-marble-white hover:shadow-2xl transition-all duration-500 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-finas-black/0 group-hover:bg-finas-black/20 transition-all duration-500" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-gravitas text-xl text-finas-black mb-2 group-hover:text-finas-gold transition-colors duration-300">
                  {collection.name}
                </h3>
                <p className="text-finas-gray text-sm leading-relaxed">
                  {collection.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-finas-gold text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span>Explorar</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
