import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";

function NavbarIfNeeded() {
  const path = useRouter().asPath;
  if (path != "/login" && path != "/register") {
    return <Navbar pictureSource="/photos/Rombout.jpeg" />
  }
}

export default function App({ Component, pageProps }: AppProps) {

  return(
    <>
      <NavbarIfNeeded />
      <Component {...pageProps} />
    </>
  )
}
