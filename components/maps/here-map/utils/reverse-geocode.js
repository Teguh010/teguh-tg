export const fetchAddress = async (latitude, longitude) => {
    const token = process.env.NEXT_PUBLIC_HERE_MAPS_TOKEN;
    const lang = "en-US";

    try {
        const response = await fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=${token}&at=${latitude},${longitude}&lang=${lang}`);
        const data = await response.json();

        return data.items[0];
    } catch (error) {
        console.error('Error fetching address:', error);

        return null;
    }
};
