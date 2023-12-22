import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { environment } from "@/components/Environment";
import { handleFetchError } from "@/components/ErrorHandler";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
          router.push(`/map`);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function NavbarIfNeeded() {
    const path = router.asPath;
    if (!path.includes("/login") && !path.includes("/register")) {
      return <Navbar />;
    }
  }

  return (
    <>
      <NavbarIfNeeded />
      <Component {...pageProps} />
    </>
  );
}
