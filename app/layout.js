export const metadata = {
  title: 'Azure Web Admin',
  description: 'Login y panel administrativo con Azure SQL'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, Arial, sans-serif', background: '#f6f8fa' }}>
        {children}
      </body>
    </html>
  );
}
