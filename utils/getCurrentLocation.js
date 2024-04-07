export async function getCurrentLocation() {
  const options = {
    enableHighAccuracy: true, // Request high accuracy using GPS
    timeout: 5000, // Timeout for getting the location (milliseconds)
    maximumAge: 0, // Maximum age of cached position (milliseconds)
  };
  navigator.geolocation.getCurrentPosition(success, failed, options);
}

async function success(position) {
  console.log(position.coords);
  const reverseGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`;
  
  try {
    const response = await fetch(reverseGeocodingUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch data from reverse geocoding API');
    }
    const data = await response.json();
    console.log(data); // Here you can handle the data returned by the API
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function failed() {
  console.log("Failed to get Location");
}
