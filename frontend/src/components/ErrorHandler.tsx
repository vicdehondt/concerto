import { NextRouter } from "next/router";

// Handle errors when fetching data from the backend when the backend is down.
export const handleFetchError = (error: any, router: NextRouter) => {
  console.log("Fetch error: ", error.message)
  router.push("/down");
};