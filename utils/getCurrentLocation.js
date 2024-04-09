export async function getCurrentLocation() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const reverseGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`;

        try {
          const response = await fetch(reverseGeocodingUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch data from reverse geocoding API');
          }
          const data = await response.json();
          resolve({ position, data });
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(error),
      options
    );
  });
}