// BrandFooter.tsx - Footer dinámico con branding del tenant actual
// Build: 11 Feb 2026 - v2.312 - Fase 1 Multi-Empresa / White-Label

'use client';

import Link from 'next/link';
import { useWhiteLabel } from '@/contexts/WhiteLabelContext';
import { Logo } from './Logo';

/**
 * Footer con branding dinámico.
 * En modo white-label muestra el nombre, contacto y links del tenant.
 * En modo default muestra AS Operadora.
 */
export function BrandFooter() {
    const {
        companyName,
        footerText,
        supportEmail,
        supportPhone,
        termsUrl,
        privacyUrl,
        facebookUrl,
        instagramUrl,
        isWhiteLabel,
    } = useWhiteLabel();

    return (
        <footer className="bg-[#F7F7F7] mt-16 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="font-semibold mb-4">Empresa</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/empresa/acerca-de" className="hover:text-foreground">Acerca de</Link></li>
                            <li><Link href="/empresa/empleos" className="hover:text-foreground">Empleos</Link></li>
                            <li><Link href="/empresa/prensa" className="hover:text-foreground">Prensa</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Ayuda</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/ayuda" className="hover:text-foreground">Centro de ayuda</Link></li>
                            <li><Link href="/contacto" className="hover:text-foreground">Contáctanos</Link></li>
                            {privacyUrl ? (
                                <li><a href={privacyUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Privacidad</a></li>
                            ) : (
                                <li><Link href="/legal/privacidad" className="hover:text-foreground">Privacidad</Link></li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Términos</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {termsUrl ? (
                                <li><a href={termsUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Términos de uso</a></li>
                            ) : (
                                <li><Link href="/legal/terminos" className="hover:text-foreground">Términos de uso</Link></li>
                            )}
                            <li><Link href="/legal/cookies" className="hover:text-foreground">Política de cookies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {supportEmail && (
                                <li><a href={`mailto:${supportEmail}`} className="hover:text-foreground">{supportEmail}</a></li>
                            )}
                            {supportPhone && (
                                <li><a href={`tel:${supportPhone.replace(/\s/g, '')}`} className="hover:text-foreground">{supportPhone}</a></li>
                            )}
                            {facebookUrl && (
                                <li><a href={facebookUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                            )}
                            {instagramUrl && (
                                <li><a href={instagramUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            )}
                            {!facebookUrl && !instagramUrl && (
                                <>
                                    <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                                    <li><a href="#" className="hover:text-foreground">Instagram</a></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="border-t pt-8 text-sm text-muted-foreground text-center">
                    <p>{footerText}</p>
                    {isWhiteLabel && (
                        <p className="text-xs mt-2 opacity-60">
                            Powered by <Logo forceDefault size="sm" className="inline-flex ml-1" />
                        </p>
                    )}
                    <p className="text-xs mt-2 opacity-50">
                        v2.312 | Build: 11 Feb 2026
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default BrandFooter;
