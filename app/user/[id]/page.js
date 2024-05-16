"use client";
import React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentLocation } from "@/utils/getCurrentLocation";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { Grid, Box } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4, 
  height: 600,
};

const containerStyle = {
  width: "100%",
  height: "80vh",
};

export default function User({ params }) {
  const router = useRouter();
  const [initialTime, setInitialTime] = useState(dayjs());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [dropDown, setDropDown] = useState([]);
  const [locDropDown, setLocDropDown] = useState([]);
  const [locationData, setLocationData] = useState("");
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
    setSearch(e.target.value);
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
        setSelectedLoc((prevLoc) => [
          ...prevLoc,
          { isMandatory: false, loc, time: initialTime, waitTime: 0 },
        ]);
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
    setSelectedLoc((prevLoc) => [
      ...prevLoc,
      { isMandatory: false, loc, time: dayjs(), waitTime: 45 },
    ]);
    setSearch("");
    setDropDown([]);
    setCenter(loc.geometry.location);
  }

  const findDist = async () => {
    if (selectedLoc.length > 1) {
      const res = await axios.post("/api/maps/distance", {
        initialTime,
        selectedLoc,
      });
      console.log(res);
      localStorage.setItem("routeData", JSON.stringify(res.data));
      router.push(`${params.id}/result`);
    }
  };

  function handleDelete(index) {
    setSelectedLoc((prevLoc) => prevLoc.filter((_, idx) => idx !== index));
  }

  const handleCheckOption = (index) => {
    setSelectedLoc((prevLoc) =>
      prevLoc.map((loc, i) =>
        i === index ? { ...loc, isMandatory: !loc.isMandatory } : loc
      )
    );
  };

  const handleTimeChangeDest = (newValue, index) => {
    setSelectedLoc((prevLoc) =>
      prevLoc.map((item, idx) =>
        idx === index ? { ...item, time: newValue } : item
      )
    );
  };

  const handleWaitingTimeChange = (newValue, index) => {
    setSelectedLoc((prevLoc) =>
      prevLoc.map((item, idx) =>
        idx === index ? { ...item, waitTime: newValue } : item
      )
    );
  };

  const userLocation = async () => {
    //setSearch(locationData);
    console.log(center);
    console.log(search);
    if (search === locationData) {
      const res = await axios.post("/api/maps/search", { center, search });
      setLocDropDown(res.data.results);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="flex flex-col gap-2 relative">
            <TextField
              component="form"
              id="filled-basic"
              variant="filled"
              label="Set Starting Location"
              value={locationData}
              onChange={handleCurrLocation}
              onSubmit={(e) => {
                e.preventDefault();
                userLocation();
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <div className="top-full z-10 bg-white mt-2 rounded-lg shadow-xl h-96">
              {locDropDown.length > 0 &&
                locDropDown.slice(0, 10).map((loc, index) => (
                  <div className="px-3 py-1 hover:bg-gray-200 cursor-pointer">
                    <Typography onClick={() => addLocation(loc)}>
                      {loc.name}, {loc.formatted_address}
                    </Typography>
                  </div>
                ))}
            </div>
          </div>
        </Box>
      </Modal>

      <div className="flex gap-10 my-5 items-center mx-10">
        <TextField
          component="form"
          id="filled-basic"
          variant="filled"
          label="Initial Location"
          value={locationData}
          onChange={handleCurrLocation}
          onSubmit={(e) => {
            e.preventDefault();
            userLocation();
          }}
          onClick={() => setOpen(true)}
          // type="text"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDateTimePicker
            value={initialTime}
            onChange={handleTimeChange}
            label="Starting Date Time"
          />
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
              ))}
          </div>
        </div>
        <button
          onClick={findDist}
          className="bg-blue-500 p-2 rounded-lg text-white justify-self-end"
        >
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
                {selectedLoc.map(
                  (i, index) =>
                    index !== 0 && (
                      <div className="p-2">
                        <Typography className="mb-2">
                          {i.loc.name},{i.loc.formatted_address}
                        </Typography>
                        <div className="flex gap-2">
                          <IconButton onClick={() => handleCheckOption(index)}>
                            <Checkbox />
                          </IconButton>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <MobileDateTimePicker
                              value={i.time}
                              onChange={(newValue) =>
                                handleTimeChangeDest(newValue, index)
                              }
                              label="Reach Before"
                            />
                          </LocalizationProvider>
                          <TextField
                            id="filled-basic"
                            variant="filled"
                            value={i.waitTime}
                            label="Waiting time"
                            onChange={(e) =>
                              handleWaitingTimeChange(
                                Number(e.target.value),
                                index
                              )
                            }
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                          <IconButton onClick={() => handleDelete(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </div>
                        <hr />
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        </Grid>

        <Grid
          item
          xs={9}
          alignItems="center"
          justifyContent="center"
          className="p-2 bg-blue-200 w-full"
        >
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              onLoad={onLoad}
              zomm={13}
              onUnmount={onUnmount}
            >
              {selectedLoc.length > 0 &&
                selectedLoc.map((i, index) => (
                  <MarkerF position={i.loc.geometry.location} />
                ))}
            </GoogleMap>
          ) : (
            <></>
          )}
        </Grid>
      </Grid>
    </>
  );
}
