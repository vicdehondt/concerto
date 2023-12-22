import { NextRouter } from "next/router";

export const handleFetchError = (error: any, router: NextRouter) => {
  console.log("Fetch error: ", error.message)
  router.push("/down");
};