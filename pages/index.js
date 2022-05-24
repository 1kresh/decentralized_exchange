import Head from 'next/head'
import styles from '../styles/Home.module.css'
import IMask from 'imask'
import {useEffect} from "react";

import extra_icons from '../public/extra_icons.json'

export default function Swap() {
  
  const openWithoutFocus = (page) => {
    var doc = window.open(page, '_blank');
    doc.blur()
    window.focus();
    
  }

  const tooglePage = (event) => {
    event.preventDefault();

    if (event.which) { // if e.which, use 2 for middle button
      if (event.which === 2) {
        openWithoutFocus("/liquidity");
      }
    } else if (event.button) { // and if e.button, use 4
      if (navigator.userAgent.indexOf("Chrome") != -1 && event.button === 1) {
        openWithoutFocus("/liquidity");
      } else if (event.button === 4) {
        openWithoutFocus("/liquidity");
      }
    } else {
      setTimeout(() => {  window.location.href = "/liquidity"; }, 275);
      document.getElementById('menuDiv').classList.toggle(styles.toogle_menu);
      document.getElementById('liqBtn').classList.remove(styles.hover_effect);
    }
  }

  const upPage = () => {
    window.location.href = "#";
  }

  const connectWallet = () => {

  }

  var numberMask0;
  var numberMask1;
  const inputValidate = () => {
    var inputs = document.getElementsByClassName(styles.input_field);
    var params = {
      mask: Number,
      scale: 18, 
      signed: false,
      thousandsSeparator: '', 
      padFractionalZeros: false,
      normalizeZeros: true,
      radix: '.',
      mapToRadix: [','], 
    }
    numberMask0 = IMask(inputs[0], params);
    numberMask1 = IMask(inputs[1], params);

    const logNumber0 = () => {
      console.log(0);
      console.log(numberMask0.value);
    }
    const logNumber1 = () => {
      console.log(1);
      console.log(numberMask1.value);
    }
    numberMask0.on('accept', logNumber0);
    numberMask1.on('accept', logNumber1);
  }

  const focusInput0 = () => {
    try { document.getElementById("input0").focus(); } catch (_) {}
  }

  const focusInput1 = () => {
    try { document.getElementById("input1").focus(); } catch (_) {}
  }

  var curTokenList = [];
  const getTokens = async () => {
    var res = await fetch("https://tokens.uniswap.org/");
    const tokenListAll = (await res.json())['tokens'];
    const chainId = 4;
    
    for (let token of tokenListAll) {
      if (token['chainId'] === chainId) {
        curTokenList.push(token);
      }
    }
  }

  useEffect(() => {
    window.onload = async () => {
      inputValidate();
      await getTokens();
      setToken(1, 'UNI');
    }
  }, [])

  var rotated = false;

  const toogleSettings = () => {
    var icon = document.getElementById('settings_icon'),
        deg = rotated ? 0 : -120;
    icon.style.webkitTransform = 'rotate('+deg+'deg)'; 
    icon.style.mozTransform    = 'rotate('+deg+'deg)'; 
    icon.style.msTransform     = 'rotate('+deg+'deg)'; 
    icon.style.oTransform      = 'rotate('+deg+'deg)'; 
    icon.style.transform       = 'rotate('+deg+'deg)'; 
    rotated = !rotated;
    document.getElementById(styles.settings_div).classList.toggle(styles.settings_div_activated);
  }

  const getTokenBySymbol = (symbol) => {
    for (let token of curTokenList) {
      if (token['symbol'] == symbol) {
        return token;
      }
    }
  }

  var balances = {
    'ETH': 0.376304703077471623,
    'UNI': 235.000000,
    'other': 522.000000
  }
  var token0 = "eth";
  var token1 = "other";

  const formatStyle = Intl.NumberFormat('en-US');
  const formatBalance = (balance) => {
    var d = ",";
    var g = 3;
    var regex = new RegExp('\\B(?=(\\d{'+g+'})+(?!\\d))', 'g');
    var parts = Number.parseFloat(balance).toString().split(".");
    var formatedBalance = parts[0].replace(regex, d);
    formatedBalance += (parts[1] ? "." + parts[1].slice(0, 4) : "");   
    return formatedBalance;
  }
  
  const setMaxAmount = (event) => {
    // document.getElementById("input0").value = (getBalance(address0) - 0.01).toString();
    const input = event.target.parentNode.parentNode.getElementsByTagName("input")[0];
    var cur_token;
    if (input.id === "balance_div0") {
      cur_token = token0;
    } else {
      cur_token = token1;
    }
    input.value = formatBalance(balances[cur_token]);
    input.blur();
  }

  const isInFamilyTree = (child, parent) => {
    if (child === parent) { return true; }
    const children = parent.getElementsByTagName("*");
    for (let curChild of children) {
      if (curChild === child) {
        return true;
      }
    }
    return false;
  }
  const closeSettings = (event) => {
    if (!event.target.closest('#' + styles.settings_div) && !isInFamilyTree(event.target, document.getElementById("settings_toogle_btn"))) {
      if (document.getElementById(styles.settings_div).classList.contains(styles.settings_div_activated)) {
        toogleSettings();
      }
    }
  }

  const setToken = (token_num, name) => {
    var token_div;
    if (token_num === 0) {
      token0 = name;
      token_div = document.getElementById('token0_div');
    } else {
      token1 = name;
      token_div = document.getElementById('token1_div');
    }
    const input = token_div.getElementsByTagName("input")[0];
    input.value = "";
    const choosed_token_div = token_div.getElementsByClassName(styles.choosed_token_div)[0];
    choosed_token_div.innerHTML = "";
    const balance = token_div.getElementsByClassName(styles.balance_div)[0];
    var div = document.createElement('div');
    div.classList.add(styles.choosed_token_name);
    if (name === 'other') {
      div.innerHTML = "Select a token";
      balance.innerHTML = "Balance: ???";
    } else {
      const token_data = getTokenBySymbol(name);
      var img = document.createElement('img');
      
      if (Object.keys(extra_icons).includes(name)) {
        console.log('hui');
        img.src = extra_icons[name];
      } else {
        img.src = token_data['logoURI'];
      }
      img.classList.add(styles.token_icon);
      img.alt = name  + ' logo';
      img.draggable = false
      choosed_token_div.appendChild(img);
      div.innerHTML = name;
      balance.innerHTML = 'Balance: ' + formatBalance(balances[name]);
    }
    choosed_token_div.appendChild(div);
    
  }

  const changeTokens = () => {
    console.log();
    const token0_div = document.getElementById('token0_div');
    const token1_div = document.getElementById('token1_div');
    const input0 = token0_div.getElementsByTagName("input")[0];
    const input1 = token1_div.getElementsByTagName("input")[0];
    const btn0 = token0_div.getElementsByTagName("button")[0];
    const btn1 = token1_div.getElementsByTagName("button")[0];
    const balance0 = token0_div.getElementsByClassName(styles.balance_div)[0];
    const balance1 = token1_div.getElementsByClassName(styles.balance_div)[0];
    [input0.value, input1.value] = [input1.value, input0.value];
    [btn0.innerHTML, btn1.innerHTML] = [btn1.innerHTML, btn0.innerHTML];
    [balance0.innerHTML, balance1.innerHTML] = [balance1.innerHTML, balance0.innerHTML];
    [token0, token1] = [token1, token0];
    numberMask0.updateValue();
    numberMask1.updateValue();
  }

  return (
    <div className={styles.container} onClick={closeSettings}>
    <Head>
      <title>Simple Swap</title>
      <meta name="description" content="Exchange for ethereum network" />
      <link rel="icon" href="/icon.ico" />
      <link rel="stylesheet" type="text/css" href="https://rsms.me/inter/inter.css" />
    </Head>

    <nav className="navbar navbar-light fixed-top">
        <a className={`navbar-brand ${styles.translate_on_hover}`} href="#" draggable="false">
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet" className={`d-inline-block ${styles.icon}`}>
            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
              <path d="M3235 3760 l-520 -520 323 0 322 0 0 -715 0 -715 400 0 400 0 0 715 0 715 322 0 323 0 -520 520 c-286 286 -522 520 -525 520 -3 0 -239 -234 -525 -520z" className={styles.arrow_down}/>
              <path d="M960 3870 l0 -400 400 0 400 0 0 400 0 400 -400 0 -400 0 0 -400z" className={styles.arrow_up}/>
              <path d="M960 2595 l0 -715 -322 0 -323 0 523 -522 522 -523 522 523 523 522 -323 0 -322 0 0 715 0 715 -400 0 -400 0 0 -715z" className={styles.arrow_up}/>
              <path d="M3360 1250 l0 -400 400 0 400 0 0 400 0 400 -400 0 -400 0 0 -400z m640 0 l0 -240 -240 0 -240 0 0 240 0 240 240 0 240 0 0 -240z" className={styles.arrow_down}/>
            </g>
          </svg>
        </a>
        <div id="menuDiv" className={`${styles.menu} ${styles.swap_toogle}`}>
          <div className={`${styles.swap_button} ${styles.menu_button}`} onClick={upPage}>Swap</div>
          <div id="liqBtn" className={`${styles.liquidity_button} ${styles.menu_button} ${styles.hover_effect}`} onMouseDown={tooglePage}>Liquidity</div>
        </div>
        <button id="connectBtn" className={`btn ${styles.menu_button} ${styles.connect_button} ${styles.rotate_on_hover} ${styles.bg_change_on_hover}`} onClick={connectWallet}>Connect wallet <i className={`bi bi-wallet2`}></i></button>
      </nav>

    <main className={styles.main}>
      <div className={styles.swap_div_full}>
        <div className={styles.swap_div}>
          <div className={styles.swap_header}>
            <div className={styles.settings_icon}>
              <button id="settings_toogle_btn" className={styles.settings_toogle} onClick={toogleSettings}>
                <i id="settings_icon" className="bi bi-gear-fill"></i>
                <div className={`${styles.expert_mode} ${styles.unselectable}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25px" viewBox="0 0 1000 250">
                    <defs>
                    </defs>
                    <text id="EXPERT" className={styles.cls_1} transform="translate(-11 231.004) scale(1.277 1.472)">EXPERT</text>
                  </svg>
                </div>
              </button>
            </div>
          </div>
          <div id="token0_div" className={`${styles.token_div} ${styles.token_div_up}`} onClick={focusInput0}>
            <div className={styles.input_div_main}>
              <div>
                <div className={`${styles.swap_label} ${styles.unselectable}`}>
                  From
                </div>
                <div className={styles.input_div}>
                  <input id="input0" className={`${styles.input_field}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false"></input>
                </div>
              </div>
              <button className={styles.choice_btn} onClick={getTokens}>
                <span className={styles.choice_span}>
                  <div className={`${styles.choosed_token_div}  ${styles.unselectable}`}>
                    <img className={`${styles.token_icon}`} alt="ETH logo" src={extra_icons['ETH']} draggable="false">
                    </img>
                    <div className={styles.choosed_token_name}>
                      ETH
                    </div>
                  </div>
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="currentColor" className={`bi bi-caret-down-fill ${styles.input_arrow}`} viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </div>
                </span>
              </button>
            </div>
            <div className={styles.balance_div_main}>
              <div id="balance_div0" className={`${styles.balance_div} ${styles.unselectable}`} onClick={setMaxAmount}>
                Balance: {formatBalance(balances['ETH'])}
              </div>
            </div>
          </div>
          <div className={styles.change_arrow} onClick={changeTokens}>
            <svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="18px" viewBox="0, 0, 400,400">
              <g id="svgg">
                <path id="path0" className={styles.path0_change_arrow} d="M192.188 1.238 C 188.081 3.005,58.300 132.899,56.086 137.459 C 51.519 146.864,55.761 157.972,65.625 162.437 C 69.117 164.017,70.020 164.028,200.000 164.028 C 329.980 164.028,330.883 164.017,334.375 162.437 C 344.239 157.972,348.481 146.864,343.914 137.459 C 341.581 132.656,211.867 2.959,207.642 1.206 C 203.968 -0.319,195.767 -0.302,192.188 1.238" stroke="none" fill="#000000" fillRule="evenodd"/>
                <path id="path1" className={styles.path1_change_arrow} d="M65.625 237.563 C 55.761 242.028,51.519 253.136,56.086 262.541 C 58.419 267.344,188.133 397.041,192.358 398.794 C 193.955 399.458,197.394 400.000,200.000 400.000 C 202.606 400.000,206.045 399.458,207.642 398.794 C 211.867 397.041,341.581 267.344,343.914 262.541 C 348.481 253.136,344.239 242.028,334.375 237.563 C 328.832 235.054,71.168 235.054,65.625 237.563" stroke="none" fill="#000000" fillRule="evenodd"/>
              </g>
            </svg>
          </div>
          <div id="token1_div" className={`${styles.token_div} ${styles.token_div_down}`} onClick={focusInput1}>
            <div className={styles.input_div_main}>
              <div>
                <div className={`${styles.swap_label} ${styles.unselectable}`}>
                  To
                </div>
                <div className={styles.input_div}>
                  <input id="input1" className={`${styles.input_field}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false"></input>
                </div>
              </div>
              <button className={styles.choice_btn} onClick={getTokens}>
                <span className={styles.choice_span}>
                  <div className={`${styles.choosed_token_div}  ${styles.unselectable}`}>
                    <div className={styles.choosed_token_name}>
                      Select a token
                    </div>
                  </div>
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="currentColor" className={`bi bi-caret-down-fill ${styles.input_arrow}`} viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </div>
                </span>
              </button>
            </div>
            <div className={styles.balance_div_main}>
              <div id="balance_div1" className={`${styles.balance_div} ${styles.unselectable}`} onClick={setMaxAmount}>
                Balance: ???
              </div>
            </div>
          </div>
          <div id="swap_tokens_div" className={`${styles.swap_tokens_div}`}>
            <button className={`${styles.swap_tokens_btn}  ${styles.unselectable}`}>
              Connect wallet
            </button>
          </div>
        </div>
          
        <div id={styles.settings_div}>
          <div className={styles.settings_title}>Transaction Settings</div>
          <div className={styles.tx_settings_div}>

          </div>
        </div>
      </div>

    </main>
  </div>
  )
  
}

