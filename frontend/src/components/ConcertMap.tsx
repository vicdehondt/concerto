import { MAPBOX_API_KEY } from "@/secrets/secrets";
import React, { useCallback, useEffect, useState } from "react";
import MapGL, { Source, Layer, NavigationControl, GeolocateControl, Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import polyline from "@mapbox/polyline";
import { Event } from "./BackendTypes";

type ConcertMapProps = {
  concert: Event;
};

// The MapBox map that shows the route and the venue.
// Information from here: https://docs.mapbox.com/help/getting-started/directions/
// here: https://www.mapbox.com/install/javascript/bundler-install/
// and here: https://docs.mapbox.com/api/navigation/directions/

// It uses the packages mapbox and react-map-gl.
function ConcertMap({ concert }: ConcertMapProps) {
  const [route, setRoute] = useState<any>(null);

  const mapboxToken = MAPBOX_API_KEY; // Store your token securely

  const getRoute = useCallback(
    async (position: GeolocationPosition) => {
      const start = [position.coords.longitude, position.coords.latitude];
      const end = [concert.Venue.longitude, concert.Venue.lattitude];

      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${start.join(",")};${end.join(
            ","
          )}?access_token=${MAPBOX_API_KEY}`
        );

        const json = await query.json();
        const data = json.routes[0];

        const coordinates = polyline.decode(data.geometry);

        const routeGeoJSON = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates.map(([lat, lng]) => [lng, lat]),
          },
        };

        setRoute(routeGeoJSON);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    },
    [concert.Venue.lattitude, concert.Venue.longitude]
  );

  // Use geolocation to get the current position of the user, if possible.
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(getRoute);
  }, [getRoute]);

  return (
    <MapGL
      mapStyle="mapbox://styles/mapbox/streets-v12"
      initialViewState={{
        latitude: concert.Venue.lattitude,
        longitude: concert.Venue.longitude,
        zoom: 15,
      }}
      mapboxAccessToken={mapboxToken}
    >
      <NavigationControl />
      <GeolocateControl />
      <Marker
        key={concert.Venue.venueID}
        longitude={concert.Venue.longitude}
        latitude={concert.Venue.lattitude}
      ></Marker>

      {route && (
        <Source id="route" type="geojson" data={route}>
          <Layer
            id="route"
            type="line"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "#5abcff",
              "line-width": 8,
            }}
          />
        </Source>
      )}
    </MapGL>
  );
}

export default ConcertMap;
