"use client";
import React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentLocation } from "@/utils/getCurrentLocation";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { Grid } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from "next/navigation";

const containerStyle = {
    width: "1100px",
    height: "600px",
};

export default function User( { params } ) {
    const router = useRouter();
    const [initialTime, setInitialTime] = useState(dayjs());
    const [search, setSearch] = useState("");
    const [dropDown, setDropDown] = useState([]);
    const [locationData, setLocationData] = useState(null);
    const [center, setCenter] = useState({
        lat: 0,
        lng: 0,
    });
    const [selectedLoc, setSelectedLoc] = useState([]);

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

    const handleTimeChange = (newValue) => {
        setInitialTime(newValue);
    };

    function handleCurrLocation(e) {
        e.preventDefault();
        setLocationData(e.target.value);
    }

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        getCurrentLocation()
            .then(({ position, data }) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const loc = data.results[0];
                setCenter({ lat, lng });
                setLocationData(loc.formatted_address);
                setSelectedLoc((prevLoc) => [...prevLoc, { isMandatory: false, loc }]);
            })
            .catch((error) => {
                console.error("Error getting current location:", error);
            });
    }, []);

    const searchPlace = async (e) => {
        const res = await axios.post("/api/maps/search", { center, search });
        setDropDown(res.data.results);
    };

    function addLocation(loc) {
        setSelectedLoc((prevLoc) => [...prevLoc, { isMandatory: false, loc }]);
        setSearch("")
        setDropDown([])
    }

    const findDist = async () => {
        const res = await axios.post("/api/maps/distance", { selectedLoc });
        localStorage.setItem('routeData', JSON.stringify(res.data));
        router.push(`${params.id}/result`);
    }

    function handleDelete(index) {
        setSelectedLoc(prevLoc => prevLoc.filter((_, idx) => idx !== index));
    };

    const handleCheckOption = (index) => {
        setSelectedLoc((prevLoc) =>
            prevLoc.map((loc, i) =>
                i === index ? { ...loc, isMandatory: !loc.isMandatory } : loc
            )
        );
    };

    return (
        <>
            <div className="flex gap-10 my-5 items-center mx-10">
                <TextField
                    id="filled-basic"
                    variant="filled"
                    value={locationData}
                    onChange={handleCurrLocation}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MobileTimePicker value={initialTime} onChange={handleTimeChange} />
                </LocalizationProvider>
                <div className="flex flex-col gap-2 relative">
                    <Paper
                        component="form"
                        sx={{
                            p: "2px 4px",
                            display: "flex",
                            alignItems: "center",
                            width: 800,
                        }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            searchPlace();
                        }}
                    >
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search Google Maps"
                            inputProps={{ "aria-label": "search google maps" }}
                            value={search}
                            onChange={handleSearchChange}
                        />
                        <IconButton
                            type="button"
                            sx={{ p: "10px" }}
                            aria-label="search"
                            onClick={searchPlace}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                    <div className="absolute top-full z-10 bg-white mt-2 rounded-lg shadow-xl">
                        {dropDown.length > 0 &&
                            dropDown.slice(0, 10).map((loc, index) => (
                                <div className="px-3 py-1 hover:bg-gray-200 cursor-pointer">
                                    <Typography onClick={() => addLocation(loc)}>
                                        {loc.name}, {loc.formatted_address}
                                    </Typography>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <button onClick={findDist} className="bg-blue-500 p-2 rounded-lg text-white justify-self-end">
                    Find optimal route
                </button>
            </div>

            <Grid container>
                <Grid item xs={3}>
                    <div>
                        <div className="bg-gray-200 py-2">
                            <Typography className="text-center text-xl">
                                Selected Locations
                            </Typography>
                        </div>
                        {selectedLoc.length > 0 && (
                            <div>
                                {selectedLoc.map((i, index) => (
                                    <div className="p-2">
                                        <Typography>{i.loc.name},{i.loc.formatted_address}</Typography>
                                        <div className="flex gap-2">
                                            <IconButton onClick={() => handleCheckOption(index)}>
                                                <Checkbox />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                {/* <MobileTimePicker value={time} onChange={handleTimeChange} /> */}
                                            </LocalizationProvider>
                                        </div>
                                        <hr />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Grid>

                <Grid item xs={9} alignItems="center" justifyContent="center" className="p-2 bg-blue-200 w-full">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={9}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                        >
                            {selectedLoc.length > 0 &&
                                selectedLoc.map((i, index) => (
                                    <MarkerF
                                        position={i.loc.geometry.location}
                                    />
                                ))
                            }
                        </GoogleMap>
                    ) : (
                        <></>
                    )}
                </Grid>
            </Grid>
        </>
    );
}
