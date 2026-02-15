import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../../lib/axios.ts";
import type {
  ApiResponse,
  Apartment,
  ApartmentQueryParams,
  CreateApartmentRequest,
  ApartmentAvailability,
  AvailabilityCheck,
  BulkAvailabilityRequest,
} from "../../../../types";

interface ApartmentsResponse {
  apartments: Apartment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const apartmentSlice = createApi({
  reducerPath: "apartmentsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/apartments" }),
  tagTypes: ["Apartment", "ApartmentAvailability"],
  endpoints: (builder) => ({
    // Get single apartment
    getApartment: builder.query<Apartment, string>({
      query: (apartmentId) => ({
        url: `/${apartmentId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Apartment>) => {
        return response.data;
      },
      providesTags: (_result, _error, apartmentId) => [
        { type: "Apartment", id: apartmentId },
      ],
    }),

    // Get all apartments with pagination
    getApartments: builder.query<ApartmentsResponse, ApartmentQueryParams | void>({
      query: ({
        page = 1,
        limit = 10,
        hotelId,
        apartmentType,
        minPrice,
        maxPrice,
        minBedrooms,
        isAvailable,
        search,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (hotelId) params.append("hotelId", hotelId);
        if (apartmentType) params.append("apartmentType", apartmentType);
        if (minPrice) params.append("minPrice", String(minPrice));
        if (maxPrice) params.append("maxPrice", String(maxPrice));
        if (minBedrooms) params.append("minBedrooms", String(minBedrooms));
        if (search) params.append("search", search);
        if (isAvailable !== undefined && isAvailable !== "")
          params.append("isAvailable", String(isAvailable));
        return {
          url: `?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: ApiResponse<ApartmentsResponse>) => {
        return response.data;
      },
      // Keep results for the same query (minus page) in one cache entry
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        const query = queryArgs as ApartmentQueryParams;
        const { page: _, ...rest } = query || {};
        void _;
        return `${endpointName}-${JSON.stringify(rest)}`;
      },
      // Merge new data into the existing cache
      merge: (currentCache, newItems, { arg }) => {
        if (!arg || (arg as ApartmentQueryParams).page === 1) {
          return newItems;
        }

        // Deduplicate apartments by ID to prevent duplicate key warnings
        const existingIds = new Set(currentCache.apartments.map(a => a.id));
        const uniqueNewItems = newItems.apartments.filter(a => !existingIds.has(a.id));

        return {
          ...newItems,
          apartments: [...currentCache.apartments, ...uniqueNewItems],
        };
      },
      // Refetch when the base query args (minus page) change
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.apartments.map(({ id }) => ({
              type: "Apartment" as const,
              id,
            })),
            { type: "Apartment", id: "LIST" },
          ]
          : [{ type: "Apartment", id: "LIST" }],
    }),

    // Get apartments by hotel
    getApartmentsByHotel: builder.query<Apartment[], string>({
      query: (hotelId) => ({
        url: `/hotel/${hotelId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Apartment[]>) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Apartment" as const,
              id,
            })),
            { type: "Apartment", id: "LIST" },
          ]
          : [{ type: "Apartment", id: "LIST" }],
    }),

    // Check apartment availability
    checkApartmentAvailability: builder.query<
      AvailabilityCheck,
      { id: string; checkInDate: string; checkOutDate: string }
    >({
      query: ({ id, checkInDate, checkOutDate }) => ({
        url: `/${id}/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AvailabilityCheck>) => {
        return response.data;
      },
    }),

    // Create apartment (Admin)
    createApartment: builder.mutation<Apartment, CreateApartmentRequest>({
      query: (apartmentData) => ({
        url: "",
        method: "POST",
        data: apartmentData,
      }),
      transformResponse: (response: ApiResponse<Apartment>) => {
        return response.data;
      },
      invalidatesTags: [{ type: "Apartment", id: "LIST" }],
    }),

    // Update apartment (Admin)
    updateApartment: builder.mutation<
      Apartment,
      { apartmentId: string } & Partial<CreateApartmentRequest>
    >({
      query: ({ apartmentId, ...apartmentData }) => ({
        url: `/${apartmentId}`,
        method: "PUT",
        data: apartmentData,
      }),
      transformResponse: (response: ApiResponse<Apartment>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { apartmentId }) => [
        { type: "Apartment", id: apartmentId },
        { type: "Apartment", id: "LIST" },
      ],
    }),

    // Delete apartment (Admin)
    deleteApartment: builder.mutation<null, string>({
      query: (apartmentId) => ({
        url: `/${apartmentId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, apartmentId) => [
        { type: "Apartment", id: apartmentId },
        { type: "Apartment", id: "LIST" },
      ],
    }),

    // ============= Apartment Availability Endpoints =============

    // Get apartment availability
    getApartmentAvailability: builder.query<
      ApartmentAvailability[],
      { apartmentId: string; startDate: string; endDate: string }
    >({
      query: (args) => ({
        url: ``,
        method: "GET",
        params: { startDate: args.startDate, endDate: args.endDate },
      }),
      transformResponse: (response: ApiResponse<ApartmentAvailability[]>) => {
        return response.data;
      },
      providesTags: (_result, _error, { apartmentId }) => [
        { type: "ApartmentAvailability", id: apartmentId },
      ],
    }),

    // Set apartment availability (Admin)
    setApartmentAvailability: builder.mutation<
      ApartmentAvailability,
      { apartmentId: string; date: string; isAvailable: boolean }
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      transformResponse: (response: ApiResponse<ApartmentAvailability>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { apartmentId }) => [
        { type: "ApartmentAvailability", id: apartmentId },
      ],
    }),

    // Bulk set apartment availability (Admin)
    bulkSetApartmentAvailability: builder.mutation<
      { count: number; startDate: string; endDate: string },
      BulkAvailabilityRequest
    >({
      query: (data) => ({
        url: "/bulk",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ApiResponse<{
          count: number;
          startDate: string;
          endDate: string;
        }>
      ) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, data) => [
        { type: "ApartmentAvailability", id: data.apartmentId },
      ],
    }),

    // Delete apartment availability (Admin)
    deleteApartmentAvailability: builder.mutation<null, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: [{ type: "ApartmentAvailability" }],
    }),
  }),
});

export const {
  useGetApartmentQuery,
  useGetApartmentsQuery,
  useGetApartmentsByHotelQuery,
  useCheckApartmentAvailabilityQuery,
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
  useGetApartmentAvailabilityQuery,
  useSetApartmentAvailabilityMutation,
  useBulkSetApartmentAvailabilityMutation,
  useDeleteApartmentAvailabilityMutation,
} = apartmentSlice;
