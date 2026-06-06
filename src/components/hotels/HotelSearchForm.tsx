// Build: 03 Jun 2026 - 17:00 CST - v2.342

'use client';

import { useState } from 'react';
import { HotelUnificado } from '@/types/unified-travel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function HotelSearchForm() {
  const [destino, setDestino] = useState('');
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [adultos, setAdultos] = useState(2);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<HotelUnificado[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultados([]);

    try {
      const res = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destino: destino, // Hotelbeds: PMI, RateHawk: RegionID
          fechaEntrada: fechaEntrada,
          fechaSalida: fechaSalida,
          habitaciones: [{ adultos: adultos, edadesNinos: [] }]
        })
      });

      const data = await res.json();

      if (!res.ok || (!data.exito && data.resultados.length === 0)) {
        throw new Error(data.error || data.errores?.[0] || 'Error al buscar hoteles');
      }

      setResultados(data.resultados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-[#142A4A] mb-4">Buscar Hoteles</h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="destino">Destino</Label>
            <Input id="destino" placeholder="Ej: CUN, 12345 (RateHawk)" value={destino} onChange={(e) => setDestino(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaEntrada">Check-in</Label>
            <Input id="fechaEntrada" type="date" value={fechaEntrada} onChange={(e) => setFechaEntrada(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaSalida">Check-out</Label>
            <Input id="fechaSalida" type="date" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adultos">Huéspedes (Adultos)</Label>
            <Input id="adultos" type="number" min="1" max="10" value={adultos} onChange={(e) => setAdultos(parseInt(e.target.value))} required />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <Button type="submit" disabled={loading} className="bg-[#142A4A] text-white hover:bg-opacity-90">
              {loading ? 'Buscando Disponibilidad...' : 'Buscar Hoteles'}
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {resultados.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Hoteles Disponibles: {resultados.length}</h3>
          <div className="grid gap-4">
            {resultados.map((hotel) => {
              const mejorOferta = hotel.ofertasDisponibles[0];
              return (
                <div key={hotel.id} className="bg-white p-4 rounded-lg shadow border flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-[#142A4A]">{hotel.nombre}</h4>
                    <p className="text-sm text-yellow-500">{'⭐'.repeat(hotel.estrellas)}</p>
                    <p className="text-xs text-gray-500 mt-1">Fuente: {hotel.proveedor}</p>
                    {mejorOferta && (
                      <p className="text-sm mt-2 font-medium">Habitación: {mejorOferta.habitacion.nombre}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {mejorOferta ? (
                      <>
                        <p className="text-2xl font-bold text-green-600">
                          {mejorOferta.precioTotal.toLocaleString('es-MX', { style: 'currency', currency: mejorOferta.moneda })}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">Total por estancia</p>
                        <Button className="w-full border-none bg-[#D4AF37] hover:bg-[#b08d27] text-white">
                          Reservar Ahora
                        </Button>
                      </>
                    ) : (
                      <p className="text-gray-500">Sin tarifas disponibles</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
