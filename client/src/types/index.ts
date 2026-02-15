// ============= Enums =============
export type UserRole = "USER" | "ADMIN";

export type ApartmentType =
  | "STUDIO"
  | "ONE_BEDROOM"
  | "TWO_BEDROOM"
  | "THREE_BEDROOM"
  | "PENTHOUSE"
  | "SUITE";

export type RoomType =
  | "SINGLE"
  | "DOUBLE"
  | "TWIN"
  | "SUITE"
  | "DELUXE"
  | "FAMILY";

export type BookingType = "APARTMENT" | "ROOM";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type ReviewType = "HOTEL" | "APARTMENT" | "ROOM";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

// ============= Models =============

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  role: UserRole;
  createdDate?: string;
  lastModifiedDate?: string;
  _count?: {
    bookings: number;
    reviews: number;
  };
}

export interface Hotel {
  id: string;
  email: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  postalCode?: string | null;
  phoneNumber?: string | null;
  images: string[];
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
  apartments?: Apartment[];
  rooms?: Room[];
  _count?: {
    apartments?: number;
    rooms?: number;
    bookings?: number;
    reviews?: number;
  };
}

export interface Amenity {
  id: string;
  name: string;
  description?: string | null;
  roomId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Apartment {
  id: string;
  apartmentNumber: string;
  name: string;
  description?: string | null;
  images: string[];
  pricePerNight: number;
  totalCapacity: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  floorNumber?: number | null;
  areaSqm?: number | null;
  isAvailable: boolean;
  roomsBookableSeparately: boolean;
  apartmentType: ApartmentType;
  createdAt?: string;
  updatedAt?: string;
  hotelId: string;
  hotel?: Partial<Hotel>;
  rooms?: Room[];
  amenities?: Amenity[];
  _count?: {
    rooms?: number;
    apartmentBookings?: number;
    reviews?: number;
  };
}

export interface Room {
  id: string;
  roomNumber: string;
  description?: string | null;
  images: string[];
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
  bookableIndividually: boolean;
  roomType: RoomType;
  createdAt?: string;
  updatedAt?: string;
  hotelId?: string | null;
  apartmentId?: string | null;
  hotel?: Partial<Hotel> | null;
  apartment?: Partial<Apartment> | null;
  amenities?: Amenity[];
  _count?: {
    roomBookings?: number;
    reviews?: number;
  };
}

export interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  bookingType: BookingType;
  status: BookingStatus;
  paymentAmount: number;
  paymentCurrency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string | null;
  paymentCompletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userId: string;
  hotelId: string;
  apartmentId?: string | null;
  roomId?: string | null;
  user?: Partial<User>;
  hotel?: Partial<Hotel>;
  apartment?: Partial<Apartment> | null;
  room?: Partial<Room> | null;
  review?: Review | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  reviewType: ReviewType;
  createdAt?: string;
  updatedAt?: string;
  userId: string;
  hotelId: string;
  apartmentId?: string | null;
  roomId?: string | null;
  bookingId?: string | null;
  user?: Partial<User>;
  hotel?: Partial<Hotel>;
  apartment?: Partial<Apartment> | null;
  room?: Partial<Room> | null;
  booking?: Partial<Booking> | null;
}

export interface ApartmentAvailability {
  id: string;
  date: string;
  isAvailable: boolean;
  apartmentId: string;
  apartment?: Partial<Apartment>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomAvailability {
  id: string;
  date: string;
  isAvailable: boolean;
  roomId: string;
  room?: Partial<Room>;
  createdAt?: string;
  updatedAt?: string;
}

// ============= API Response Types =============

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface HotelsResponse {
  hotels: Hotel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HotelStats {
  totalApartments: number;
  totalRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface HotelReviewsResponse {
  reviews: Review[];
  averageRating: string;
  totalReviews: number;
}

export interface AvailabilityCheck {
  available: boolean;
  reason?: string;
  conflictingBookings?: number;
  message?: string;
}

// ============= Request Types =============

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateHotelRequest {
  email: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phoneNumber?: string;
  images?: string[];
  rating?: number;
  isFeatured?: boolean;
}

export interface CreateApartmentRequest {
  hotelId: string;
  apartmentNumber: string;
  name: string;
  description?: string;
  images?: string[];
  pricePerNight: number;
  totalCapacity: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  floorNumber?: number;
  areaSqm?: number;
  apartmentType: ApartmentType;
  roomsBookableSeparately?: boolean;
}

export interface CreateRoomRequest {
  hotelId?: string;
  apartmentId?: string;
  roomNumber: string;
  description?: string;
  images?: string[];
  pricePerNight: number;
  capacity: number;
  roomType: RoomType;
  bookableIndividually?: boolean;
  amenityIds?: string[];
}

export interface CreateApartmentBookingRequest {
  userId: string;
  hotelId: string;
  apartmentId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  paymentAmount: number;
  paymentCurrency?: string;
  paymentMethod: string;
}

export interface CreateRoomBookingRequest {
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  paymentAmount: number;
  paymentCurrency?: string;
  paymentMethod: string;
}

export interface CheckAvailabilityRequest {
  apartmentId?: string;
  roomId?: string;
  checkInDate: string;
  checkOutDate: string;
  bookingType: BookingType;
}

export interface CreateReviewRequest {
  userId: string;
  hotelId: string;
  apartmentId?: string;
  roomId?: string;
  bookingId?: string;
  rating: number;
  comment?: string;
  reviewType: ReviewType;
}

export interface CreateAmenityRequest {
  name: string;
  description?: string;
  roomId: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface BulkAvailabilityRequest {
  apartmentId?: string;
  roomId?: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
}

// ============= Query Param Types =============

export interface HotelQueryParams {
  page?: number;
  limit?: number;
  city?: string;
  country?: string;
  minRating?: number;
  isActive?: boolean | string;
  amenities?: string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface ApartmentQueryParams {
  page?: number;
  limit?: number;
  hotelId?: string;
  apartmentType?: ApartmentType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  isAvailable?: boolean | string;
  search?: string;
}

export interface RoomQueryParams {
  page?: number;
  limit?: number;
  hotelId?: string;
  apartmentId?: string;
  roomType?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  isAvailable?: boolean | string;
  bookableIndividually?: boolean | string;
  amenities?: string;
  search?: string;
}

export interface BookingQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  hotelId?: string;
  status?: BookingStatus;
  bookingType?: BookingType;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  hotelId?: string;
  apartmentId?: string;
  roomId?: string;
  userId?: string;
  reviewType?: ReviewType;
  minRating?: number;
}
