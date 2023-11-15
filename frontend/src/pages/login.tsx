import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import type { NextApiRequest, NextApiResponse } from 'next'
import { FormEvent } from 'react'
import { useRouter } from "next/router";

const inter = Inter({ subsets: ['latin'] })

const environment = {
  backendURL: "http://localhost:8080"
}
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev"
}

export default function Login() {
  const router = useRouter();

  function goToHome() {
    // router.replace("/")
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/login", {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'include',
    })

    // Handle response if necessary
    const data = await response.json()
    if (response.status == 200) {
      goToHome();
    }
    // ...
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
            <input className={[styles.registerInput, styles.usernameInput].join(" ")} type="text" name='username' id='username' required placeholder="Username" />
            <input className={[styles.registerInput, styles.passwordInput].join(" ")} type="password" name='password' id='password' required placeholder="Password" />
            <button className={[styles.registerInput, styles.submitButton].join(" ")} type='submit'>Submit</button>
          </form>
        </div>
      </main>
    </>
  )
}