"use client";
import { format } from "date-fns";
import {
  objectGroupListResult,
  objectLastPositionResultVehicle,
  objectListResult,
  objectTripStopResult,
  objectTrajectoryResult,
  objectTripStopResponse

} from "@/types/object";
import { apiRequest } from "./common";

export const objectList = async (token: string | null) => {
  const params = {
    "with_archived": false,
    "without_virtual": true
  };

  try {
    const result: string = await apiRequest(token, "object.list", params);
    const data: objectListResult = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const objectTripStop = async (token: string, params: any) => {
  try {
    const result: string = await apiRequest(token, "object.trip_stop", params);
    const data: objectTripStopResult = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const objectTripStopMoreSetting = async (
  token: string,
  vehicle: number,
  startDate: string,
  endDate: string,
  minMoving: number,
  minStationary: number,
  showStationaryIgnition: boolean
) => {
  const params = {
    object_id: vehicle,
    time_from: format(startDate, "yyyy-MM-dd HH:mm:ss"),
    time_to: format(endDate, "yyyy-MM-dd HH:mm:ss"),
    min_moving: minMoving,
    min_stationary: minStationary,
    show_stationary_ignition: showStationaryIgnition,
  };

  try {
    const result: string = await apiRequest(token, "object.trip_stop", params);
    const data = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const objectLastPosition = async (token: string | null) => {
  const params = {};

  try {
    const result: string = await apiRequest(token, "object.last_position", params);
    const data: objectLastPositionResultVehicle[] = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const objectLastPositionWithMoreParam = async (token: string | null, params: { last_msg_id: number }) => {
    try {
        const result: string = await apiRequest(token, "object.last_position", params);
        const data: objectLastPositionResultVehicle[] = JSON.parse(result);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const objectGroupList = async (token: string | null) => {
  const params = {
    group_id: 0
  };

  try {
    const result: string = await apiRequest(token, "objects_group.list", params);
    const data: objectGroupListResult = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const objectGroupListId = async (token: string | null, objectGroupId: any) => {
  const params = {
    group_id: objectGroupId
  };

  try {
    const result: string = await apiRequest(token, "objects_group.objects_list", params);
    const data: objectGroupListResult = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const objectTrajectory = async (
  token: string,
  vehicle: any,
  startDate: string,
  endDate: string
) => {
  if (!token) {
    return null
  }

  let data: objectTrajectoryResult
  const url = process.env.NEXT_PUBLIC_TRACEGRID_API_URL + '/tracegrid_api/client'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const body = {
    id: '1',
    jsonrpc: '2.0',
    method: 'object.trajectory',
    params: {
      object_id: vehicle.id,
      time_from: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
      time_to: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
    },
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const dataResponse: objectTripStopResponse = await response.json()
    const resultItems: objectTrajectoryResult = JSON.parse(dataResponse.result)
    const items = resultItems
    data = items
  } catch (error) {
    console.error('Error:', error)
    throw error
  }

  return data
}

export const objectValidRawMessage = async (token: string, params: any) => {
  try {
    const result: string = await apiRequest(token, "object.valid_raw_messages", params);
    const data: any = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const objectTrajectoryNormalized = async (
  token: string,
  vehicle: any,
  startDate: string,
  endDate: string
) => {
  if (!token) {
    return null
  }
  let data: objectTrajectoryResult
  const url = process.env.NEXT_PUBLIC_TRACEGRID_API_URL + '/tracegrid_api/client'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const body = {
    id: '1',
    jsonrpc: '2.0',
    method: 'object.trajectory_normalized',
    params: {
      object_id: vehicle.id,
      time_from: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
      time_to: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
    },
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const dataResponse: objectTripStopResponse = await response.json()
    const resultItems: objectTrajectoryResult = JSON.parse(dataResponse.result)
    const items = resultItems
    data = items
  } catch (error) {
    console.error('Error:', error)
    throw error
  }

  return data
}

export const objectFuelLevel = async (token: string, params: any) => {
  try {
    const result: string = await apiRequest(token, "object.fuel_level", params);
    const data = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
