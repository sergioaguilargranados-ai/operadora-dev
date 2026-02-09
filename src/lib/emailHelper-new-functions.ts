/**
 * NUEVAS FUNCIONES HELPER PARA TEMPLATES ADICIONALES
 * Agregar estas funciones al final de emailHelper.ts
 */

import { sendEmail } from './emailHelper';
import fs from 'fs';
import path from 'path';

// Renderizar template (copiar de emailHelper.ts si no está exportado)
const renderTemplate = (templateName: string, variables: Record<string, any>): string => {
    try {
        const basePath = path.join(process.cwd(), 'src', 'templates', 'email', 'base-template.html');
        const contentPath = path.join(process.cwd(), 'src', 'templates', 'email', `${templateName}.html`);

        let baseTemplate = fs.readFileSync(basePath, 'utf-8');
        let contentTemplate = fs.readFileSync(contentPath, 'utf-8');

        // Reemplazar variables en contenido
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            contentTemplate = contentTemplate.replace(regex, String(variables[key] || ''));
        });

        // Manejar condicionales {{#if VAR}}...{{/if}}
        contentTemplate = contentTemplate.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
            return variables[varName] ? content : '';
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
            finalHtml = finalHtml.replace(regex, String(globalVars[key] || ''));
        });

        return finalHtml;
    } catch (error) {
        console.error(`Error rendering template ${templateName}:`, error);
        throw error;
    }
};

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
