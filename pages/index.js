import Image from 'next/image'
import { Inter } from 'next/font/google'
import Jokes from './jokes'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main>
      <div>
        <Jokes />
      </div>
      <div>
        <Link href="/tags">tags</Link>
      </div>
    </main>
  )
}
