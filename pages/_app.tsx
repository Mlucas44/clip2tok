import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <footer style={{marginTop:48,padding:16,borderTop:'1px solid #eee',fontFamily:'Inter,system-ui'}}>
        <nav style={{display:'flex',gap:16}}>
          <a href="/privacy">Confidentialité</a>
          <a href="/terms">Conditions</a>
          <a href="/support">Support</a>
          <a href="/deletion">Suppression de données</a>
        </nav>
        <small style={{opacity:0.7}}>© {new Date().getFullYear()} Clip2Tok Studio</small>
      </footer>
    </>
  );
}
