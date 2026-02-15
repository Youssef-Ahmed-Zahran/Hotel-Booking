import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../lib/axios.ts";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../../../types";

export const authSlice = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/auth" }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // Register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        data: userData,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        return response.data;
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authSlice.util.upsertQueryData("getCurrentUser", undefined, data.user)
          );
        } catch { }
      },
      invalidatesTags: ["Auth"],
    }),

    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        data: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        return response.data;
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authSlice.util.upsertQueryData("getCurrentUser", undefined, data.user)
          );
        } catch { }
      },
      invalidatesTags: ["Auth"],
    }),

    // Logout
    logout: builder.mutation<null, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return response.data;
      },
      invalidatesTags: ["Auth"],
    }),

    // Get current user
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: "/me",
        method: "GET" as const,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        return response.data;
      },
      providesTags: [{ type: "Auth" as const }],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authSlice;
