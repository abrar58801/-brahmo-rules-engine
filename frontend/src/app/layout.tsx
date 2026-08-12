import './globals.css'; // Make sure this matches your CSS file path

export const metadata = {
  title: 'BRAHMO Rules Engine',
  description: 'BFS Traversal + 5-Check Filter Pipeline',
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
  );
}