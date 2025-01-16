"use client";
import { apiRequest } from "./common";

export const objectWorkers = async (token: string, params: any) => {
  try {
    const result: string = await apiRequest(token, "worker.list", params);
    const data: any = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createWorker = async (token: string, payload: {
  name: string;
  surname: string;
  phone?: string;
  email?: string;
}) => {
  try {
    const result: string = await apiRequest(token, "worker.create", payload);
    const data: any = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
};

