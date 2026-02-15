import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../../lib/axios.ts";
import type {
  ApiResponse,
  Amenity,
  CreateAmenityRequest,
} from "../../../../types";

export const amenitySlice = createApi({
  reducerPath: "amenitiesApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/amenities" }),
  tagTypes: ["Amenity"],
  endpoints: (builder) => ({
    // Get amenities for a room
    getAmenitiesByRoom: builder.query<Amenity[], string>({
      query: (roomId) => ({
        url: `/room/${roomId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Amenity[]>) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Amenity" as const,
              id,
            })),
            { type: "Amenity", id: "LIST" },
          ]
          : [{ type: "Amenity", id: "LIST" }],
    }),

    // Get all amenities (for filters)
    getAllAmenities: builder.query<Amenity[], void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Amenity[]>) => {
        return response.data;
      },
      providesTags: [{ type: "Amenity", id: "LIST" }],
    }),

    // Create amenity (Admin)
    createAmenity: builder.mutation<Amenity, CreateAmenityRequest>({
      query: (amenityData) => ({
        url: "",
        method: "POST",
        data: amenityData,
      }),
      transformResponse: (response: ApiResponse<Amenity>) => {
        return response.data;
      },
      invalidatesTags: [{ type: "Amenity", id: "LIST" }],
    }),

    // Update amenity (Admin)
    updateAmenity: builder.mutation<
      Amenity,
      { amenityId: string; name?: string; description?: string }
    >({
      query: ({ amenityId, ...amenityData }) => ({
        url: `/${amenityId}`,
        method: "PUT",
        data: amenityData,
      }),
      transformResponse: (response: ApiResponse<Amenity>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { amenityId }) => [
        { type: "Amenity", id: amenityId },
        { type: "Amenity", id: "LIST" },
      ],
    }),

    // Delete amenity (Admin)
    deleteAmenity: builder.mutation<null, string>({
      query: (amenityId) => ({
        url: `/${amenityId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, amenityId) => [
        { type: "Amenity", id: amenityId },
        { type: "Amenity", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAmenitiesByRoomQuery,
  useGetAllAmenitiesQuery,
  useCreateAmenityMutation,
  useUpdateAmenityMutation,
  useDeleteAmenityMutation,
} = amenitySlice;
