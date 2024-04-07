import { NextResponse } from "next/server";
export async function POST(req) {
    try {
        const {search} = await req.json();
        console.log(search);
        const mapUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?location=42.3675294%2C-71.186966&query=${search}&radius=50000&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`;
        const response = await fetch(mapUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from the Google Places Text Search API');
        }
        const data = await response.json();
        console.log(data); 
        //return data;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return null; 
    }
}
