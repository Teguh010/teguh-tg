"use client";
import axios from 'axios';


import {
  apiRequest,
} from "./common";

export const addressCacheGet = async (token: string | null, lat: string, lon: string) => {
  const params = {
    "lat": lat,
    "lon": lon
  };
  return await apiRequest(token, "address_cache.get", params);
};

export const addressCacheAdd = async (
  token: string,
  addresses: { lat: number, lng: number, a: string }[]
) => {
  const params = {
    json_data: addresses.map(address => ({
      lat: address.lat,
      lng: address.lng,
      a: address.a
    }))
  };

  try {
    const result: string = await apiRequest(token, "address_cache.add", params);
    const data: boolean = JSON.parse(result);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};



export const fetchHereAddressesBatch = async (coordinates) => {
  const apiKey = process.env.NEXT_PUBLIC_HERE_MAPS_TOKEN;
  const hereBatchUrl = `https://batch.geocoder.ls.hereapi.com/6.2/jobs`;

  const coordList = coordinates.map(coord => `${coord.lat},${coord.lon}`).join('\n');
  const formData = new URLSearchParams();
  formData.append('action', 'run');
  formData.append('apikey', apiKey); // Ensure API key is included
  formData.append('in', 'csv');
  formData.append('out', 'json');
  formData.append('csvAttributes', 'latitude,longitude');
  formData.append('locationattributes', 'address');
  formData.append('indelim', '\n');
  formData.append('outdelim', ',');
  formData.append('query', coordList);

  try {
    // Send POST request to start batch job
    const response = await axios.post(hereBatchUrl, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.data.Response || !response.data.Response.JobId) {
      throw new Error('Failed to start batch geocoding job.');
    }

    const jobId = response.data.Response.JobId;

    // Poll the job status
    let jobStatus = 'running';
    while (jobStatus === 'running' || jobStatus === 'pending') {
      const jobStatusUrl = `${hereBatchUrl}/${jobId}?apikey=${apiKey}`;
      const statusResponse = await axios.get(jobStatusUrl);
      jobStatus = statusResponse.data.Response.Status;

      if (jobStatus === 'completed') break;

      // Delay before checking again
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Fetch the result
    const resultUrl = `${hereBatchUrl}/${jobId}/result?apikey=${apiKey}`;
    const resultResponse = await axios.get(resultUrl);

    // Process and return geocoded addresses
    const addresses = resultResponse.data.map(item => ({
      lat: item.latitude,
      lon: item.longitude,
      address: item.address.label || 'Address not found',
    }));

    return addresses;
  } catch (error) {
    console.error('Error fetching batch addresses:', error);
    throw error;
  }
};


