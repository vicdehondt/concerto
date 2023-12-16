import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet"
import { useEffect, useState } from "react";
import EventMarker from "@/components/EventMarker"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { APIKEY}  from "@/secrets/secrets";
import { Venue, Event } from "./BackendTypes";
import { environment } from "./Environment";

export default function MyMap({venues, longitude, latitude}: {venues: Array<Venue>, longitude: number, latitude: number}) {
  const [venueDetails, setVenueDetails] = useState<Record<string, Event>>(
    {}
  );

  async function fetchVenueDetails(venueID: string) {
    const response = await fetch(environment.backendURL + '/search/events/filter' + `?venueID=${venueID}`);
    const data = await response.json();
    if (data.length > 0) {
      const event = data[0] as Event;
      setVenueDetails((prevDetails) => ({
        ...prevDetails,
        [venueID]: event,
      }));
    }
  }

  useEffect(() => {
    venues.map((venue) => {
      fetchVenueDetails(venue.venueID);
    })
  }, [venues]);

  const venuesWithEvents = venues.filter((venue) => venueDetails[venue.venueID]);

  return <MapContainer
            style={{ height: '100%', zIndex: 5 }}
            center={[longitude, latitude]}
            zoom={12}
            minZoom={3}
            maxZoom={19}
            maxBounds={[[-85.06, -180], [85.06, 180]]}
            scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
                url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${APIKEY}`}
            />
            {venuesWithEvents.map((venue: Venue) => {
              const even = venueDetails[venue.venueID]
              return (
                <Marker
                  key={venue.venueID} // Ensure each marker has a unique key
                  position={[venue.lattitude, venue.longitude]}
                  >
                  <Popup>
                  <div>
                    <strong>Venue:</strong> {venue.venueName}
                    <EventMarker event={even}/>
                  </div>
                  </Popup>
                </Marker>
              )
            })}
    </MapContainer>
}