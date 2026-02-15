import axios from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const publicRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Define the query args type
interface AxiosQueryArgs {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  params?: unknown;
}

// Define the error type
interface AxiosQueryError {
  status?: number;
  data?: unknown;
}

export const axiosBaseQuery = ({
  baseUrl = "",
}: {
  baseUrl?: string;
}): BaseQueryFn<AxiosQueryArgs, unknown, AxiosQueryError> => {
  return async ({ url, method, data, params }) => {
    try {
      const result = await publicRequest({
        url: `${baseUrl}${url}`,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
};
