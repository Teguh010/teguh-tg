"use client";
import {
    settingListResultSetting,
} from "@/types/setting";
import {
    apiRequest,
    apiRefreshToken
} from "./common";

export const userProfile = async (token: string | null) => {
    try {
        const result = await apiRequest(token, "user.my_profile", []);
        const resultItems: settingListResultSetting[] = JSON.parse(result);
        const data = { items: resultItems };
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const refreshTokenModel = async (_token: string | null) => {
  try {
    const result = await apiRefreshToken();
    return result;
  } catch (error) {
    console.error('Error during token refresh (model):', error.message || error)
    throw error // Tetap lempar error agar bisa ditangani di tempat lain
  }
};
