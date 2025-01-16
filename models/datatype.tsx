"use client";
import { apiRequest } from "./common";
import {
    datatypeListResult,
    datatypeListResultItem
} from "@/types/datatype";

export const datatypeList = async (token: string | null) => {
    try {
        const result: string = await apiRequest(token, "datatype.list", {});
        const resultItems: datatypeListResultItem[] = JSON.parse(result);
        const data: datatypeListResult = resultItems;

        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};