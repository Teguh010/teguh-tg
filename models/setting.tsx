"use client";
import {
    settingListResponse,
    settingListResultSetting,
    objectListResult,
} from "@/types/setting";
import {
    apiRequest,
} from "./common";

export const settingList = async (token: string | null) => {
    try {
        const result = await apiRequest(token, "setting.list", []);

        const resultItems: settingListResultSetting[] = JSON.parse(result);
        const data = { items: resultItems };

        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Refactorización de settingUpdate utilizando apiRequest
export const settingUpdate = async (token: string | null, key: string, value: string) => {
    try {
        const result = await apiRequest(token, "setting.set", { key, value });

        const resultItems: settingListResultSetting[] = JSON.parse(result);
        const data = { items: resultItems };

        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};