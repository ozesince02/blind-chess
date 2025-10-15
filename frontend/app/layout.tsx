import "./globals.css"

export const metadata = {
  title: 'Blind Chess',
  description: 'Play minimalist blind chess in your browser',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
