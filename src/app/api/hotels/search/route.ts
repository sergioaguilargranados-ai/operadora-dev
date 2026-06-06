// Build: 03 Jun 2026 - 17:00 CST - v2.342

import { NextResponse } from 'next/server';
import { HotelAggregator } from '@/services/aggregators/HotelAggregator';
import { ParametrosBusquedaHotel } from '@/types/providers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.destino || !body.fechaEntrada || !body.fechaSalida || !body.habitaciones) {
      return NextResponse.json({
        exito: false,
        error: 'Faltan parámetros: destino, fechaEntrada, fechaSalida, habitaciones'
      }, { status: 400 });
    }

    const params: ParametrosBusquedaHotel = {
      destino: body.destino,
      fechaEntrada: body.fechaEntrada,
      fechaSalida: body.fechaSalida,
      habitaciones: body.habitaciones
    };

    const agregador = new HotelAggregator();
    const resultado = await agregador.buscarHoteles(params);

    if (!resultado.exito && (!resultado.resultados || resultado.resultados.length === 0)) {
      return NextResponse.json(resultado, { status: 500 });
    }

    return NextResponse.json(resultado);

  } catch (error: any) {
    console.error('Error en API hotels/search:', error);
    return NextResponse.json({
      exito: false,
      error: 'Error interno del servidor al procesar la búsqueda de hoteles'
    }, { status: 500 });
  }
}
