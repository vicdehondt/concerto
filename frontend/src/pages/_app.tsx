import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { environment } from "@/components/Environment";
import { handleFetchError } from "@/components/ErrorHandler";

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
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const loggedIn = async () => {
      try {
        const response = await fetch(environment.backendURL + "/auth/status", {
          mode: "cors",
          credentials: "include",
        });
        const notHomePage = router.asPath != "/";
        const notRegisterPage = !router.asPath.includes("/register");
        const notLoginPage = !router.asPath.includes("/login");
        const notMapPage = !router.asPath.includes("/map");
        const notOnAllowedPages = notHomePage && notRegisterPage && notLoginPage && notMapPage;
        if (!response.ok && notOnAllowedPages) {
          router.push(`/`);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    loggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function NavbarOrHamburgerIfNeeded() {
    const path = router.asPath;
    if (!path.includes("/login") && !path.includes("/register")) {
      if (isMobile) {
        return <HamburgerMenu />;
      } else {
        return <Navbar />;
      }
    }
  }

  return (
    <>
      <NavbarOrHamburgerIfNeeded />
      <Component {...pageProps} />
    </>
  );
}
