'use client'
import dynamic from 'next/dynamic'

const PerceptualGame = dynamic(() => import('./components/PerceptualGame'), {
  ssr: false
})

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <PerceptualGame />
    </main>
  )
}