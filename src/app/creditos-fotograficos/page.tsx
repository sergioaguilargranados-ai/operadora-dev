import React from 'react';
import { PageHeader } from '@/components/PageHeader';

export default function CreditosFotograficosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader showBackButton={true} backButtonHref="/" />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Créditos Fotográficos</h1>
          
          <div className="prose prose-blue max-w-none text-gray-600">
            <p className="text-lg mb-8">
              En nuestra plataforma valoramos profundamente el trabajo de los fotógrafos de todo el mundo que capturan la belleza de nuestros destinos. Queremos agradecer a las siguientes plataformas y a su comunidad de creadores por proporcionar el contenido visual que enriquece nuestros itinerarios.
            </p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Pexels */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <img 
                  src="https://images.pexels.com/lib/api/pexels.png" 
                  alt="Pexels Logo" 
                  className="h-8 mb-4 object-contain"
                />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Pexels</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Gran parte de nuestras imágenes de alta resolución son proporcionadas por la increíble comunidad de fotógrafos de Pexels.
                </p>
                <a 
                  href="https://www.pexels.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Visitar Pexels &rarr;
                </a>
              </div>

              {/* Unsplash */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-8 w-8 text-black" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path>
                  </svg>
                  <span className="font-bold text-xl text-black tracking-tight">Unsplash</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Unsplash</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Utilizamos Unsplash como fuente de inspiración visual y fotografías paisajísticas de primera calidad de creadores globales.
                </p>
                <a 
                  href="https://unsplash.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Visitar Unsplash &rarr;
                </a>
              </div>

              {/* Pixabay */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <img 
                  src="https://pixabay.com/static/img/logo_square.png" 
                  alt="Pixabay Logo" 
                  className="h-8 mb-4 object-contain grayscale opacity-80"
                />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Pixabay</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Algunas de nuestras imágenes y recursos visuales también provienen del amplio catálogo libre de regalías de Pixabay.
                </p>
                <a 
                  href="https://pixabay.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Visitar Pixabay &rarr;
                </a>
              </div>
            </div>

            <div className="mt-12 p-6 bg-blue-50/50 rounded-xl border border-blue-100 text-sm">
              <h3 className="font-semibold text-blue-900 mb-2">Derechos de Autor</h3>
              <p className="text-blue-800/80">
                Todas las imágenes utilizadas a través de estas APIs están bajo sus respectivas licencias que permiten el uso comercial. No reclamamos la propiedad de ninguna de estas imágenes. Nuestro sistema de Inteligencia Artificial procura seleccionar paisajes y arquitectura, priorizando fotografías donde no aparezcan rostros de personas por respeto a la privacidad.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
