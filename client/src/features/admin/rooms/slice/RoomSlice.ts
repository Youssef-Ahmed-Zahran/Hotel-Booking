import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../../lib/axios.ts";
import type {
  ApiResponse,
  Room,
  RoomQueryParams,
  CreateRoomRequest,
  RoomAvailability,
  AvailabilityCheck,
  BulkAvailabilityRequest,
} from "../../../../types";

interface RoomsResponse {
  rooms: Room[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const roomSlice = createApi({
  reducerPath: "roomsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/rooms" }),
  tagTypes: ["Room", "RoomAvailability"],
  endpoints: (builder) => ({
    // Get all rooms with pagination
    getRooms: builder.query<RoomsResponse, RoomQueryParams>({
      query: ({
        page = 1,
        limit = 10,
        hotelId,
        apartmentId,
        roomType,
        minPrice,
        maxPrice,
        minCapacity,
        isAvailable,
        bookableIndividually,
        amenities,
        search,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (hotelId) params.append("hotelId", hotelId);
        if (apartmentId) params.append("apartmentId", apartmentId);
        if (roomType) params.append("roomType", roomType);
        if (minPrice) params.append("minPrice", String(minPrice));
        if (maxPrice) params.append("maxPrice", String(maxPrice));
        if (minCapacity) params.append("minCapacity", String(minCapacity));
        if (search) params.append("search", search);
        if (isAvailable !== undefined && isAvailable !== "")
          params.append("isAvailable", String(isAvailable));
        if (bookableIndividually !== undefined && bookableIndividually !== "")
          params.append("bookableIndividually", String(bookableIndividually));
        if (amenities) params.append("amenities", amenities);
        return {
          url: `?${params.toString()}`,
          method: "GET",
        };
      },
      // Keep results for the same query (minus page) in one cache entry
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        const { page, ...rest } = queryArgs;
        return `${endpointName}-${JSON.stringify(rest)}`;
      },
      // Merge new data into the existing cache
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          rooms: [...currentCache.rooms, ...newItems.rooms],
        };
      },
      // Refetch when the base query args (minus page) change
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      transformResponse: (response: ApiResponse<RoomsResponse>) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.rooms.map(({ id }) => ({
              type: "Room" as const,
              id,
            })),
            { type: "Room", id: "LIST" },
          ]
          : [{ type: "Room", id: "LIST" }],
    }),

    // Get single room
    getRoom: builder.query<Room, string>({
      query: (roomId) => ({
        url: `/${roomId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Room>) => {
        return response.data;
      },
      providesTags: (_result, _error, roomId) => [{ type: "Room", id: roomId }],
    }),

    // Get rooms by apartment
    getRoomsByApartment: builder.query<Room[], string>({
      query: (apartmentId) => ({
        url: `/apartment/${apartmentId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Room[]>) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Room" as const,
              id,
            })),
            { type: "Room", id: "LIST" },
          ]
          : [{ type: "Room", id: "LIST" }],
    }),

    // Get rooms by hotel
    getRoomsByHotel: builder.query<Room[], string>({
      query: (hotelId) => ({
        url: `/hotel/${hotelId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Room[]>) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Room" as const,
              id,
            })),
            { type: "Room", id: "LIST" },
          ]
          : [{ type: "Room", id: "LIST" }],
    }),

    // Check room availability
    checkRoomAvailability: builder.query<
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

    // Create room (Admin)
    createRoom: builder.mutation<Room, CreateRoomRequest>({
      query: (roomData) => ({
        url: "",
        method: "POST",
        data: roomData,
      }),
      transformResponse: (response: ApiResponse<Room>) => {
        return response.data;
      },
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),

    // Update room (Admin)
    updateRoom: builder.mutation<
      Room,
      { roomId: string } & Partial<CreateRoomRequest>
    >({
      query: ({ roomId, ...roomData }) => ({
        url: `/${roomId}`,
        method: "PUT",
        data: roomData,
      }),
      transformResponse: (response: ApiResponse<Room>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { roomId }) => [
        { type: "Room", id: roomId },
        { type: "Room", id: "LIST" },
      ],
    }),

    // Delete room (Admin)
    deleteRoom: builder.mutation<null, string>({
      query: (roomId) => ({
        url: `/${roomId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, roomId) => [
        { type: "Room", id: roomId },
        { type: "Room", id: "LIST" },
      ],
    }),

    // ============= Room Availability Endpoints =============

    // Get room availability
    getRoomAvailability: builder.query<
      RoomAvailability[],
      { roomId: string; startDate: string; endDate: string }
    >({
      query: (args) => ({
        url: "",
        method: "GET",
        params: { startDate: args.startDate, endDate: args.endDate },
      }),
      transformResponse: (response: ApiResponse<RoomAvailability[]>) => {
        return response.data;
      },
      providesTags: (_result, _error, { roomId }) => [
        { type: "RoomAvailability", id: roomId },
      ],
    }),

    // Set room availability (Admin)
    setRoomAvailability: builder.mutation<
      RoomAvailability,
      { roomId: string; date: string; isAvailable: boolean }
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      transformResponse: (response: ApiResponse<RoomAvailability>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { roomId }) => [
        { type: "RoomAvailability", id: roomId },
      ],
    }),

    // Bulk set room availability (Admin)
    bulkSetRoomAvailability: builder.mutation<
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
        { type: "RoomAvailability", id: data.roomId },
      ],
    }),

    // Delete room availability (Admin)
    deleteRoomAvailability: builder.mutation<null, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: [{ type: "RoomAvailability" }],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomQuery,
  useGetRoomsByApartmentQuery,
  useGetRoomsByHotelQuery,
  useCheckRoomAvailabilityQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomAvailabilityQuery,
  useSetRoomAvailabilityMutation,
  useBulkSetRoomAvailabilityMutation,
  useDeleteRoomAvailabilityMutation,
} = roomSlice;
