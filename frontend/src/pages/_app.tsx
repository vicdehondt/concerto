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
        const notHomePage = router.asPath != "/";
        const notRegisterPage = router.asPath != "/register"
        const notLoginPage = router.asPath != "/login"
        if ((response.status == 400) && notHomePage && notRegisterPage && notLoginPage) {
          const from = router.query.from || '/';
          router.push(`/login?from=${router.asPath}`);
        }
      });
  }, [])

  function NavbarIfNeeded() {
    const path = router.asPath;
    if (!path.includes("/login") && !path.includes("/register")) {
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
