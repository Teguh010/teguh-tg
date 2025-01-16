export const apiRequestServer = async (token: string | null, method: string, params: any) => {
  if (!token) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_TRACEGRID_API_URL + '/tracegrid_api/client';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const body = {
    id: '1',
    jsonrpc: '2.0',
    method: method,
    params: params
  };

  try {
    console.log('Making API request to:', url);
    console.log('Headers:', headers);
    console.log('Body:', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`);
    }

    const dataResponse = await response.json();
    console.log('API Response:', dataResponse);
    return dataResponse.result;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}; 