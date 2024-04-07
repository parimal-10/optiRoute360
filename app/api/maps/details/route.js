import { NextResponse } from "next/server";
export async function POST(req){
    const {selectedLoc} = await req.json();
    for (let x of selectedLoc){
    console.log(x.loc.place_id);
    const mapUrl = `https://maps.googleapis.com/maps/api/place/details/json?fields=opening_hours&place_id=${x.loc.place_id}&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`
    //const mapUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=&fields=opening_hours&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`;
        const response = await fetch(mapUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
    }
    return NextResponse.json({message:"adhfb"});
}
