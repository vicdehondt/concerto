import { useState } from "react";
import styles from "@/styles/ArtistAndLocationUpload.module.css";
import Searchbar from "./Searchbar";
import LocationPicker from "./LocationPicker";
import { Artist, Venue, APIResponse } from "./BackendTypes";

type ArtistAndLocationUploadProps = {
  locationCallback: (venue: Venue) => void;
  artistCallback: (artist: Artist) => void;
  artist: Artist | null;
  venueID?: string;
  error?: string | null;
};

function ArtistAndLocationUpload({
  locationCallback,
  artistCallback,
  artist,
  venueID,
  error,
}: ArtistAndLocationUploadProps) {
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

  function handlechange(value: string) {
    const currentTime = new Date();
    if (!(currentTime.getTime() - lastRequest.getTime() < timeTreshold) && value.length !== 0) {
      fetchArtist(value);
      lastRequest = new Date();
    }
  }

  async function fetchArtist(query: string) {
    try {
      const response = await fetch(apiURL + query + queryFormat + queryLimit);
      if (response.ok) {
        const data = await response.json();
        setAPIResponse(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function showArtists(artists: Array<Artist>) {
    if (apiResponse.artists.length != 0) {
      return artists.map((artist: Artist, index) => {
        return (
          <div
            key={index}
            className={styles.artistCard}
            onClick={(event) => {
              artistCallback(artist);
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
            <LocationPicker
              venueID={venueID}
              locationCallback={(venue: Venue) => locationCallback(venue)}
            />
          ) : (
            <LocationPicker locationCallback={locationCallback} />
          )}
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.text}>Artist:</div>
        {error && <div className={styles.error}>{error}</div>}
        {artist && <div className={styles.name}>{artist.name}</div>}
      </div>
      <div className={styles.searchArtists}>
        <Searchbar
          type="thin"
          onClick={(event) => null}
          onChange={(string: string) => handlechange(string)}
        />
      </div>

      <div className={styles.searchResults}>{showArtists(apiResponse.artists)}</div>
    </div>
  );
}

export default ArtistAndLocationUpload;
