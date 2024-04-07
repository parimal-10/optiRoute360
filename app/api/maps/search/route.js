export async function GET(req) {
    const mapUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${req}&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`;

    try {
        const response = await fetch(mapUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from the Google Places Text Search API');
        }
        const data = await response.json();
        console.log(data); 
        return data; 
    } catch (error) {
        console.error('Error fetching data:', error);
        return null; 
    }
}
