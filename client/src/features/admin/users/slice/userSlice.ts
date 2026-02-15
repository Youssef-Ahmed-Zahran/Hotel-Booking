import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../../lib/axios.ts";
import type {
  ApiResponse,
  User,
  UsersResponse,
  ChangePasswordRequest,
} from "../../../../types";

export const userSlice = createApi({
  reducerPath: "usersApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/users" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Get current user profile
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: "/me",
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        return response.data;
      },
      providesTags: [{ type: "User" as const, id: "ME" }],
    }),

    // Get all users (Admin)
    getAllUsers: builder.query<
      UsersResponse,
      { page?: number; limit?: number; role?: string; search?: string }
    >({
      query: ({ page = 1, limit = 10, role, search } = {}) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (role) params.append("role", role);
        if (search) params.append("search", search);
        return {
          url: `?${params.toString()}`,
          method: "GET" as const,
        };
      },
      transformResponse: (response: ApiResponse<UsersResponse>) => {
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
          users: [...currentCache.users, ...newItems.users],
        };
      },
      // Refetch when the base query args (minus page) change
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ id }) => ({
                type: "User" as const,
                id,
              })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      query: (userId) => ({
        url: `/${userId}`,
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        return response.data;
      },
      providesTags: (_result, _error, userId) => [
        { type: "User" as const, id: userId },
      ],
    }),

    // Update user
    updateUser: builder.mutation<
      User,
      {
        userId: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        profileImageUrl?: string;
        password?: string;
        username?: string;
        email?: string;
      }
    >({
      query: ({ userId, ...userData }) => ({
        url: `/${userId}`,
        method: "PUT" as const,
        data: userData,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User" as const, id: userId },
        { type: "User" as const, id: "ME" },
      ],
    }),

    // Delete user (Admin)
    deleteUser: builder.mutation<null, string>({
      query: (userId) => ({
        url: `/${userId}`,
        method: "DELETE" as const,
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: (_result, _error, userId) => [
        { type: "User" as const, id: userId },
        { type: "User" as const, id: "LIST" },
      ],
    }),

    // Change password
    changePassword: builder.mutation<null, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: "/change-password",
        method: "POST" as const,
        data: passwordData,
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
} = userSlice;
