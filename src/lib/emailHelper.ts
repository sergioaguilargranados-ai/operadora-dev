/**
 * EMAIL HELPER
 * Funciones helper para enviar correos con templates
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Crear transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS?.replace(/^"|"$/g, '') // Remover comillas si existen
        }
    });
};

// Renderizar template
const renderTemplate = (templateName: string, variables: Record<string, any>): string => {
    try {
        // Leer template base
        const basePath = path.join(process.cwd(), 'src', 'templates', 'email', 'base-template.html');
        const contentPath = path.join(process.cwd(), 'src', 'templates', 'email', `${templateName}.html`);

        let baseTemplate = fs.readFileSync(basePath, 'utf-8');
        let contentTemplate = fs.readFileSync(contentPath, 'utf-8');

        // Manejar condicionales {{#if VAR}}...{{/if}}
        contentTemplate = contentTemplate.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
            return variables[varName] ? content : '';
        });

        // Manejar loops {{#each ARRAY}}...{{/each}}
        contentTemplate = contentTemplate.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, varName, itemTemplate) => {
            const array = variables[varName];
            if (!Array.isArray(array)) return '';
            return array.map(item => {
                let rendered = itemTemplate;
                if (typeof item === 'object') {
                    Object.keys(item).forEach(key => {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        rendered = rendered.replace(regex, String(item[key] || ''));
                    });
                } else {
                    rendered = itemTemplate.replace(/{{this}}/g, String(item));
                }
                return rendered;
            }).join('');
        });

        // Reemplazar variables en contenido
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            const value = variables[key];
            // No reemplazar si es un array (ya se manejó en loops)
            if (!Array.isArray(value)) {
                contentTemplate = contentTemplate.replace(regex, String(value || ''));
            }
        });

        // Insertar contenido en base
        let finalHtml = baseTemplate.replace('{{CONTENT}}', contentTemplate);

        // Reemplazar variables globales
        const globalVars: Record<string, any> = {
            ...variables,
            APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://app.asoperadora.com',
            UNSUBSCRIBE_URL: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.asoperadora.com'}/unsubscribe?email=${variables.EMAIL || ''}`,
            SUBJECT: variables.SUBJECT || 'Notificación de AS Operadora'
        };

        Object.keys(globalVars).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            const value = globalVars[key];
            if (!Array.isArray(value)) {
                finalHtml = finalHtml.replace(regex, String(value || ''));
            }
        });

        return finalHtml;
    } catch (error) {
        console.error(`Error rendering template ${templateName}:`, error);
        throw error;
    }
};

// Enviar correo y guardar en Centro de Comunicación
export const sendEmail = async (options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    userId?: number;
    bookingId?: number;
    messageType?: string;
}): Promise<boolean> => {
    try {
        const transporter = createTransporter();

        const result = await transporter.sendMail({
            from: `"AS Operadora" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.subject
        });

        console.log(`✅ Email enviado a: ${options.to}`);

        // Guardar en Centro de Comunicación
        try {
            const { query } = await import('@/lib/db');

            // Insertar en message_deliveries para tracking
            await query(
                `INSERT INTO message_deliveries
                 (message_id, channel, recipient, status, provider, provider_message_id, sent_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())
                 ON CONFLICT DO NOTHING`,
                [
                    0, // message_id temporal (se actualizará si se crea thread)
                    'email',
                    options.to,
                    'sent',
                    'smtp',
                    result.messageId || `smtp-${Date.now()}`
                ]
            );

            console.log(`📝 Correo registrado en Centro de Comunicación`);
        } catch (dbError) {
            console.error('⚠️ Error guardando en Centro de Comunicación:', dbError);
            // No fallar el envío si falla el guardado
        }

        return true;
    } catch (error) {
        console.error(`❌ Error enviando email a ${options.to}:`, error);
        return false;
    }
};

// Enviar correo de bienvenida
export const sendWelcomeEmail = async (data: {
    name: string;
    email: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('welcome', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            SUBJECT: '¡Bienvenido a AS Operadora!'
        });

        return await sendEmail({
            to: data.email,
            subject: '¡Bienvenido a AS Operadora! 🎉',
            html
        });
    } catch (error) {
        console.error('Error enviando correo de bienvenida:', error);
        return false;
    }
};

// Enviar confirmación de reserva
export const sendBookingConfirmationEmail = async (data: {
    name: string;
    email: string;
    bookingId: number;
    serviceName: string;
    bookingDate: string;
    travelDate?: string;
    passengers?: number;
    destination?: string;
    totalPrice: number;
    currency: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('booking-confirmed', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            BOOKING_ID: data.bookingId,
            SERVICE_NAME: data.serviceName,
            BOOKING_DATE: data.bookingDate,
            TRAVEL_DATE: data.travelDate,
            PASSENGERS: data.passengers,
            DESTINATION: data.destination,
            TOTAL_PRICE: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.totalPrice),
            CURRENCY: data.currency,
            SUBJECT: `Confirmación de Reserva #${data.bookingId}`
        });

        return await sendEmail({
            to: data.email,
            subject: `Confirmación de Reserva #${data.bookingId} - AS Operadora`,
            html
        });
    } catch (error) {
        console.error('Error enviando confirmación de reserva:', error);
        return false;
    }
};

// Enviar confirmación de pago
export const sendPaymentConfirmationEmail = async (data: {
    name: string;
    email: string;
    bookingId: number;
    amount: number;
    currency: string;
    paymentDate: string;
    paymentMethod: string;
    transactionId: string;
    serviceName?: string;
    travelDate?: string;
    remainingBalance?: number;
    dueDate?: string;
    invoiceAvailable?: boolean;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('payment-confirmed', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            BOOKING_ID: data.bookingId,
            AMOUNT: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.amount),
            CURRENCY: data.currency,
            PAYMENT_DATE: data.paymentDate,
            PAYMENT_METHOD: data.paymentMethod,
            TRANSACTION_ID: data.transactionId,
            SERVICE_NAME: data.serviceName,
            TRAVEL_DATE: data.travelDate,
            REMAINING_BALANCE: data.remainingBalance ? new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.remainingBalance) : undefined,
            DUE_DATE: data.dueDate,
            INVOICE_AVAILABLE: data.invoiceAvailable,
            SUBJECT: `Pago Confirmado - Reserva #${data.bookingId}`
        });

        return await sendEmail({
            to: data.email,
            subject: `Pago Confirmado - Reserva #${data.bookingId}`,
            html
        });
    } catch (error) {
        console.error('Error enviando confirmación de pago:', error);
        return false;
    }
};

// Enviar cotización
export const sendQuoteEmail = async (data: {
    name: string;
    email: string;
    quoteId: string;
    destination: string;
    travelDates: string;
    duration: string;
    passengers: number;
    roomType?: string;
    inclusions?: string[];
    totalPrice: number;
    pricePerPerson: number;
    currency: string;
    expiryDate: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('quote-sent', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            QUOTE_ID: data.quoteId,
            DESTINATION: data.destination,
            TRAVEL_DATES: data.travelDates,
            DURATION: data.duration,
            PASSENGERS: data.passengers,
            ROOM_TYPE: data.roomType,
            INCLUSIONS: data.inclusions,
            TOTAL_PRICE: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.totalPrice),
            PRICE_PER_PERSON: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.pricePerPerson),
            CURRENCY: data.currency,
            EXPIRY_DATE: data.expiryDate,
            SUBJECT: `Tu Cotización #${data.quoteId}`
        });

        return await sendEmail({
            to: data.email,
            subject: `Tu Cotización #${data.quoteId} - AS Operadora`,
            html
        });
    } catch (error) {
        console.error('Error enviando cotización:', error);
        return false;
    }
};

// ================================================================
// FUNCIONES ADICIONALES - ALTA PRIORIDAD
// ================================================================

// 5. Recordatorio de Cotización
export const sendQuoteReminderEmail = async (data: {
    name: string;
    email: string;
    quoteId: string;
    destination: string;
    travelDates: string;
    passengers: number;
    totalPrice: number;
    currency: string;
    expiryDate: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('quote-reminder', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            QUOTE_ID: data.quoteId,
            DESTINATION: data.destination,
            TRAVEL_DATES: data.travelDates,
            PASSENGERS: data.passengers,
            TOTAL_PRICE: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.totalPrice),
            CURRENCY: data.currency,
            EXPIRY_DATE: data.expiryDate,
            SUBJECT: `⏰ Tu cotización #${data.quoteId} está por expirar`
        });

        return await sendEmail({
            to: data.email,
            subject: `⏰ Recordatorio: Cotización #${data.quoteId} - AS Operadora`,
            html
        });
    } catch (error) {
        console.error('Error enviando recordatorio de cotización:', error);
        return false;
    }
};

// 6. Cambio en Itinerario
export const sendItineraryChangeEmail = async (data: {
    name: string;
    email: string;
    bookingId: number;
    serviceName: string;
    travelDate: string;
    passengers: number;
    changeType?: string;
    changeDescription?: string;
    oldFlightInfo?: string;
    newFlightInfo?: string;
    oldHotelInfo?: string;
    newHotelInfo?: string;
    oldDate?: string;
    newDate?: string;
    changeReason: string;
    priceChange?: boolean;
    totalPrice?: number;
    priceDifference?: number;
    priceIncrease?: boolean;
    priceDecrease?: boolean;
    currency?: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('itinerary-change', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            BOOKING_ID: data.bookingId,
            SERVICE_NAME: data.serviceName,
            TRAVEL_DATE: data.travelDate,
            PASSENGERS: data.passengers,
            CHANGE_TYPE_FLIGHT: data.changeType === 'flight',
            CHANGE_TYPE_HOTEL: data.changeType === 'hotel',
            CHANGE_TYPE_DATE: data.changeType === 'date',
            CHANGE_DESCRIPTION: data.changeDescription,
            OLD_FLIGHT_INFO: data.oldFlightInfo,
            NEW_FLIGHT_INFO: data.newFlightInfo,
            OLD_HOTEL_INFO: data.oldHotelInfo,
            NEW_HOTEL_INFO: data.newHotelInfo,
            OLD_DATE: data.oldDate,
            NEW_DATE: data.newDate,
            CHANGE_REASON: data.changeReason,
            PRICE_CHANGE: data.priceChange,
            TOTAL_PRICE: data.totalPrice ? new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.totalPrice) : '',
            PRICE_DIFFERENCE: data.priceDifference ? new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.priceDifference) : '',
            PRICE_INCREASE: data.priceIncrease,
            PRICE_DECREASE: data.priceDecrease,
            CURRENCY: data.currency || 'MXN',
            SUBJECT: `Cambio en tu Reserva #${data.bookingId}`
        });

        return await sendEmail({
            to: data.email,
            subject: `📢 Cambio en tu Reserva #${data.bookingId} - AS Operadora`,
            html
        });
    } catch (error) {
        console.error('Error enviando notificación de cambio:', error);
        return false;
    }
};

// 7. Documentos Listos
export const sendDocumentsReadyEmail = async (data: {
    name: string;
    email: string;
    bookingId: number;
    serviceName: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    passengers: number;
    hasFlightTickets?: boolean;
    hasHotelVouchers?: boolean;
    hasTourVouchers?: boolean;
    hasTransferVouchers?: boolean;
    hasInsurance?: boolean;
    hasItinerary?: boolean;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('documents-ready', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            BOOKING_ID: data.bookingId,
            SERVICE_NAME: data.serviceName,
            DESTINATION: data.destination,
            DEPARTURE_DATE: data.departureDate,
            RETURN_DATE: data.returnDate,
            PASSENGERS: data.passengers,
            HAS_FLIGHT_TICKETS: data.hasFlightTickets,
            HAS_HOTEL_VOUCHERS: data.hasHotelVouchers,
            HAS_TOUR_VOUCHERS: data.hasTourVouchers,
            HAS_TRANSFER_VOUCHERS: data.hasTransferVouchers,
            HAS_INSURANCE: data.hasInsurance,
            HAS_ITINERARY: data.hasItinerary,
            SUBJECT: `Documentos Listos - Reserva #${data.bookingId}`
        });

        return await sendEmail({
            to: data.email,
            subject: `📄 Tus Documentos están Listos - Reserva #${data.bookingId}`,
            html
        });
    } catch (error) {
        console.error('Error enviando notificación de documentos:', error);
        return false;
    }
};

// 8. Recordatorio Pre-Viaje
export const sendPreTripReminderEmail = async (data: {
    name: string;
    email: string;
    bookingId: number;
    destination: string;
    departureDate: string;
    daysUntilTrip: number;
    airline?: string;
    flightNumber?: string;
    departureTime?: string;
    departureAirport?: string;
    arrivalTime?: string;
    arrivalAirport?: string;
    checkinInfo?: string;
    baggageAllowance?: string;
    covidRequirements?: string;
    weatherInfo?: string;
    timezoneInfo?: string;
    languageInfo?: string;
    currencyInfo?: string;
    safetyTips?: string;
    hasHotel?: boolean;
    hotelName?: string;
    hotelAddress?: string;
    hotelCheckinDate?: string;
    hotelCheckinTime?: string;
    hotelCheckoutDate?: string;
    hotelCheckoutTime?: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('pre-trip-reminder', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            BOOKING_ID: data.bookingId,
            DESTINATION: data.destination,
            DEPARTURE_DATE: data.departureDate,
            DAYS_UNTIL_TRIP: data.daysUntilTrip,
            AIRLINE: data.airline,
            FLIGHT_NUMBER: data.flightNumber,
            DEPARTURE_TIME: data.departureTime,
            DEPARTURE_AIRPORT: data.departureAirport,
            ARRIVAL_TIME: data.arrivalTime,
            ARRIVAL_AIRPORT: data.arrivalAirport,
            CHECKIN_INFO: data.checkinInfo,
            BAGGAGE_ALLOWANCE: data.baggageAllowance,
            COVID_REQUIREMENTS: data.covidRequirements,
            WEATHER_INFO: data.weatherInfo,
            TIMEZONE_INFO: data.timezoneInfo,
            LANGUAGE_INFO: data.languageInfo,
            CURRENCY_INFO: data.currencyInfo,
            SAFETY_TIPS: data.safetyTips,
            HAS_HOTEL: data.hasHotel,
            HOTEL_NAME: data.hotelName,
            HOTEL_ADDRESS: data.hotelAddress,
            HOTEL_CHECKIN_DATE: data.hotelCheckinDate,
            HOTEL_CHECKIN_TIME: data.hotelCheckinTime,
            HOTEL_CHECKOUT_DATE: data.hotelCheckoutDate,
            HOTEL_CHECKOUT_TIME: data.hotelCheckoutTime,
            SUBJECT: `¡Tu viaje a ${data.destination} está próximo!`
        });

        return await sendEmail({
            to: data.email,
            subject: `✈️ Tu viaje a ${data.destination} es en ${data.daysUntilTrip} días!`,
            html
        });
    } catch (error) {
        console.error('Error enviando recordatorio pre-viaje:', error);
        return false;
    }
};

// ================================================================
// FUNCIONES ADICIONALES - MEDIA PRIORIDAD
// ================================================================

// 9. Recuperar Contraseña
export const sendPasswordResetEmail = async (data: {
    name: string;
    email: string;
    resetUrl: string;
    expiryTime: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('password-reset', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            RESET_URL: data.resetUrl,
            EXPIRY_TIME: data.expiryTime,
            SUBJECT: 'Recuperación de Contraseña'
        });

        return await sendEmail({
            to: data.email,
            subject: '🔐 Recuperación de Contraseña - AS Operadora',
            html
        });
    } catch (error) {
        console.error('Error enviando recuperación de contraseña:', error);
        return false;
    }
};

// 10. Verificación de Email
export const sendEmailVerificationEmail = async (data: {
    name: string;
    email: string;
    verificationUrl: string;
    expiryTime: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('email-verification', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            VERIFICATION_URL: data.verificationUrl,
            EXPIRY_TIME: data.expiryTime,
            SUBJECT: 'Verifica tu Email'
        });

        return await sendEmail({
            to: data.email,
            subject: '✉️ Verifica tu Email - AS Operadora',
            html
        });
    } catch (error) {
        console.error('Error enviando verificación de email:', error);
        return false;
    }
};

// 11. Encuesta Post-Viaje
export const sendPostTripSurveyEmail = async (data: {
    name: string;
    email: string;
    destination: string;
    travelDates: string;
    surveyUrl: string;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('post-trip-survey', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            DESTINATION: data.destination,
            TRAVEL_DATES: data.travelDates,
            SURVEY_URL: data.surveyUrl,
            SUBJECT: '¿Cómo estuvo tu viaje?'
        });

        return await sendEmail({
            to: data.email,
            subject: `🌟 ¿Cómo estuvo tu viaje a ${data.destination}?`,
            html
        });
    } catch (error) {
        console.error('Error enviando encuesta post-viaje:', error);
        return false;
    }
};

// ================================================================
// FUNCIONES ADICIONALES - BAJA PRIORIDAD
// ================================================================

// 12. Newsletter
export const sendNewsletterEmail = async (data: {
    name: string;
    email: string;
    month: string;
    year: string;
    featuredDestination: string;
    featuredDescription: string;
    featuredImage?: string;
    offers: Array<{
        destination: string;
        description: string;
        price: number;
        currency: string;
        dates: string;
        duration: string;
        discount?: number;
        includes: string[];
        link: string;
    }>;
    travelTips?: Array<{
        title: string;
        content: string;
    }>;
    upcomingDestinations?: Array<{
        emoji: string;
        name: string;
        price: number;
        currency: string;
    }>;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('newsletter', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            MONTH: data.month,
            YEAR: data.year,
            FEATURED_DESTINATION: data.featuredDestination,
            FEATURED_DESCRIPTION: data.featuredDescription,
            FEATURED_IMAGE: data.featuredImage,
            OFFERS: data.offers,
            TRAVEL_TIPS: data.travelTips,
            UPCOMING_DESTINATIONS: data.upcomingDestinations,
            FACEBOOK_URL: 'https://facebook.com/asoperadora',
            INSTAGRAM_URL: 'https://instagram.com/asoperadora',
            TWITTER_URL: 'https://twitter.com/asoperadora',
            SUBJECT: `Newsletter ${data.month} ${data.year} - AS Operadora`
        });

        return await sendEmail({
            to: data.email,
            subject: `📰 Newsletter ${data.month} ${data.year} - AS Operadora`,
            html
        });
    } catch (error) {
        console.error('Error enviando newsletter:', error);
        return false;
    }
};

// 13. Oferta Especial
export const sendSpecialOfferEmail = async (data: {
    name: string;
    email: string;
    offerTitle: string;
    discountPercentage: number;
    destination: string;
    description: string;
    availableDates: string;
    duration: string;
    includesSummary: string;
    originalPrice: number;
    specialPrice: number;
    currency: string;
    expiryDate: string;
    spotsLeft: number;
    inclusions: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
    promoCode: string;
    bookingUrl: string;
    offerImage?: string;
    testimonials?: Array<{
        quote: string;
        name: string;
        location: string;
    }>;
}): Promise<boolean> => {
    try {
        const html = renderTemplate('special-offer', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            OFFER_TITLE: data.offerTitle,
            DISCOUNT_PERCENTAGE: data.discountPercentage,
            DESTINATION: data.destination,
            DESCRIPTION: data.description,
            AVAILABLE_DATES: data.availableDates,
            DURATION: data.duration,
            INCLUDES_SUMMARY: data.includesSummary,
            ORIGINAL_PRICE: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.originalPrice),
            SPECIAL_PRICE: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.specialPrice),
            CURRENCY: data.currency,
            EXPIRY_DATE: data.expiryDate,
            SPOTS_LEFT: data.spotsLeft,
            INCLUSIONS: data.inclusions,
            PROMO_CODE: data.promoCode,
            BOOKING_URL: data.bookingUrl,
            OFFER_IMAGE: data.offerImage,
            TESTIMONIALS: data.testimonials,
            SUBJECT: `🎉 ${data.offerTitle} - ${data.discountPercentage}% OFF`
        });

        return await sendEmail({
            to: data.email,
            subject: `🎉 ${data.offerTitle} - ${data.discountPercentage}% OFF`,
            html
        });
    } catch (error) {
        console.error('Error enviando oferta especial:', error);
        return false;
    }
};

// 14. Alerta de Precio
export const sendPriceAlertEmail = async (data: {
    name: string;
    email: string;
    destination: string;
    origin: string;
    travelDates: string;
    passengers: number;
    cabinClass?: string;
    oldPrice: number;
    newPrice: number;
    savingsAmount: number;
    savingsPercentage: number;
    currency: string;
    bookingUrl: string;
    flightInfo?: {
        outboundAirline: string;
        outboundFlight: string;
        outboundDeparture: string;
        outboundArrival: string;
        outboundStops: string;
        returnAirline?: string;
        returnFlight?: string;
        returnDeparture?: string;
        returnArrival?: string;
        returnStops?: string;
    };
    priceHistory?: {
        maxPrice: number;
        avgPrice: number;
    };
}): Promise<boolean> => {
    try {
        const html = renderTemplate('price-alert', {
            CUSTOMER_NAME: data.name,
            EMAIL: data.email,
            DESTINATION: data.destination,
            ORIGIN: data.origin,
            TRAVEL_DATES: data.travelDates,
            PASSENGERS: data.passengers,
            CABIN_CLASS: data.cabinClass,
            OLD_PRICE: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.oldPrice),
            NEW_PRICE: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.newPrice),
            SAVINGS_AMOUNT: new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.savingsAmount),
            SAVINGS_PERCENTAGE: data.savingsPercentage,
            CURRENCY: data.currency,
            BOOKING_URL: data.bookingUrl,
            FLIGHT_INFO: data.flightInfo ? true : false,
            OUTBOUND_AIRLINE: data.flightInfo?.outboundAirline,
            OUTBOUND_FLIGHT: data.flightInfo?.outboundFlight,
            OUTBOUND_DEPARTURE: data.flightInfo?.outboundDeparture,
            OUTBOUND_ARRIVAL: data.flightInfo?.outboundArrival,
            OUTBOUND_STOPS: data.flightInfo?.outboundStops,
            RETURN_FLIGHT: data.flightInfo?.returnFlight ? true : false,
            RETURN_AIRLINE: data.flightInfo?.returnAirline,
            RETURN_DEPARTURE: data.flightInfo?.returnDeparture,
            RETURN_ARRIVAL: data.flightInfo?.returnArrival,
            RETURN_STOPS: data.flightInfo?.returnStops,
            PRICE_HISTORY: data.priceHistory ? true : false,
            MAX_PRICE: data.priceHistory ? new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.priceHistory.maxPrice) : '',
            AVG_PRICE: data.priceHistory ? new Intl.NumberFormat('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.priceHistory.avgPrice) : '',
            MANAGE_ALERTS_URL: `${process.env.NEXT_PUBLIC_APP_URL}/alertas`,
            SUBJECT: `📉 ¡Bajó el precio! ${data.origin} → ${data.destination}`
        });

        return await sendEmail({
            to: data.email,
            subject: `📉 ¡Bajó el precio! ${data.origin} → ${data.destination}`,
            html
        });
    } catch (error) {
        console.error('Error enviando alerta de precio:', error);
        return false;
    }
};
