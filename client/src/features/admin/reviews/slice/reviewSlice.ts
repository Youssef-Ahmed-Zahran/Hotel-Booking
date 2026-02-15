import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../../lib/axios.ts";
import { hotelSlice } from "../../../hotels/slice/HotelSlice.ts";
import type {
  ApiResponse,
  Review,
  ReviewQueryParams,
  CreateReviewRequest,
  HotelReviewsResponse,
} from "../../../../types";

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reviewSlice = createApi({
  reducerPath: "reviewsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/reviews" }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    // Get all reviews
    getAllReviews: builder.query<ReviewsResponse, ReviewQueryParams>({
      query: ({
        page = 1,
        limit = 10,
        hotelId,
        apartmentId,
        roomId,
        userId,
        reviewType,
        minRating,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (hotelId) params.append("hotelId", hotelId);
        if (apartmentId) params.append("apartmentId", apartmentId);
        if (roomId) params.append("roomId", roomId);
        if (userId) params.append("userId", userId);
        if (reviewType) params.append("reviewType", reviewType);
        if (minRating) params.append("minRating", String(minRating));
        return {
          url: `?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: ApiResponse<ReviewsResponse>) => {
        return response.data;
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
          reviews: [...currentCache.reviews, ...newItems.reviews],
        };
      },
      // Refetch when the base query args (minus page) change
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.reviews.map(({ id }) => ({
              type: "Review" as const,
              id,
            })),
            { type: "Review", id: "LIST" },
          ]
          : [{ type: "Review", id: "LIST" }],
    }),

    // Get review by ID
    getReviewById: builder.query<Review, string>({
      query: (reviewId) => ({
        url: `/${reviewId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Review>) => {
        return response.data;
      },
      providesTags: (_result, _error, reviewId) => [
        { type: "Review", id: reviewId },
      ],
    }),

    // Get reviews by hotel
    getReviewsByHotel: builder.query<HotelReviewsResponse, string>({
      query: (hotelId) => ({
        url: `/hotel/${hotelId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<HotelReviewsResponse>) => {
        return response.data;
      },
      providesTags: (_result, _error, hotelId) => [
        { type: "Review", id: `hotel-${hotelId}` },
      ],
    }),

    // Create review
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (reviewData) => ({
        url: "",
        method: "POST",
        data: reviewData,
      }),
      transformResponse: (response: ApiResponse<Review>) => {
        return response.data;
      },
      invalidatesTags: (result) =>
        result
          ? [
            { type: "Review", id: "LIST" },
            { type: "Review", id: `hotel-${result.hotelId}` },
          ]
          : [{ type: "Review", id: "LIST" }],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled;
          if (result.hotelId) {
            dispatch(
              hotelSlice.util.invalidateTags([{ type: "Hotel", id: result.hotelId }])
            );
          }
        } catch (err) { }
      },
    }),

    // Update review
    updateReview: builder.mutation<
      Review,
      { reviewId: string; rating?: number; comment?: string; hotelId?: string }
    >({
      query: ({ reviewId, hotelId: _hotelId, ...reviewData }) => ({
        url: `/${reviewId}`,
        method: "PUT",
        data: reviewData,
      }),
      transformResponse: (response: ApiResponse<Review>) => {
        return response.data;
      },
      invalidatesTags: (result, _error, { reviewId, hotelId }) => {
        const tags = [
          { type: "Review" as const, id: reviewId },
          { type: "Review" as const, id: "LIST" },
        ];
        if (hotelId) {
          tags.push({ type: "Review" as const, id: `hotel-${hotelId}` });
        } else if (result?.hotelId) {
          tags.push({ type: "Review" as const, id: `hotel-${result.hotelId}` });
        }
        return tags;
      },
      async onQueryStarted({ hotelId: argHotelId }, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled;
          const hId = argHotelId || result?.hotelId;
          if (hId) {
            dispatch(
              hotelSlice.util.invalidateTags([{ type: "Hotel", id: hId }])
            );
          }
        } catch (err) { }
      },
    }),

    // Delete review
    deleteReview: builder.mutation<null, { reviewId: string; hotelId?: string }>({
      query: ({ reviewId }) => ({
        url: `/${reviewId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { reviewId, hotelId }) => {
        const tags = [
          { type: "Review" as const, id: reviewId },
          { type: "Review" as const, id: "LIST" },
        ];
        if (hotelId) {
          tags.push({ type: "Review" as const, id: `hotel-${hotelId}` });
        }
        return tags;
      },
      async onQueryStarted({ hotelId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          if (hotelId) {
            dispatch(
              hotelSlice.util.invalidateTags([{ type: "Hotel", id: hotelId }])
            );
          }
        } catch (err) { }
      },
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useGetReviewByIdQuery,
  useGetReviewsByHotelQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewSlice;
