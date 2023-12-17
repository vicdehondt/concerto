import { MAPBOX_API_KEY } from '@/secrets/secrets';
import React, { useEffect, useState } from 'react';
import MapGL, { Source, Layer, NavigationControl, GeolocateControl, Marker } from 'react-map-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import polyline from '@mapbox/polyline';
import { Event } from './BackendTypes';

type ConcertMapProps = {
  concert: Event;
};

function ConcertMap({ concert }: ConcertMapProps) {

  const [route, setRoute] = useState<any>(null);

  const mapboxToken = MAPBOX_API_KEY; // Store your token securely

  const getRoute = async (position: GeolocationPosition) => {
    const start = [position.coords.longitude, position.coords.latitude];
    const end = [concert.Venue.longitude, concert.Venue.lattitude];

    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${start.join(',')};${end.join(',')}?access_token=${MAPBOX_API_KEY}`
    );

    const json = await query.json();
  const data = json.routes[0];

  // Decode polyline to get the array of coordinates
  const coordinates = polyline.decode(data.geometry);

  // Convert coordinates to a GeoJSON LineString
  const routeGeoJSON = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates.map(([lat, lng]) => [lng, lat])
    }
  };

  setRoute(routeGeoJSON);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(getRoute);
  }, []);

  return (
    <MapGL
      mapStyle="mapbox://styles/mapbox/streets-v12"
      initialViewState={{ latitude:  concert.Venue.lattitude, longitude: concert.Venue.longitude, zoom: 15 }}
      mapboxAccessToken={mapboxToken}
    >
      <NavigationControl />
      <GeolocateControl />
      <Marker key={concert.Venue.venueID} longitude={concert.Venue.longitude} latitude={concert.Venue.lattitude}>
      </Marker>

      {route && (
        <Source id="route" type="geojson" data={route}>
          <Layer
            id="route"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round'
            }}
            paint={{
              'line-color': '#5abcff',
              'line-width': 8
            }}
          />
        </Source>
      )}
    </MapGL>
  );
};

export default ConcertMap;










