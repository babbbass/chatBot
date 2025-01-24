import type { Metadata } from "next"
import "./globals.css"
import { Banner } from "./components/Banner"

export const metadata: Metadata = {
  title: "PSG BOYZ CHAT",
  description: "Toutes les reponses sur le Paris Saint Germain",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='fr'>
      <body className='py-2 flex flex-col justify-start items-center h-screen bg-gradient-to-b from-primary to-secondary'>
        <Banner />
        {children}
      </body>
    </html>
  )
}
