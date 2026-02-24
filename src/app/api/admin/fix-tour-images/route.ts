// API para limpiar imágenes genéricas de categoría en tours existentes
// Build: 24 Feb 2026 - v2.327c
// Las imágenes de categoría (europa, asia, etc) fueron guardadas como main_image
// cuando el scraping no encontraba una imagen específica del tour.
// Este endpoint las limpia para que el próximo scrape las actualice correctamente.
// MEJORADO: También filtra gallery_images contaminadas y busca imágenes del CDN real.

import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Función para verificar si una imagen es genérica (no pertenece al tour)
function isGenericImage(imageUrl: string, tourCode: string): boolean {
    const urlLower = (imageUrl || '').toLowerCase();
    const codeOnly = tourCode.replace('MT-', '');

    // Si la imagen contiene el código del tour, NO es genérica
    if (urlLower.includes(codeOnly)) {
        return false;
    }

    // Patrones de imágenes genéricas de categoría
    const genericPatterns = [
        'europa', 'asia', 'turquia', 'japon', 'corea', 'medio-oriente',
        'dubai', 'egipto', 'sudamerica', 'usa-', 'canada', 'cruceros',
        'africa', 'mexico', 'balcanes', 'centroamerica', 'caribe',
        'alaska', 'india', 'china', 'rusia', 'australia', 'oceania',
        'marruecos', 'peru', 'colombia', 'brasil', 'argentina', 'chile',
        'escandinavia', 'mediterraneo', 'oriental', 'norteamerica',
        'tierra-santa', 'israel', 'grecia', 'italia', 'espana', 'francia',
        'bellezasde', 'banner-mega', 'celebrity-millennium', 'celebrity-milennium'
    ];

    // Si está en /covers/ y contiene un patrón genérico, es genérica
    if (urlLower.includes('/covers/')) {
        const isGeneric = genericPatterns.some(pattern => urlLower.includes(pattern));
        if (isGeneric) return true;
    }

    // URL construida sin verificar: /covers/12345-cover.jpg
    if (urlLower.match(/\/covers\/\d+-cover\.jpg$/)) {
        return true;
    }

    return false;
}

// Función para encontrar la mejor imagen de un tour en su galería
function findBestImage(gallery: string[], tourCode: string): string | null {
    const codeOnly = tourCode.replace('MT-', '');

    // Prioridad 1: Imagen de galería que contenga el código del tour
    const withCode = gallery.find(img => img.includes(codeOnly));
    if (withCode) return withCode;

    // Prioridad 2: Primera imagen que NO sea genérica
    const nonGeneric = gallery.find(img => !isGenericImage(img, tourCode));
    if (nonGeneric) return nonGeneric;

    // Sin imágenes válidas
    return null;
}

/**
 * GET /api/admin/fix-tour-images
 * Identifica tours con imágenes genéricas de categoría
 * Muestra tanto main_image como gallery_images contaminadas
 */
export async function GET() {
    try {
        const result = await pool.query(`
            SELECT mt_code, name, main_image, gallery_images, map_image
            FROM megatravel_packages 
            ORDER BY name
        `);

        const allTours = result.rows;
        const affectedTours: any[] = [];

        for (const tour of allTours) {
            const mainImage = tour.main_image || '';
            const gallery: string[] = tour.gallery_images || [];
            const code = tour.mt_code || '';

            const mainIsGeneric = mainImage ? isGenericImage(mainImage, code) : false;
            const genericGalleryImages = gallery.filter((img: string) => isGenericImage(img, code));
            const cleanGalleryImages = gallery.filter((img: string) => !isGenericImage(img, code));

            if (mainIsGeneric || genericGalleryImages.length > 0) {
                const bestReplacement = mainIsGeneric ? findBestImage(cleanGalleryImages, code) : null;

                affectedTours.push({
                    code: tour.mt_code,
                    name: tour.name,
                    mainImage: mainImage,
                    mainIsGeneric,
                    genericGalleryCount: genericGalleryImages.length,
                    cleanGalleryCount: cleanGalleryImages.length,
                    genericGalleryImages: genericGalleryImages.map((img: string) => img.substring(0, 100)),
                    suggestedMainReplacement: bestReplacement ? bestReplacement.substring(0, 100) : '(none - will be null)',
                });
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                totalTours: allTours.length,
                affectedTours: affectedTours.length,
                withMainGeneric: affectedTours.filter(t => t.mainIsGeneric).length,
                withContaminatedGallery: affectedTours.filter(t => t.genericGalleryCount > 0).length,
                withReplacement: affectedTours.filter(t => t.suggestedMainReplacement && !t.suggestedMainReplacement.includes('none')).length,
            },
            affected: affectedTours
        });
    } catch (error: any) {
        console.error('Error checking tour images:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/fix-tour-images
 * Limpia imágenes genéricas:
 * 1. Reemplaza main_image con la mejor imagen no-genérica de galería
 * 2. Filtra gallery_images para remover imágenes genéricas
 * 3. Si no hay reemplazo, pone main_image = null
 */
export async function POST() {
    try {
        const result = await pool.query(`
            SELECT mt_code, name, main_image, gallery_images
            FROM megatravel_packages 
            ORDER BY name
        `);

        const allTours = result.rows;
        const results: any[] = [];

        for (const tour of allTours) {
            const mainImage = tour.main_image || '';
            const gallery: string[] = tour.gallery_images || [];
            const code = tour.mt_code || '';

            const mainIsGeneric = mainImage ? isGenericImage(mainImage, code) : false;
            const genericGalleryImages = gallery.filter((img: string) => isGenericImage(img, code));

            // Si no hay nada que arreglar, skip
            if (!mainIsGeneric && genericGalleryImages.length === 0) continue;

            const cleanGallery = gallery.filter((img: string) => !isGenericImage(img, code));
            let newMainImage = mainImage;
            let action = '';

            if (mainIsGeneric) {
                const bestImage = findBestImage(cleanGallery, code);
                if (bestImage) {
                    newMainImage = bestImage;
                    action = `main replaced: ${mainImage.substring(0, 60)} → ${bestImage.substring(0, 60)}`;
                } else {
                    newMainImage = '';
                    action = `main cleared (no valid alternatives), was: ${mainImage.substring(0, 80)}`;
                }
            }

            // Actualizar en BD
            await pool.query(
                `UPDATE megatravel_packages 
                 SET main_image = NULLIF($1, ''), 
                     gallery_images = $2,
                     updated_at = NOW() 
                 WHERE mt_code = $3`,
                [newMainImage, cleanGallery, code]
            );

            results.push({
                code,
                name: tour.name,
                action,
                galleryBefore: gallery.length,
                galleryAfter: cleanGallery.length,
                genericRemoved: genericGalleryImages.length,
            });
        }

        return NextResponse.json({
            success: true,
            summary: {
                totalChecked: allTours.length,
                totalFixed: results.length,
            },
            results
        });
    } catch (error: any) {
        console.error('Error fixing tour images:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
