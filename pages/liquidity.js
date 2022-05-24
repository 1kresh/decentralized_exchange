import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Liquidity() {
  

    const openWithoutFocus = (page) => {
        window.open(page, '_blank');
        handle.blur();
        window.focus();
      }

  const tooglePage = (evt) => {
    evt.preventDefault();

    if (evt.which) { // if e.which, use 2 for middle button
      if (evt.which === 2) {
        openWithoutFocus("/");
      }
    } else if (evt.button) { // and if e.button, use 4
      if (navigator.userAgent.indexOf("Chrome") != -1 && evt.button === 1) {
        openWithoutFocus("/");
      } else if (evt.button === 4) {
        openWithoutFocus("/");
      }
    } else {
      setTimeout(() => {  window.location.href = "/"; }, 275);
      document.getElementById('liqBtn').classList.toggle(styles.toogle_menu);
      document.getElementById('swpBtn').classList.toggle(styles.toogle_menu);
    }
  }
  
  const upPage = () => {
    window.location.href = "#";
  }

  return (
    <div class={styles.container}>
    <Head>
      <title>Simple Swap</title>
      <meta name="description" content="Exchange for ethereum network" />
      <link rel="icon" href="/icon.ico" />
    </Head>

    <main class={styles.main}>
      <nav class="navbar navbar-light fixed-top">
      <a class="navbar-brand" href="#" draggable="false">
        <img src="/icon.ico" width="48" height="48" class={`d-inline-block ${styles.icon} ${styles.unselectable}`} alt="SIMSWAP" draggable="false"></img>
      </a>
      <div class={`btn-group ${styles.menu}`}>
        <button id="swpBtn" class={`btn ${styles.activated_menu} ${styles.swap_button} ${styles.menu_button} ${styles.liq_toogle}`} onMouseDown={tooglePage}>Swap</button>
        <button id="liqBtn" class={`btn ${styles.disactivated_menu} ${styles.liquidity_button} ${styles.menu_button} ${styles.liq_toogle}`} onClick={upPage}>Liquidity</button>
      </div>
      </nav>

    </main>

    <footer class={styles.footer}>
      <a
        href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{' '}
        <span class={styles.logo}>
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </span>
      </a>
    </footer>
  </div>
  )
  
}

