"use client";
import React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentLocation } from "@/utils/getCurrentLocation";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

const containerStyle = {
  width: "400px",
  height: "400px",
};

// const center = {
//   lat: -3.745,
//   lng: -38.523,
// };

export default function User() {
  const [time, setTime] = useState(dayjs());
  const [search, setSearch] = useState("");
  const [dropDown, setDropDown] = useState([]);
  const [locationData, setLocationData] = useState(null);
  const [center, setCenter] = useState({
    lat: 0,
    lng: 0,
  });
  const [selectedLoc, setSelectedLoc] = useState([]);
  const [selectedLocName,setselectedLocName] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY,
  });

  const [map, setMap] = useState(null);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleTimeChange = (newValue) => {
    setTime(newValue);
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
        setCenter({ lat, lng });
        setLocationData(data.results[0].formatted_address);
      })
      .catch((error) => {
        console.error("Error getting current location:", error);
      });
  }, []);

  const searchPlace = async () => {
    const res = await axios.post("/api/maps/search", { center, search });
    setDropDown(res.data.results);
  };

  function addLocation(loc) {
    setSelectedLoc((prevLoc) => [...prevLoc, loc]);
    setselectedLocName((prevLoc)=>[...prevLoc,loc.formatted_address])
  }

  const findDist = async()=>{
    const res = await axios.post("/api/maps/distance",{selectedLocName});
    console.log(res.data);
  }

  return (
    <>
    <button onClick={findDist}>FIND</button>
      <div className="flex flex-col gap-2">
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: 400,
          }}
        >
          <IconButton sx={{ p: "10px" }} aria-label="menu">
            <MenuIcon />
          </IconButton>
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
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            color="primary"
            sx={{ p: "10px" }}
            aria-label="directions"
          >
            <DirectionsIcon />
          </IconButton>
        </Paper>
        {dropDown.length > 0 &&
          dropDown.map((loc, index) => (
            <div>
              <Typography onClick={() => addLocation(loc)}>
                {loc.formatted_address}
              </Typography>
            </div>
          ))}
      </div>
      <TextField
        id="filled-basic"
        variant="filled"
        value={locationData}
        onChange={handleCurrLocation}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MobileTimePicker value={time} onChange={handleTimeChange} />
      </LocalizationProvider>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={9}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Child components, such as markers, info windows, etc. */}
          <></>
          {selectedLoc.length > 0 &&
            selectedLoc.map((loc, index) => (
              <MarkerF
                position={loc.geometry.location}
                onLoad={() => console.log("Marker Loaded")}
              />
            ))}
          <MarkerF
            position={center}
            onLoad={() => console.log("Marker Loaded")}
          />
        </GoogleMap>
      ) : (
        <></>
      )}
      {selectedLoc.length > 0 && (
        <div>
          {selectedLoc.map((loc, index) => (
            <Typography>{loc.formatted_address}</Typography>
          ))}
        </div>
      )}
    </>
  );
}
