"use client"
import React from "react";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box"; // Import Box component for layout
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
    width: "1100px",
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

    function handlePath() {
        setPath(prevPath => {
            // Ensure we don't exceed the number of paths available
            const newPathIndex = prevPath + 1 < directionResponse.length ? prevPath + 1 : 0;
            return newPathIndex;
        });
    }

    return (
        <div>
            <div className="flex flex-wrap gap-5 items-start justify-center">
                {resultData && resultData.result.bestPath.slice(0, -1).map((nodeIndex, index) => (
                    <Card key={index} className="mb-4 w-full max-w-md bg-gray-50 shadow-lg h-auto min-h-36 flex flex-col justify-between">
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
            </div>

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
            <button onClick={handlePath}>Next</button>
        </div>
    );
}

