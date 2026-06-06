// Build: 03 Jun 2026 - 17:00 CST - v2.342

import FlightSearchForm from '@/components/flights/FlightSearchForm';

export const metadata = {
  title: 'Búsqueda de Vuelos - AS Operadora',
  description: 'Busca los mejores vuelos para tus viajes corporativos.',
};

export default function VuelosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#142A4A] tracking-tight sm:text-5xl">
            Reserva tu Vuelo
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Conexión en tiempo real con nuestras aerolíneas asociadas.
          </p>
        </div>
        
        <FlightSearchForm />
      </div>
    </div>
  );
}
