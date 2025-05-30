import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <footer className="footer">
        © {new Date().getFullYear()} DistroMedia &bull; All rights reserved
      </footer>
    </>
  );
}

export default MyApp; 