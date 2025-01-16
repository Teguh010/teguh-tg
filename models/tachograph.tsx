"use client";
import {
  getDriverListResult,
  getVechicleListResult,
  tachoAnalysisServiceAuthorizeResult,
  tachoLiveDrivingStateStatsResult
} from "@/types/tachograph";
import { apiRequest, apiTachoGetRequest, apiTachoGetFile, apiTachoPostRequest } from "./common";
import { object } from 'zod';

export const tachoAnalysisServiceAuthorize = async (token: string | null) => {
  try {
    const result: string = await apiRequest(token, "tacho_analysis_service.authorize", {});
    const data: tachoAnalysisServiceAuthorizeResult = JSON.parse(result);
    return data.token.TokenValue;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoLiveDrivingStateStatsAllObjects = async (
  token: string | null
): Promise<tachoLiveDrivingStateStatsResult> => {
  try {
    const result: string = await apiRequest(token, "tachograph.live_driving_state_stats_all_objects", []);

    if (!result) {
      return [];
    }

    const data: tachoLiveDrivingStateStatsResult = JSON.parse(result);

    return data;
  } catch (error) {
    console.error('Error in tachoLiveDrivingStateStatsAllObjects:', error);
    throw error;
  }
};

export const tachoLiveDrivingStateStats = async (token: string | null, objectId: number | string) => {
  try {
    const result: string = await apiRequest(token, "tachograph.live_driving_state_stats", {
      object_id: objectId
    });
    const data = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoGetDriverList = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoGetRequest(token, params, "https://test.tracegrid.tachoapi.com/Driver/getDriverList");
    const data: getDriverListResult = result.DriverCollection;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoGetDriverReport = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoGetFile(token, params, "https://test.tracegrid.tachoapi.com/Report/getDriverReport");
    const data: any = result;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoGetVehicleList = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoGetRequest(token, params, "https://test.tracegrid.tachoapi.com/Vehicle/getVehicleList");
    const data: getVechicleListResult = result.VehicleCollection;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoGetVehicleReport = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoGetFile(token, params, "https://test.tracegrid.tachoapi.com/Report/getVehicleReport");
    const data: any = result;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoActivateVehicle = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoPostRequest(token, params, "https://test.tracegrid.tachoapi.com/Vehicle/activateVehicle");
    const data: any = result;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoDeactivateVehicle = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoPostRequest(token, params, "https://test.tracegrid.tachoapi.com/Vehicle/deactivateVehicle");
    const data: any = result;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoActivateDriver = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoPostRequest(token, params, "https://test.tracegrid.tachoapi.com/Driver/activateDriver");
    const data: any = result;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoDeactivateDriver = async (token: string | null, params: any) => {
  try {
    const result = await apiTachoPostRequest(token, params, "https://test.tracegrid.tachoapi.com/Driver/deactivateDriver");
    const data: any = result;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoPutRawFile = async (token: string | null, params: any) => {
  try {
    const result: string = await apiRequest(token, "tachograph.put_raw_file", params);
    const data = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoFilesList = async (token: string | null, params: any) => {
  try {
    const result: string = await apiRequest(token, "tachograph.files_list", params);
    const data = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tachoDriverCardFilesList = async (token: string | null, params: any) => {
  try {
    const result: string = await apiRequest(token, "tachograph.driver_card_files_list", params);
    const data = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export interface LatestInputsDataResponse {
  id: string;
  jsonrpc: string;
  result: string; 
}

export interface InputData {
  id: number;
  i: string; 
  v: string | null; 
}

export interface ObjectInputs {
  object_id: number;
  inputs: InputData[];
}

export interface ParsedLatestInputsData extends Array<ObjectInputs> {}

export const getLatestInputsData = async (token: string | null, objectIds: number[] = []) => {
  try {
    const result: string = await apiRequest(token, "object.get_latest_inputs_data_txt_selected_objects", {
      object_ids: objectIds
    });

    const data: LatestInputsDataResponse = JSON.parse(result);
    const parsedData: ParsedLatestInputsData = JSON.parse(data.result);

    return parsedData;
  } catch (error) {
    console.error('Error in getLatestInputsData:', error);
    throw error;
  }
};
