import axios from 'axios';

export const fetchGeocodeFromAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: address,
          key: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching geocode:', error);
    throw error;
  }
};
