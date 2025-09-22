import { apiClient } from "../api/client";
import { logger } from "../../utils/logger";

class AuthService {
  async fastLogin(): Promise<any> {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await apiClient.post<any>("/auth/fast-login", {
          data: { token: token },
        });
        logger.debug("fast-login data: " + response.data);
        if (response.data) {
          return response.data;
        }
      }
    } catch (error) {
      logger.debug("Error fast-logging in:", error);
    }
  }

  async login(data: { email: string; password: string }): Promise<any> {
    try {
      const response = await apiClient.post("/auth/login", { data: data });
      logger.debug("LOGIN DATA: ", response.data, response);
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      logger.error("Error logging in:", error);
    }
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post("/auth/register", { data: data });
      logger.debug("REGISTER DATA: ", response.data);
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      logger.error("Error registering:", error);
    }
  }
}

export const authService = new AuthService();
