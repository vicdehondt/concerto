import { useEffect, useState } from "react";
import styles from "../styles/ArtistAndLocationUpload.module.css";
import Searchbar from "./Searchbar";
import LocationPicker from "./LocationPicker";

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Artist = {
  artistID: string;
  type: string;
  name: string;
  id: string;
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
};

type ArtistAndLocationUploadProps = {
  locationCallback: (venue: Venue) => void;
  artistCallback: (artist: Artist) => void;
  artistID?: string;
  venueID?: string;
};

function ArtistAndLocationUpload({
  locationCallback,
  artistCallback,
  artistID,
  venueID
}: ArtistAndLocationUploadProps) {
  const [selectedArtist, setSelectedArtist] = useState({ name: "" });
  const dummyResponse: APIResponse = {
    created: "",
    artists: [],
  };
  const [apiResponse, setAPIResponse] = useState(dummyResponse);

  const apiURL = "https://musicbrainz.org/ws/2/artist?query=";
  const queryFormat = "&fmt=json";
  const queryLimit = "&limit=10";

  var lastRequest = new Date();
  const timeTreshold = 1001;

  useEffect(() => {
    if (artistID) {
      fetch(environment.backendURL + `/artists/${artistID}`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          return response.json();
        })
        .then((responseJSON) => {
          if (responseJSON.name != null) {
            setSelectedArtist(responseJSON);
            artistCallback(responseJSON)
          }
        });
    }
  }, [artistID]);

  function handlechange(value: string) {
    const currentTime = new Date();
    if (!(currentTime.getTime() - lastRequest.getTime() < timeTreshold) && value.length !== 0) {
      fetchArtist(value);
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
      return artists.map((artist: Artist, index) => {
        return (
          <div
            key={index}
            className={styles.artistCard}
            onClick={(event) => {
              console.log(artist);
              artistCallback(artist);
              setSelectedArtist(artist);
            }}
          >
            {artist.name}
          </div>
        );
      });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.text}>Location:</div>
        <div className={styles.name}>
          {venueID ? (
            <LocationPicker venueID={venueID} locationCallback={locationCallback} />
          ) : (
            <LocationPicker locationCallback={locationCallback} />
          )}
        </div>
        </div>
        <div className={styles.box}>
        <div className={styles.text}>Artist:</div>
        <div className={styles.name}>{selectedArtist.name}</div>
        </div>
        <div className={styles.searchArtists}>
        <Searchbar type="thin" onChange={(string: string) => handlechange(string)} />
        </div>

        <div className={styles.searchResults}>{showArtists(apiResponse.artists)}</div>
        </div>
  );
}

export default ArtistAndLocationUpload;
