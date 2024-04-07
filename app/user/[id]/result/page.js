"use client"
import { useEffect } from "react";

export default function Result () {
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('routeData'));
        console.log(data);
        // Use the data as needed
        localStorage.removeItem('routeData'); // Clean up
    }, []);
    return (
        <>
            <h1>Hii</h1>
        </>
    )
}