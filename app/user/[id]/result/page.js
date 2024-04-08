"use client"
import React from "react";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box"; // Import Box component for layout
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from "@react-google-maps/api";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const containerStyle = {
    width: "100%",
    height: "600px",
};

export default function Result() {
    const [resultData, setResultData] = useState(null);
    const [center, setCenter] = useState({
        lat: 0,
        lng: 0,
    });
    const [finalpath, setFinalPath] = useState([]);
    const [path, setPath] = useState(0);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('routeData'));
        if (data) {
            setResultData(data);
            setCenter(data.nodes[0].loc)
            const newPath = data.result.bestPath.slice(0, -1).map(i => data.nodes[i].name);
            setFinalPath(newPath);
        }
        calculateRoute()
    }, []);

    useEffect(() => {
        if (finalpath.length > 1) {
            calculateRoute();
        }
    }, [finalpath]);

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY,
    });

    const [map, setMap] = useState(null);

    const onLoad = React.useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null);
    }, []);

    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [center, map]);

    const [directionResponse, setdirectionResponse] = useState(null);
    const [distance, setDistance] = useState("");

    async function calculateRoute() {
        if (finalpath.length < 2) {
            return;
        }

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        const directionsResponses = [];

        for (let i = 0; i < finalpath.length - 1; i++) {
            const origin = finalpath[i];
            const destination = finalpath[i + 1];

            const response = await new Promise((resolve, reject) => {
                directionsService.route(
                    {
                        origin,
                        destination,
                        travelMode: google.maps.TravelMode.DRIVING
                    },
                    (response, status) => {
                        if (status === "OK") {
                            resolve(response);
                        } else {
                            reject(new Error("Directions request failed due to " + status));
                        }
                    }
                );
            });

            directionsResponses.push(response);
        }

        setdirectionResponse(directionsResponses);
    }

    function handlePath(inc) {
        if (inc) {
            setPath(prevPath => {
                const newPathIndex = prevPath + 1 < directionResponse.length ? prevPath + 1 : prevPath;
                return newPathIndex;
            });
        }
        else {
            setPath(prevPath => {
                const newPathIndex = prevPath - 1 >= 0 ? prevPath - 1 : prevPath;
                return newPathIndex;
            });
        }
    }

    return (
        <div>
            <div className="flex justify-between px-10 py-5 cursor-pointer">
                <div className="bg-blue-500 p-2 rounded-lg text-white content-center items-center justify-center" onClick={() => handlePath(false)}>
                    <ArrowBackIosIcon />
                    Prev
                </div>
                <div className="bg-blue-500 p-2 rounded-lg text-white" onClick={() => handlePath(true)}>
                    Next
                    <ArrowForwardIosIcon />
                </div>
            </div>

            <div className="flex flex-wrap gap-5 items-start justify-center">
                {resultData && resultData.result.bestPath.slice(0, -1).map((nodeIndex, index) => (
                    <Card key={index} className={`mb-4 w-full max-w-md ${(index === path || index === path + 1) ? 'bg-gray-300' : 'bg-gray-50'} shadow-lg h-auto min-h-36 flex flex-col justify-between`}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Step {index + 1}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {resultData.nodes[nodeIndex].name}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
                {/* Draw directed links */}
                {resultData && resultData.result.bestPath.slice(0, -1).map((nodeIndex, index) => {
                    if (index < resultData.result.bestPath.length - 1) {
                        // Calculate positions
                        const startX = index * 300 + 150;
                        const startY = 200;
                        const endX = (index + 1) * 300 + 150;
                        const endY = 200;

                        // Draw SVG line
                        return (
                            <svg key={index} className="absolute" style={{ top: '50px', zIndex: -1 }}>
                                <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="black" strokeWidth="2" />
                                <polygon points={`${endX},${endY} ${endX - 10},${endY - 5} ${endX - 10},${endY + 5}`} fill="black" />
                            </svg>
                        );
                    }
                })}
            </div>

            {isLoaded ? (
                <>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={9}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                    >
                        {directionResponse && directionResponse.map((response, index) => (
                            index === path &&
                            <DirectionsRenderer key={index} directions={response} />
                        ))}
                    </GoogleMap>
                </>
            ) : (
                <></>
            )}

            <Box mt={4} p={2} className="bg-blue-100 rounded-lg">
                <Typography variant="h6" gutterBottom>
                    Summary
                </Typography>
                <Typography variant="body1">
                    Maximum Destinations Visited: {resultData && resultData.result.maxNodesVisited - 1}
                </Typography>
                <Typography variant="body1">
                    Mandatory Destinations Visited: {resultData && `${resultData.result.maxMandatoryVisited}/${resultData.nodes.filter(node => node.isMandatory).length}`}
                </Typography>
            </Box>

        </div>
    );
}

