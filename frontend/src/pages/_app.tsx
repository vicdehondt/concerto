import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { useEffect } from 'react';

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if ((response.status == 400) && (router.asPath != "/")) {
          router.push("/login")
        }
      });
  }, [])

  function NavbarIfNeeded() {
    const path = router.asPath;
    if (path != "/login" && path != "/register") {
      return <Navbar pictureSource="/photos/Rombout.jpeg" />
    }
  }

  return(
    <>
      <NavbarIfNeeded />
      <Component {...pageProps} />
    </>
  )
}
