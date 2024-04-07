import { NextResponse } from "next/server";
export async function POST(req) {
    const {selectedLocName} = await req.json();
    console.log(selectedLocName);
    const originsString = selectedLocName.join('|');
    const destinationsString = selectedLocName.join('|');
    const mapUri = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${encodeURIComponent(destinationsString)}&origins=${encodeURIComponent(originsString)}&units=imperial&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`;
    
    try {
        const response = await fetch(mapUri);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Google Distance Matrix API');
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
