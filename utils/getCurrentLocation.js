export async function getCurrentLocation() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000, 
    maximumAge: 0,
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
    console.log(data); 
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function failed() {
  console.log("Failed to get Location");
}
