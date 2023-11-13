import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import type { NextApiRequest, NextApiResponse } from 'next'
import { FormEvent } from 'react'
import { useRouter } from "next/router";

const inter = Inter({ subsets: ['latin'] })



export default function Register() {
  const router = useRouter();

  function goToLogin() {
    router.replace("/login")
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch("http://localhost:8080/register", {
      method: 'POST',
      body: formData,
    })

    // Handle response if necessary
    const data = await response.json()
    if (response.status == 200) {
      goToLogin();
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
        <div className={[styles.page, styles.registerPage].join(" ")}>
          <form onSubmit={onSubmit} className={styles.registerForm}>
            <h1>Register</h1>
            <input className={[styles.registerInput, styles.usernameInput].join(" ")} type="text" name='username' id='username' required placeholder="Username" />
            <input className={[styles.registerInput, styles.emailInput].join(" ")} type="email" name='mail' id='mail' required placeholder="E-mail address" />
            <input className={[styles.registerInput, styles.passwordInput].join(" ")} type="password" name='password' id='password' required placeholder="Password" />
            <button className={styles.submitButton} type='submit'>Submit</button>
          </form>
        </div>
      </main>
    </>
  )
}