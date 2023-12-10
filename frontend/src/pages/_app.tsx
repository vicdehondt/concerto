import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from "@/components/Navbar";
import HamburgerMenu from '@/components/HamburgerMenu';
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setIsMobile(window.innerWidth <= 850);
      });
    };

    // Initial check
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        const notHomePage = router.asPath != "/";
        const notRegisterPage = !router.asPath.includes("/register");
        const notLoginPage = !router.asPath.includes("/login");
        if ((response.status == 400) && notHomePage && notRegisterPage && notLoginPage) {
          const from = router.query.from || '/';
          router.push(`/login?from=${router.asPath}`);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function NavbarOrHamburgerIfNeeded() {
    const path = router.asPath;
    if (path != "/login" && path != "/register") {
      return isMobile ? <HamburgerMenu pictureSource="/photos/Rombout.jpeg" /> : <Navbar pictureSource="/photos/Rombout.jpeg" />
    }
  }

  return(
    <>
      <NavbarOrHamburgerIfNeeded />
      <Component {...pageProps} />
    </>
  )
}
