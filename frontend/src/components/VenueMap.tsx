import styles from "@/styles/VenueMap.module.css";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import EventMarker from "@/components/EventMarker";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { APIKEY } from "@/secrets/secrets";
import { Venue, Event } from "./BackendTypes";

type VenueMapProps = {
  events: Array<Event>;
};

type VenueEventArray = {
  venue: Venue;
  events: Array<Event>;
};

export default function VenueMap({ events }: VenueMapProps) {
  const [sortedEvents, setSortedEvents] = useState<Array<VenueEventArray>>([]);

  // Make an array of VenueEventArrays that hold a venue and all the events that take place there.
  useEffect(() => {
    const sortedEvents: Array<VenueEventArray> = [];
    events.forEach((event) => {
      if (
        sortedEvents.some(
          (venueEvent: VenueEventArray) => venueEvent.venue.venueID === event.Venue.venueID
        )
      ) {
        sortedEvents.forEach((venueEvent: VenueEventArray) => {
          if (venueEvent.venue.venueID === event.Venue.venueID) {
            venueEvent.events.push(event);
          }
        });
      } else {
        sortedEvents.push({ venue: event.Venue, events: [event] });
      }
    });
    setSortedEvents(sortedEvents);
  }, [events]);

  function showMarkers() {
    return sortedEvents.map((venueEvent: VenueEventArray) => {
      return (
        <Marker
          key={venueEvent.venue.venueID} // Ensure each marker has a unique key
          position={[venueEvent.venue.lattitude, venueEvent.venue.longitude]}
        >
          <div className={styles.popupBox}>
            <Popup>
              <div>
                <strong>Venue:</strong> {venueEvent.events[0].Venue.venueName}
                <div className={styles.eventcardContainer}>
                  {venueEvent.events.map((event, i) => {
                    return <EventMarker key={event.eventID} event={event} />;
                  })}
                </div>
              </div>
            </Popup>
          </div>
        </Marker>
      );
    });
  }

  // Use Stadia Maps to show the map with all the venues.
  return (
    <MapContainer
      style={{ height: "100%", zIndex: 5 }}
      center={[50.85, 4.35]}
      zoom={12}
      minZoom={3}
      maxZoom={19}
      maxBounds={[
        [-85.06, -180],
        [85.06, 180],
      ]}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
        url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${APIKEY}`}
      />
      {showMarkers()}
    </MapContainer>
  );
}
