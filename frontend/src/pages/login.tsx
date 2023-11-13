import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import type { NextApiRequest, NextApiResponse } from 'next'
import { FormEvent } from 'react'
import { useRouter } from "next/router";

const inter = Inter({ subsets: ['latin'] })


export default function Login() {
  const router = useRouter();

  function goToHome() {
    router.replace("/")
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch("http://localhost:8080/login", {
      method: 'POST',
      body: formData,
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
        {/* <form action="http://localhost:8080/event/add" method="POST" enctype='multipart/form-data'> */}
        <form onSubmit={onSubmit} className={styles.loginForm}>
            <h1>Login</h1>
            <input className={[styles.loginInput, styles.usernameInput].join(" ")} type="text" name='username' id='username' required placeholder="Username" />
            <input className={[styles.loginInput, styles.passwordInput].join(" ")} type="password" name='password' id='password' required placeholder="Password" />
            <button className={styles.submitButton} type='submit'>Submit</button>
          </form>
        </div>
      </main>
    </>
  )
}