// Homepage Data Types

export interface Promotion {
  id: number;
  title: string;
  description: string;
  image_url: string;
  discount_percentage?: number;
  badge_text?: string;
  valid_until?: string;
  is_active: boolean;
}

export interface FeaturedHero {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  destination_name?: string;
  cta_text?: string;
  cta_url?: string;
}

export interface FlightDestination {
  id: number;
  city: string;
  country: string;
  price_from: number;
  currency: string;
  image_url: string;
  airport_code?: string;
  is_active: boolean;
}

export interface AccommodationFavorite {
  id: number;
  title?: string;
  name: string;
  location: string;
  type?: string;
  price_from?: number;
  price_per_night?: number;
  currency: string;
  rating?: number;
  image_url: string;
  description?: string;
}

export interface WeekendDeal {
  id: number;
  title?: string;
  name?: string;
  location: string;
  price_per_night: number;
  currency: string;
  rating?: number;
  discount_percentage?: number;
  dates_label?: string;
  image_url: string;
  description?: string;
  valid_until?: string;
}

export interface VacationPackage {
  id: number;
  destination: string;
  package_name?: string;
  includes?: string;
  description?: string;
  nights?: number;
  price: number;
  currency: string;
  image_url: string;
  is_featured: boolean;
}

export interface UniqueStay {
  id: number;
  property_name: string;
  location: string;
  description?: string;
  image_url: string;
  price_per_night: number;
  currency: string;
  rating?: number;
  total_reviews?: number;
  property_type?: string;
}

export interface ExploreDestination {
  id: number;
  destination?: string;
  destination_name?: string;
  city?: string;
  country?: string;
  image_url: string;
  price_from?: number;
  currency?: string;
  category?: string;
  hotels_count?: number;
  total_hotels?: number;
}

export interface DbInfo {
  success: boolean;
  database?: string;
  endpoint?: string;
  totalUsers?: number;
  lastUser?: {
    email: string;
  };
}

// Search params types
export interface FlightSearchParams {
  type: 'flight';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  cabinClass: string;
  currency: string;
  providers: string[];
  includedAirlineCodes?: string;
  excludedAirlineCodes?: string;
}

export interface HotelSearchParams {
  type: 'hotel';
  city: string;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;
  currency: string;
  providers: string[];
}
