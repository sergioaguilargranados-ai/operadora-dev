import { NextResponse } from 'next/server';
import { verifyToken } from '@/services/AuthService';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    // Simulamos el descubrimiento de propiedades desde un API externo (ej. Hotelbeds)
    const totalHotels = 5000;
    const batchSize = 50;
    const totalBatches = Math.ceil(totalHotels / batchSize);

    return NextResponse.json({ 
      success: true, 
      total: totalHotels, 
      batchSize,
      totalBatches,
      message: 'Descubrimiento completado.'
    });
  } catch (error) {
    console.error('Error starting hotel sync:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
