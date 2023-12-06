import { useEffect, useState } from "react";
import styles from "../styles/ArtistAndLocationUpload.module.css";
import { Star } from "lucide-react";
import Searchbar from "./Searchbar";

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Artist = {
  id: string;
  type: string;
  name: string;
};

type APIResponse = {
  created: string;
  artists: Array<Artist>;
};

type Venue = {
  venueID: string;
  venueName: string;
  longitude: number;
  latitude: number;
  ratingID: number;
}

function ArtistAndLocationUpload({
  locationCallback,
  artistCallback
}: {
  locationCallback: (venue: Venue) => void,
  artistCallback: (artist: Artist) => void;
}) {

  const [selectedArtist, setSelectedArtist] = useState({name: ""})
  const dummyResponse: APIResponse = {
    created: "",
    artists: []
  };
  const [apiResponse, setAPIResponse] = useState(dummyResponse);
  const [venueOptions, setVenueOptions] = useState([]);


  const apiURL = "https://musicbrainz.org/ws/2/artist?query="
  const queryFormat = "&fmt=json"
  const queryLimit = "&limit=10"

  var lastRequest = new Date();
  const timeTreshold = 1001;

  useEffect(() => {
    fetch(environment.backendURL + "/venues", {
      mode: "cors",
      credentials: "include",
    })
    .then((response) => {
      return response.json();
    }).then((responseJSON) => {
      setVenueOptions(responseJSON);
    });
  }, [])

  function handlechange(value: string) {
    const currentTime = new Date();
    if (!((currentTime.getTime() - lastRequest.getTime()) < timeTreshold)) {
      fetchArtist(value)
      lastRequest = new Date();
    }
  }

  function fetchArtist(query: string) {
    fetch(apiURL + query + queryFormat + queryLimit)
    .then((response) => {
      return response.json();
    })
    .then((responseJSON) => {
      setAPIResponse(responseJSON);
    });
  }

  function showArtists(artists: Array<Artist>) {
    if (apiResponse.artists.length != 0) {
      return artists.map((artist: Artist) => {
        return (
          <div key={artist.id} className={styles.artistCard} onClick={(event) => {
              artistCallback(artist);
              setSelectedArtist(artist);
            }}>
            {artist.name}
          </div>
        );
      });
    }
  }

  function showVenueOptions() {
    return venueOptions.map((venue: Venue) => {
      return (
        <option key={venue.venueID} value={venue.venueName} data-venue={JSON.stringify(venue)}>{venue.venueName}</option>
      )
    });
  }

  // De locationCallback moet later gebruikt worden voor
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.text}>Location:</div>
        <div className={styles.name}>
        <select name="venue" id="venue" onChange={(event) => {
          const selectedOption = event.target.options[event.target.selectedIndex].getAttribute("data-venue");
          const selectedVenue = selectedOption != null ? JSON.parse(selectedOption) : {venueID: "123", venueName: "Not selected"};
          locationCallback(selectedVenue);
        }}>
            <option key="1" value="" hidden defaultValue="Choose venue" >Choose venue</option>
            {showVenueOptions()}
          </select>
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.text}>Artist:</div>
        <div className={styles.name}>
          {selectedArtist.name}
        </div>
      </div>
      <div className={styles.searchArtists}>
        <Searchbar type="thin" onChange={(string: string) => handlechange(string)} />
      </div>
      <div className={styles.searchResults}>
        {showArtists(apiResponse.artists)}
      </div>
    </div>
  );
}

export default ArtistAndLocationUpload;
