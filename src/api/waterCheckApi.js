import axios from 'axios';

export const checkWaterLocation = async (latitude, longitude) => {
  const options = {
    method: "GET",
    url: "https://isitwater-com.p.rapidapi.com/",
    params: { latitude, longitude },
    headers: {
      "X-RapidAPI-Key": process.env.EXPO_PUBLIC_IS_IT_WATER_API,
      "X-RapidAPI-Host": "isitwater-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error checking water location:', error);
    throw error;
  }
};
