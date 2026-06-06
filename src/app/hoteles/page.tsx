// Build: 03 Jun 2026 - 17:00 CST - v2.342

import HotelSearchForm from '@/components/hotels/HotelSearchForm';

export const metadata = {
  title: 'Búsqueda de Hoteles - AS Operadora',
  description: 'Encuentra las mejores opciones de alojamiento mundial.',
};

export default function HotelesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#142A4A] tracking-tight sm:text-5xl">
            Reserva tu Hotel
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Acceso en vivo a miles de tarifas en Hotelbeds y RateHawk.
          </p>
        </div>
        
        <HotelSearchForm />
      </div>
    </div>
  );
}
