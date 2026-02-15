import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../lib/axios.ts";
import type {
  ApiResponse,
  Hotel,
  HotelQueryParams,
  CreateHotelRequest,
  HotelStats,
  HotelsResponse,
} from "../../../types";

export const hotelSlice = createApi({
  reducerPath: "hotelsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/hotels" }),
  tagTypes: ["Hotel"],
  endpoints: (builder) => ({
    // Get all hotels with pagination and filters
    getHotels: builder.query<HotelsResponse, HotelQueryParams>({
      query: ({
        page = 1,
        limit = 10,
        city,
        country,
        minRating,
        isActive,
        amenities,
        search,
        sortBy,
        order,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (city) params.append("city", city);
        if (country) params.append("country", country);
        if (minRating) params.append("minRating", String(minRating));
        if (isActive !== undefined && isActive !== "")
          params.append("isActive", String(isActive));
        if (amenities) params.append("amenities", amenities);
        if (search) params.append("search", search);
        if (sortBy) params.append("sortBy", sortBy);
        if (order) params.append("order", order);
        return {
          url: `?${params.toString()}`,
          method: "GET" as const,
        };
      },
      transformResponse: (response: ApiResponse<HotelsResponse>) => {
        return response.data;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _, ...otherArgs } = queryArgs || {};
        void _; // Explicitly ignore the page parameter
        return `${endpointName}(${JSON.stringify(otherArgs)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }

        // Deduplicate hotels by ID to prevent duplicate key warnings
        const existingIds = new Set(currentCache.hotels.map(h => h.id));
        const uniqueNewItems = newItems.hotels.filter(h => !existingIds.has(h.id));

        return {
          ...newItems,
          hotels: [...currentCache.hotels, ...uniqueNewItems],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.hotels.map(({ id }) => ({
              type: "Hotel" as const,
              id,
            })),
            { type: "Hotel" as const, id: "LIST" },
          ]
          : [{ type: "Hotel" as const, id: "LIST" }],
    }),

    // Get featured hotels
    getFeaturedHotels: builder.query<Hotel[], void>({
      query: () => ({
        url: "/featured",
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<Hotel[]>) => {
        return response.data;
      },
      providesTags: [{ type: "Hotel" as const, id: "FEATURED" }],
    }),

    // Get single hotel
    getHotel: builder.query<Hotel, string>({
      query: (hotelId) => ({
        url: `/${hotelId}`,
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<Hotel>) => {
        return response.data;
      },
      providesTags: (_result, _error, hotelId) => [
        { type: "Hotel" as const, id: hotelId },
      ],
    }),

    // Get hotel stats (Admin)
    getHotelStats: builder.query<HotelStats, string>({
      query: (hotelId) => ({
        url: `/${hotelId}/stats`,
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<HotelStats>) => {
        return response.data;
      },
      providesTags: (_result, _error, hotelId) => [
        { type: "Hotel" as const, id: `${hotelId}-stats` },
      ],
    }),

    // Create hotel (Admin)
    createHotel: builder.mutation<Hotel, CreateHotelRequest>({
      query: (hotelData) => ({
        url: "",
        method: "POST" as const,
        data: hotelData,
      }),
      transformResponse: (response: ApiResponse<Hotel>) => {
        return response.data;
      },
      invalidatesTags: [
        { type: "Hotel" as const, id: "LIST" },
        { type: "Hotel" as const, id: "FEATURED" },
      ],
    }),

    // Update hotel (Admin)
    updateHotel: builder.mutation<
      Hotel,
      { hotelId: string } & Partial<CreateHotelRequest>
    >({
      query: ({ hotelId, ...hotelData }) => ({
        url: `/${hotelId}`,
        method: "PUT" as const,
        data: hotelData,
      }),
      transformResponse: (response: ApiResponse<Hotel>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { hotelId }) => [
        { type: "Hotel" as const, id: hotelId },
        { type: "Hotel" as const, id: "LIST" },
        { type: "Hotel" as const, id: "FEATURED" },
      ],
    }),

    // Delete hotel (Admin)
    deleteHotel: builder.mutation<null, string>({
      query: (hotelId) => ({
        url: `/${hotelId}`,
        method: "DELETE" as const,
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, hotelId) => [
        { type: "Hotel" as const, id: hotelId },
        { type: "Hotel" as const, id: "LIST" },
        { type: "Hotel" as const, id: "FEATURED" },
      ],
    }),
  }),
});

export const {
  useGetHotelsQuery,
  useGetFeaturedHotelsQuery,
  useGetHotelQuery,
  useGetHotelStatsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} = hotelSlice;
