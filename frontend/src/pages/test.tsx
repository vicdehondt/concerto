import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { FormEvent, useState } from 'react'
import { useRouter } from "next/router";
import Notification from '@/components/Notification';

const inter = Inter({ subsets: ['latin'] })



export default function Test() {


  return (
    <div className={styles.page}>
      <Notification />
    </div>
  )
}