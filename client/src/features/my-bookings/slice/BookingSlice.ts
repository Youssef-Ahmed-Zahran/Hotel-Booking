import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../lib/axios.ts";
import type {
  ApiResponse,
  Booking,
  BookingQueryParams,
  CreateApartmentBookingRequest,
  CreateRoomBookingRequest,
  CheckAvailabilityRequest,
  AvailabilityCheck,
} from "../../../types";

interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const bookingSlice = createApi({
  reducerPath: "bookingsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/bookings" }),
  tagTypes: ["Booking"],
  endpoints: (builder) => ({
    // Create apartment booking
    createApartmentBooking: builder.mutation<
      Booking,
      CreateApartmentBookingRequest
    >({
      query: (bookingData) => ({
        url: "/apartment",
        method: "POST" as const,
        data: bookingData,
      }),
      transformResponse: (response: ApiResponse<Booking>) => {
        return response.data;
      },
      invalidatesTags: [
        { type: "Booking" as const, id: "LIST" },
        { type: "Booking" as const, id: "USER_LIST" },
        { type: "Booking" as const, id: "STATS" },
      ],
    }),

    // Create room booking
    createRoomBooking: builder.mutation<Booking, CreateRoomBookingRequest>({
      query: (bookingData) => ({
        url: "/room",
        method: "POST" as const,
        data: bookingData,
      }),
      transformResponse: (response: ApiResponse<Booking>) => {
        return response.data;
      },
      invalidatesTags: [
        { type: "Booking" as const, id: "LIST" },
        { type: "Booking" as const, id: "USER_LIST" },
        { type: "Booking" as const, id: "STATS" },
      ],
    }),

    // Get all bookings
    getAllBookings: builder.query<BookingsResponse, BookingQueryParams>({
      query: ({
        page = 1,
        limit = 10,
        userId,
        hotelId,
        status,
        bookingType,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (userId) params.append("userId", userId);
        if (hotelId) params.append("hotelId", hotelId);
        if (status) params.append("status", status);
        if (bookingType) params.append("bookingType", bookingType);
        return {
          url: `?${params.toString()}`,
          method: "GET" as const,
        };
      },
      transformResponse: (response: ApiResponse<BookingsResponse>) => {
        return response.data;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, ...rest } = queryArgs || {};
        return `${endpointName}(${JSON.stringify(rest)})`;
      },
      merge: (currentCache, newItems) => {
        if (newItems.pagination.page === 1) {
          currentCache.bookings = newItems.bookings;
        } else {
          currentCache.bookings.push(...newItems.bookings);
        }
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.bookings.map(({ id }) => ({
              type: "Booking" as const,
              id,
            })),
            { type: "Booking" as const, id: "LIST" },
          ]
          : [{ type: "Booking" as const, id: "LIST" }],
    }),

    // Get booking by ID
    getBookingById: builder.query<Booking, string>({
      query: (bookingId) => ({
        url: `/${bookingId}`,
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<Booking>) => {
        return response.data;
      },
      providesTags: (_result, _error, bookingId) => [
        { type: "Booking" as const, id: bookingId },
      ],
    }),

    // Update booking status (Admin)
    updateBookingStatus: builder.mutation<
      Booking,
      { bookingId: string; status?: string; paymentStatus?: string }
    >({
      query: ({ bookingId, ...statusData }) => ({
        url: `/${bookingId}/status`,
        method: "PATCH" as const,
        data: statusData,
      }),
      transformResponse: (response: ApiResponse<Booking>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "Booking" as const, id: bookingId },
        { type: "Booking" as const, id: "LIST" },
        { type: "Booking" as const, id: "USER_LIST" },
        { type: "Booking" as const, id: "HOTEL_LIST" },
        { type: "Booking" as const, id: "STATS" },
      ],
    }),

    // Delete booking (Admin)
    deleteBooking: builder.mutation<null, string>({
      query: (bookingId) => ({
        url: `/${bookingId}`,
        method: "DELETE" as const,
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, bookingId) => [
        { type: "Booking" as const, id: bookingId },
        { type: "Booking" as const, id: "LIST" },
        { type: "Booking" as const, id: "USER_LIST" },
      ],
    }),

    // Cancel booking
    cancelBooking: builder.mutation<Booking, string>({
      query: (bookingId) => ({
        url: `/${bookingId}`,
        method: "DELETE" as const,
      }),
      transformResponse: (response: ApiResponse<Booking>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, bookingId) => [
        { type: "Booking" as const, id: bookingId },
        { type: "Booking" as const, id: "LIST" },
        { type: "Booking" as const, id: "USER_LIST" },
        { type: "Booking" as const, id: "STATS" },
      ],
    }),

    // Get user bookings
    getUserBookings: builder.query<
      BookingsResponse,
      { userId: string; page: number; limit?: number }
    >({
      query: ({ userId, page, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        return {
          url: `/users/${userId}/bookings?${params.toString()}`,
          method: "GET" as const,
        };
      },
      transformResponse: (response: ApiResponse<BookingsResponse>) => {
        return response.data;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}(${queryArgs.userId})`;
      },
      merge: (currentCache, newItems) => {
        if (newItems.pagination.page === 1) {
          currentCache.bookings = newItems.bookings;
        } else {
          currentCache.bookings.push(...newItems.bookings);
        }
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.bookings.map(({ id }) => ({
              type: "Booking" as const,
              id,
            })),
            { type: "Booking" as const, id: "USER_LIST" },
          ]
          : [{ type: "Booking" as const, id: "USER_LIST" }],
    }),

    // Get hotel bookings (Admin)
    getHotelBookings: builder.query<Booking[], string>({
      query: (hotelId) => ({
        url: `/hotels/${hotelId}/bookings`,
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<Booking[]>) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Booking" as const,
              id,
            })),
            { type: "Booking" as const, id: "HOTEL_LIST" },
          ]
          : [{ type: "Booking" as const, id: "HOTEL_LIST" }],
    }),
    // Check availability
    checkAvailability: builder.mutation<
      AvailabilityCheck,
      CheckAvailabilityRequest
    >({
      query: (checkData) => ({
        url: "/check-availability",
        method: "POST" as const,
        data: checkData,
      }),
      transformResponse: (response: ApiResponse<AvailabilityCheck>) => {
        return response.data;
      },
    }),
    // Get global booking stats (Admin)
    getGlobalBookingStats: builder.query<any, void>({
      query: () => ({
        url: "/stats",
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        return response.data;
      },
      providesTags: [{ type: "Booking", id: "STATS" }],
    }),
  }),
});

export const {
  useCreateApartmentBookingMutation,
  useCreateRoomBookingMutation,
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
  useGetUserBookingsQuery,
  useGetHotelBookingsQuery,
  useDeleteBookingMutation,
  useCheckAvailabilityMutation,
  useGetGlobalBookingStatsQuery,
} = bookingSlice;
