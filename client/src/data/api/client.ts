import type { ApiResponse } from "@time-management/shared-types";
import { logger } from "../../utils/logger";

const API_URL = "http://localhost:3005/api";
const TIMEOUT = 5000; // 5 seconds

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    const token = localStorage.getItem("token");

    try {
      logger.debug(
        "Trying to fetch data...",
        endpoint,
        options,
        token,
        controller.signal
      );

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        data: data.data,
        error: data.error,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            data: null,
            error: "Request timeout",
            status: 408,
          };
        }
        return {
          data: null,
          error: error.message,
          status: 500,
        };
      }

      return {
        data: null,
        error: "Unknown error occurred",
        status: 500,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
