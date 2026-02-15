import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../../lib/axios.ts";
import type { ApiResponse } from "../../../../types";

interface DashboardStats {
  totalHotels: number;
  totalRooms: number;
  totalApartments: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: any[];
  usersByRole: { role: string; count: number }[];
  bookingsByStatus: { status: string; count: number }[];
  roomsByType: { type: string; count: number }[];
}

export const dashboardSlice = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/dashboard" }),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    // Get dashboard statistics (Admin)
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<DashboardStats>) => {
        return response.data;
      },
      providesTags: [{ type: "Dashboard", id: "STATS" }],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardSlice;
