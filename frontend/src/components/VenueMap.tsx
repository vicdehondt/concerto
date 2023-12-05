import { MapContainer, Marker, TileLayer, Popup, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

type Venue = {
    venueID: string;
    venueName: string;
    longitude: number;
    lattitude: number;
    ratingID: number;
  }

export default function MyMap({venues, longitude, latitude}: {venues: Array<Venue>, longitude: number, latitude: number}) {
    return <MapContainer
            style={{ height: '100%' }}
            center={[longitude, latitude]}
            zoom={12}
            minZoom={3}
            maxZoom={19}
            maxBounds={[[-85.06, -180], [85.06, 180]]}
            scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            />
            {venues.map((venue) => (
            <Marker
            key={venue.venueID} // Ensure each marker has a unique key
            position={[venue.lattitude, venue.longitude]}
            >
            <Popup>{venue.venueName}</Popup>
            </Marker>
        ))}
    </MapContainer>
}