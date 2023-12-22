import { useState } from "react";
import styles from "@/styles/ArtistAndLocationUpload.module.css";
import Searchbar from "./Searchbar";
import LocationPicker from "./LocationPicker";
import { Artist, Venue, APIResponse } from "./BackendTypes";

// locationCallback: callback to set venue in useState variable of surrounding component/page.
// artistCallback: callback to set artist of useState variable of surrounding component/page.
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
  error
}: ArtistAndLocationUploadProps) {
  const [apiResponse, setAPIResponse] = useState<APIResponse | null>(null);

  // Musicbrainz API to search for artists.
  const apiURL = "https://musicbrainz.org/ws/2/artist?query=";
  // Format needs to be JSON.
  const queryFormat = "&fmt=json";
  // Max 10 artist as result per search query.
  const queryLimit = "&limit=10";

  // Because we do not pay for the API, there is a cap of 1 request per second to the API.
  // To be sure, we wait 1ms longer => 1001ms
  var lastRequest = new Date();
  const timeTreshold = 1001;

  // Every time the use types and 1 second has passed since the last query, we fetch a response.
  function handlechange(value: string) {
    const currentTime = new Date();
    if (!(currentTime.getTime() - lastRequest.getTime() < timeTreshold) && value.length !== 0) {
      fetchArtist(value);
      lastRequest = new Date();
    }
  }

  // Fetch the artist based on the query typed in the search bar.
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

  // Show the artist in a list where every artist is clickable to select it.
  // The onClick selects the artist and uses the callback to give the surrounding component/page the selected artist.
  function showArtists(artists: Array<Artist>) {
    if (apiResponse && apiResponse.artists.length != 0) {
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
      {apiResponse && (
        <div className={styles.searchResults}>{showArtists(apiResponse.artists)}</div>
      )}
    </div>
  );
}

export default ArtistAndLocationUpload;
