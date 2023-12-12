import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { FormEvent, useState } from 'react'
import { useRouter } from "next/router";
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] })

const environment = {
  backendURL: "http://localhost:8080"
}
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev"
}

type Error = {
  type: string;
  value: string;
  msg: string;
}

export default function Login() {
  const router = useRouter();

  const[error, setError] = useState([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const response = await fetch(environment.backendURL + "/login", {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'include',
    })

    // Handle response if necessary
    const data = await response.json()
    if (response.status == 200) {
      const from = Array.isArray(router.query.from) ? router.query.from[0] : router.query.from || '/';
      router.push(from);
    } else if (response.status == 400) {
      setError(data.errors);
    }
  }

  function redirectURL() {
    const from = Array.isArray(router.query.from) ? router.query.from[0] : router.query.from || '/';
    return `/register?from=${encodeURIComponent(from)}`
  }

  function showErrors() {
    if (error) {
      return error.map((error: Error, index: number) => {
        return (
          <h4 key={index} className={styles.inputError}>{error.msg}</h4>
        );
      });
    }
  }

  return (
    <>
      <Head>
        <title>Concerto | Add an event</title>
        <meta name="description" content="Add your event!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.loginPage].join(" ")}>
        <form onSubmit={onSubmit} className={styles.loginForm}>
            <h1>Login</h1>
            {showErrors()}
            <input className={[styles.registerInput, styles.usernameInput].join(" ")} type="text" name='username' id='username' required placeholder="Username" />
            <input className={[styles.registerInput, styles.passwordInput].join(" ")} type="password" name='password' id='password' required placeholder="Password" />
            <button className={[styles.registerInput, styles.submitButton].join(" ")} type='submit'>Submit</button>
            <Link href={redirectURL()}>Don&apos;t have an account yet?</Link>
          </form>
        </div>
      </main>
    </>
  )
}