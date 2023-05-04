import Image from 'next/image'
import { Inter } from 'next/font/google'
import Jokes from './jokes'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main>
      <div>
        <Jokes />
      </div>
    </main>
  )
}
