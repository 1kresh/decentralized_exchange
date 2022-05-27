import Head from 'next/head'
import styles from '../styles/Home.module.scss'
import IMask from 'imask'
import {useEffect} from "react";

import extra_icons from '../public/extra_icons.json'

export default function Swap() {
  var rotated = false;
  var balances = {
      'ETH': 0.376304703077471623,
      'UNI': 235.000000,
      'other': 522.000000
  }
  var token0 = "ETH";
  var token1 = "other";
  var slip_value = "";
  var dl_value = "";
  var expert = false;

  var token0_input_mask;
  var token1_input_mask;
  var slip_mask;
  var dl_mask;
  var slip_may_fail = false;
  var slip_may_frontrun = false;
  var slip_auto_btn_on = true;

  const openTab = (page) => {
      window.open(page, '_blank');
  }

  const tooglePage = (event) => {
      event.preventDefault();

      if (event.which) { // if event.which, use 2 for middle button
          if (event.which === 2) {
              openTab("/liquidity");
          }
      } else if (event.button) { // and if event.button, use 1 or 4 for middle button
          if (navigator.userAgent.indexOf("Chrome") != -1 && event.button === 1) {
              openTab("/liquidity");
          } else if (event.button === 4) {
              openTab("/liquidity");
          }
      } else {
          setTimeout(() => {
              window.location.href = "/liquidity";
          }, 275);
          document.getElementById('menuDiv').classList.toggle(styles.toogle_menu);
          document.getElementById('liqBtn').classList.remove(styles.hover_effect);
      }
  }

  const pageUp = () => {
      window.location.href = "#";
  }

  const connectWallet = () => {

  }

  const inputValidate = () => {
      const token_inputs = document.getElementsByClassName(styles.input_field);
      const params_token_input = {
          mask: Number,
          scale: 18,
          signed: false,
          padFractionalZeros: false,
          normalizeZeros: true,
          radix: '.',
      }
      const params_slip_input = {
          mask: Number,
          scale: 2,
          signed: false,
          padFractionalZeros: true,
          normalizeZeros: true,
          radix: '.',
          min: 0.0,
          max: 50.0
      }
      const params_dl_input = {
          mask: Number,
          scale: 0,
          signed: false,
          min: 1,
          max: 4320
      }
      token0_input_mask = IMask(token_inputs[0], params_token_input);
      token1_input_mask = IMask(token_inputs[1], params_token_input);
      const slip_input = document.getElementById('slip_input');
      slip_mask = IMask(slip_input, params_slip_input);
      const dl_input = document.getElementById('dl_input');
      dl_mask = IMask(dl_input, params_dl_input);

      const validateToken0Input = () => {
          console.log(0);
          console.log(token0_input_mask.value);
      }

      const validateToken1Input = () => {
          console.log(1);
          console.log(token1_input_mask.value);
      }

      const validateSlipInput = () => {
          slip_value = slip_mask.value;
          const auto_btn = document.getElementById(styles.auto_btn);
          const slip_warnings = document.getElementById('slip_warnings');
          if (slip_value === '') {
              if (!slip_auto_btn_on) {
                  auto_btn.classList.toggle(styles.activated_auto_btn);
                  slip_auto_btn_on = !slip_auto_btn_on;
              }
              slip_warnings.innerHTML = '';
              slip_may_fail = false;
              slip_may_frontrun = false;
          } else {
              if (slip_auto_btn_on) {
                  auto_btn.classList.toggle(styles.activated_auto_btn);
                  slip_auto_btn_on = !slip_auto_btn_on;
              }
              const slip_value_float = Number.parseFloat(slip_value);
              if (slip_value_float >= 0.05 && slip_value_float <= 1.0) {
                  slip_may_fail = false;
                  slip_may_frontrun = false;
                  slip_warnings.innerHTML = '';
              } else {
                  if (slip_may_fail) {
                      if (slip_value_float > 1.0) {
                          slip_may_fail = !slip_may_fail;
                          slip_may_frontrun = !slip_may_frontrun;
                          setFrontrun(slip_warnings);
                      }
                  } else if (slip_may_frontrun) {
                      if (slip_value_float < 0.05) {
                          slip_may_fail = !slip_may_fail;
                          slip_may_frontrun = !slip_may_frontrun;
                          setFail(slip_warnings);
                      }
                  } else {
                      if (slip_value_float > 1.0) {
                          slip_may_frontrun = !slip_may_frontrun;
                          setFrontrun(slip_warnings);
                      } else {
                          slip_may_fail = !slip_may_fail;
                          setFail(slip_warnings);
                      }
                  }
              }
          }
      }

      const validateDlInput = () => {
          dl_value = dl_mask.value;
      }

      token0_input_mask.on('accept', validateToken0Input);
      token1_input_mask.on('accept', validateToken1Input);
      slip_mask.on('accept', validateSlipInput)
      dl_mask.on('accept', validateDlInput)
  }

  const initCacheValues = () => {

  }

  const setCacheValues = () => {
      slip_mask.value = slip_value;
      dl_mask.value = dl_value;
  }

  const setFrontrun = (elem) => {
      elem.innerHTML = `
      <svg class=${styles.slip_svg} xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
      <g><path d="M 362.5,-0.5 C 369.5,-0.5 376.5,-0.5 383.5,-0.5C 415.109,9.01599 429.609,30.3493 427,63.5C 421.806,88.6937 406.64,103.86 381.5,109C 353.542,112.264 333.375,101.431 321,76.5C 311.523,48.6099 318.356,25.7766 341.5,8C 348.187,4.05686 355.187,1.22353 362.5,-0.5 Z M 342.5,511.5 C 336.5,511.5 330.5,511.5 324.5,511.5C 312.396,508.56 305.23,500.893 303,488.5C 303.484,445.172 303.484,401.839 303,358.5C 283.69,345.871 263.856,334.037 243.5,323C 235.123,315.621 226.456,308.621 217.5,302C 207.272,291.764 200.438,279.597 197,265.5C 195.364,253.348 197.697,242.014 204,231.5C 224.292,199.084 244.459,166.584 264.5,134C 239.5,133.333 214.5,133.333 189.5,134C 186.078,137.003 183.245,140.503 181,144.5C 174.396,156.098 167.396,167.431 160,178.5C 146.117,193.107 132.117,193.107 118,178.5C 112.917,168.159 113.583,158.159 120,148.5C 131.584,130.334 142.917,112.001 154,93.5C 157.649,88.7585 162.482,86.2585 168.5,86C 179,85.8333 189.5,85.6667 200,85.5C 230.209,85.6734 260.376,86.5067 290.5,88C 294.729,89.1146 298.729,90.7813 302.5,93C 323.672,106.752 344.672,120.752 365.5,135C 373.386,140.886 377.886,148.72 379,158.5C 379.5,180.497 379.667,202.497 379.5,224.5C 404.538,224.058 429.538,224.558 454.5,226C 467.502,230.484 473.002,239.651 471,253.5C 468.833,263.667 462.667,269.833 452.5,272C 416.167,272.667 379.833,272.667 343.5,272C 337.553,270.387 334.053,266.553 333,260.5C 332.667,243.5 332.333,226.5 332,209.5C 317.363,232.302 302.53,254.968 287.5,277.5C 309.998,291.917 332.665,306.084 355.5,320C 360.285,324.069 363.119,329.236 364,335.5C 364.667,386.167 364.667,436.833 364,487.5C 362.101,500.342 354.934,508.342 342.5,511.5 Z M 419.5,192.5 C 430.838,192.333 442.172,192.5 453.5,193C 456.705,194.415 458.372,196.915 458.5,200.5C 456.837,205.325 454.504,209.825 451.5,214C 441.5,214.667 431.5,214.667 421.5,214C 418.067,210.068 415.734,205.568 414.5,200.5C 414.672,196.807 416.339,194.141 419.5,192.5 Z M 178.5,276.5 C 187.462,297.643 201.462,314.81 220.5,328C 221.804,328.804 222.471,329.971 222.5,331.5C 212.279,356.943 201.779,382.276 191,407.5C 183.931,417.891 174.764,420.058 163.5,414C 125.948,398.057 88.2813,382.391 50.5,367C 39.1743,363.017 33.5076,355.017 33.5,343C 33.6918,320.815 44.6918,309.148 66.5,308C 70.2765,308.592 73.9431,309.592 77.5,311C 101.506,321.224 125.673,331.058 150,340.5C 159.74,319.347 169.24,298.013 178.5,276.5 Z M 420.5,280.5 C 432.886,280.106 445.22,280.606 457.5,282C 462.208,283.378 465.708,286.212 468,290.5C 473.076,307.872 476.076,325.538 477,343.5C 473.708,356.794 465.541,365.627 452.5,370C 441.833,370.667 431.167,370.667 420.5,370C 401.82,363.491 393.653,350.324 396,330.5C 398.667,317.833 401.333,305.167 404,292.5C 407.216,285.16 412.716,281.16 420.5,280.5 Z"/></g>
      </svg>
      <span class=${styles.tooltiptext_down}>Your transaction may be frontrun.</span>
      `
  }

  const setFail = (elem) => {
      elem.innerHTML = `<svg class=${styles.slip_svg} id="svg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0, 0, 400,400">
      <g id="svgg"><path id="path0" d="M94.646 1.553 C 85.342 4.917,78.447 11.163,73.996 20.258 L 71.484 25.391 71.094 126.172 L 70.703 226.953 68.685 231.250 C 67.575 233.613,63.739 239.414,60.159 244.141 C 56.579 248.867,51.659 255.371,49.225 258.594 C 6.446 315.231,20.108 383.647,77.083 398.099 L 84.575 400.000 179.592 399.995 C 271.356 399.990,274.686 399.939,276.843 398.517 C 282.431 394.833,282.020 401.550,282.026 313.761 L 282.031 234.943 289.373 235.327 C 305.527 236.172,304.987 234.487,305.469 285.547 L 305.859 326.953 308.371 332.085 C 321.648 359.217,359.530 359.415,372.719 332.422 L 375.391 326.953 375.601 235.547 L 375.812 144.141 373.802 137.127 C 367.980 116.802,351.941 101.163,331.711 96.083 C 326.284 94.720,322.886 94.531,303.812 94.531 L 282.093 94.531 281.867 59.961 L 281.641 25.391 278.969 19.922 C 275.472 12.766,269.265 6.559,262.109 3.063 L 256.641 0.391 177.734 0.216 C 101.432 0.047,98.690 0.091,94.646 1.553 M252.344 25.532 C 258.610 29.437,258.176 24.213,258.420 98.633 L 258.636 164.844 176.563 164.844 L 94.489 164.844 94.705 98.633 L 94.922 32.422 96.635 29.688 C 100.650 23.280,96.835 23.560,178.125 23.703 L 249.609 23.828 252.344 25.532 M123.157 49.139 C 117.762 52.696,117.979 50.791,117.979 94.531 C 117.979 138.271,117.762 136.366,123.157 139.924 C 126.629 142.213,226.496 142.213,229.968 139.924 C 235.363 136.366,235.146 138.271,235.146 94.531 C 235.146 50.791,235.363 52.696,229.968 49.139 C 226.496 46.850,126.629 46.850,123.157 49.139 M211.719 94.531 L 211.719 117.969 200.000 117.969 L 188.281 117.969 188.276 109.961 C 188.269 98.511,185.254 94.542,176.563 94.542 C 167.871 94.542,164.856 98.511,164.849 109.961 L 164.844 117.969 153.125 117.969 L 141.406 117.969 141.406 94.531 L 141.406 71.094 176.563 71.094 L 211.719 71.094 211.719 94.531 M305.620 140.430 L 305.859 162.891 308.371 168.023 C 315.237 182.053,325.918 188.281,343.112 188.281 L 352.386 188.281 352.170 254.102 C 351.958 318.336,351.915 319.984,350.391 322.515 C 345.876 330.007,335.374 330.007,330.859 322.515 C 329.363 320.032,329.280 318.163,328.906 278.516 L 328.516 237.109 325.844 231.641 C 319.318 218.284,309.296 212.288,292.773 211.852 L 282.031 211.569 282.031 164.769 L 282.031 117.969 293.706 117.969 L 305.381 117.969 305.620 140.430 M342.356 129.623 C 349.363 137.276,352.252 146.105,352.320 160.067 L 352.344 165.057 345.042 164.675 C 330.512 163.915,329.387 162.040,329.037 138.006 L 328.777 120.152 333.570 122.707 C 336.299 124.161,340.083 127.140,342.356 129.623 M258.594 282.422 L 258.594 376.563 203.156 376.563 L 147.719 376.563 151.406 371.680 C 169.663 347.503,169.586 311.835,151.226 288.672 C 144.645 280.369,142.384 276.155,141.797 271.098 C 140.883 263.221,136.917 259.385,129.688 259.385 C 119.877 259.385,118.459 262.077,117.963 281.641 C 117.613 295.426,117.383 297.571,116.010 299.859 C 111.513 307.350,100.999 307.350,96.484 299.859 C 94.968 297.341,94.915 295.674,94.701 242.773 L 94.481 188.281 176.537 188.281 L 258.594 188.281 258.594 282.422 M74.156 309.766 C 86.146 334.303,121.523 336.757,136.109 314.063 L 137.364 312.109 138.752 315.234 C 140.771 319.780,141.199 334.050,139.514 340.628 C 132.811 366.791,105.144 382.208,80.276 373.637 C 43.549 360.978,37.473 317.212,66.727 276.046 L 70.703 270.452 71.094 287.374 L 71.484 304.297 74.156 309.766 "></path></g>
      </svg>
      <span class=${styles.tooltiptext_down}>Your transaction may fail.</span>`
  }

  const focusInput = (event) => {
      console.log(event.target);
      if (!event.target.id.includes('balance_div') &&
          event.target.tagName !== 'input') {
          var elem = event.target;
          while (!elem.id.includes('token_div')) {
              elem = elem.parentNode;
              console.log(elem);
          }
          if (!isInFamilyTree(event.target, elem.getElementsByClassName(styles.choice_btn)[0])) {
              elem.getElementsByTagName("input")[0].focus();
          }
      }
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
          await getTokens();
          inputValidate();
          initCacheValues();
          setCacheValues();
          setToken(1, 'UNI');
      }
  }, [])

  const toogleSettings = () => {
      var icon = document.getElementById('settings_icon'),
          deg = rotated ? 0 : -120;
      icon.style.webkitTransform = 'rotate(' + deg + 'deg)';
      icon.style.mozTransform = 'rotate(' + deg + 'deg)';
      icon.style.msTransform = 'rotate(' + deg + 'deg)';
      icon.style.oTransform = 'rotate(' + deg + 'deg)';
      icon.style.transform = 'rotate(' + deg + 'deg)';
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

  const formatStyle = Intl.NumberFormat('en-US');
  const formatBalance = (balance) => {
      var d = ",";
      var g = 3;
      var regex = new RegExp('\\B(?=(\\d{' + g + '})+(?!\\d))', 'g');
      var parts = Number.parseFloat(balance).toString().split(".");
      var formatedBalance = parts[0].replace(regex, d);
      formatedBalance += (parts[1] ? "." + parts[1].slice(0, 4) : "");
      return formatedBalance;
  }

  const setMaxAmount = (event) => {
      // document.getElementById("input0").value = (getBalance(address0) - 0.01).toString();
      const input = event.target.parentNode.parentNode.getElementsByTagName("input")[0];
      var cur_token;
      if (input.id === "input0") {
          cur_token = token0;
      } else {
          cur_token = token1;
      }
      input.value = cur_token === 'ETH' ? balances['ETH'] - 0.01 : balances[cur_token];
      input.blur = true;
  }

  const isInFamilyTree = (child, parent) => {
      if (child === parent) {
          return true;
      }
      const children = parent.getElementsByTagName("*");
      for (let curChild of children) {
          if (curChild === child) {
              return true;
          }
      }
      return false;
  }

  const closeSettings = (event) => {
      console.log(event.target);
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
          token_div = document.getElementById('token_div0');
      } else {
          token1 = name;
          token_div = document.getElementById('token_div1');
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
          img.alt = name + ' logo';
          img.draggable = false
          choosed_token_div.appendChild(img);
          div.innerHTML = name;
          balance.innerHTML = 'Balance: ' + formatBalance(balances[name]);
      }
      choosed_token_div.appendChild(div);
  }

  const changeTokens = () => {
      const token_div0 = document.getElementById('token_div0');
      const token_div1 = document.getElementById('token_div1');
      const input0 = token_div0.getElementsByTagName("input")[0];
      const input1 = token_div1.getElementsByTagName("input")[0];
      const btn0 = token_div0.getElementsByTagName("button")[0];
      const btn1 = token_div1.getElementsByTagName("button")[0];
      const balance0 = token_div0.getElementsByClassName(styles.balance_div)[0];
      const balance1 = token_div1.getElementsByClassName(styles.balance_div)[0];
      [input0.value, input1.value] = [input1.value, input0.value];
      [btn0.innerHTML, btn1.innerHTML] = [btn1.innerHTML, btn0.innerHTML];
      [balance0.innerHTML, balance1.innerHTML] = [balance1.innerHTML, balance0.innerHTML];
      [token0, token1] = [token1, token0];
      token0_input_mask.updateValue();
      token1_input_mask.updateValue();
  }

  const setAutoSlipValue = (event) => {
      if (!slip_auto_btn_on) {
          slip_input.value = '';
          slip_value = '';
          slip_mask.value = '';
      }
  }

  const closeExpModal = () => {
      document.getElementById('exp_modal_outer').classList.remove(styles.open);
      if (!expert) {
          document.getElementById('exp_input').checked = false;
      }
  }

  const handleExpCheckboxClick = () => {
      if (!expert) {
          document.getElementById('exp_modal_outer').classList.add(styles.open);
          toogleSettings();
      } else {
          expert = false;
          toogleExpIcon();
      }
  }

  const handleExpModalClick = (event) => {
      if (!event.target.closest('#exp_modal_inner')) {
          closeExpModal();
      }
  }

  const handleKeydown = (event) => {
      if (event.key === 'Escape') {
          closeExpModal();
      }
  }

  const setExpMode = () => {
      expert = true;
      console.log(expert);
      toogleExpIcon();
      closeExpModal();
  }

  const toogleExpIcon = () => {
      const expert_mode_div = document.getElementById("expert_mode_div");
      if (expert) {

          expert_mode_div.innerHTML = `
        <svg class=${styles.expert_mode_svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 250">
          <defs>
          </defs>
          <text id="EXPERT" class=${styles.cls_1} transform="translate(-11 231.004) scale(1.277 1.472)">EXPERT</text>
        </svg>
        `;
      } else {
          expert_mode_div.innerHTML = "";
      }
  }

  return (
    <div className={`${styles.container} ${styles.unselectable}`} onClick={closeSettings} onKeyDown={handleKeydown}>

      <Head>
          <title>Simple Swap</title>
          <meta name="description" content="Exchange for ethereum network" />
          <link rel="icon" href="/icon.ico" />
      </Head>

      <nav className="navbar navbar-light fixed-top">
          <a className={`navbar-brand ${styles.translate_on_hover}`} href="#" draggable="false">
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet" className={`d-inline-block ${styles.icon}`}>
                  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                      <path d="M3235 3760 l-520 -520 323 0 322 0 0 -715 0 -715 400 0 400 0 0 715 0 715 322 0 323 0 -520 520 c-286 286 -522 520 -525 520 -3 0 -239 -234 -525 -520z" className={styles.arrow_down} />
                      <path d="M960 3870 l0 -400 400 0 400 0 0 400 0 400 -400 0 -400 0 0 -400z" className={styles.arrow_up} />
                      <path d="M960 2595 l0 -715 -322 0 -323 0 523 -522 522 -523 522 523 523 522 -323 0 -322 0 0 715 0 715 -400 0 -400 0 0 -715z" className={styles.arrow_up} />
                      <path d="M3360 1250 l0 -400 400 0 400 0 0 400 0 400 -400 0 -400 0 0 -400z m640 0 l0 -240 -240 0 -240 0 0 240 0 240 240 0 240 0 0 -240z" className={styles.arrow_down} />
                  </g>
              </svg>
          </a>
          <div id="menuDiv" className={`${styles.menu} ${styles.swap_toogle}`}>
              <div className={`${styles.swap_button} ${styles.menu_button}`} onClick={pageUp}>Swap</div>
              <div id="liqBtn" className={`${styles.liquidity_button} ${styles.menu_button} ${styles.hover_effect}`} onMouseDown={tooglePage}>Liquidity</div>
          </div>
          <button id="connectBtn" className={`btn ${styles.menu_button} ${styles.connect_button} ${styles.rotate_on_hover} ${styles.bg_change_on_hover}`} onClick={connectWallet}>Connect wallet <i className="bi bi-wallet2"></i></button>
      </nav>

      <main className={styles.main}>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div className={styles.swap_div_main}>
              <div className={styles.swap_div}>
                  <div className={styles.swap_header}>
                      <div className={styles.settings_icon}>
                          <button id="settings_toogle_btn" className={styles.settings_toogle} onClick={toogleSettings}>
                              <i id="settings_icon" className="bi bi-gear-fill"></i>
                              <div id="expert_mode_div" className={styles.expert_mode}>
                              </div>
                          </button>
                      </div>
                  </div>
                  <div id="token_div0" className={`${styles.token_div} ${styles.token_div_up}`} onClick={focusInput}>
                      <div className={styles.input_div_main}>
                          <div>
                              <div className={styles.swap_label}>
                                  From
                              </div>
                              <div className={styles.input_div}>
                                  <input id="input0" className={`${styles.input_field} ${styles.no_outline}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false"></input>
                              </div>
                          </div>
                          <button className={styles.choice_btn} onClick={getTokens}>
                              <span className={styles.choice_span}>
                                  <div className={styles.choosed_token_div}>
                                      <img className={`${styles.token_icon}`} alt="ETH logo" src={extra_icons['ETH']} draggable="false">
                                      </img>
                                      <div className={styles.choosed_token_name}>
                                          ETH
                                      </div>
                                  </div>
                                  <div>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="currentColor" className={`bi bi-caret-down-fill ${styles.input_arrow}`} viewBox="0 0 16 16">
                                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                      </svg>
                                  </div>
                              </span>
                          </button>
                      </div>
                      <div className={styles.balance_div_main}>
                          <div id="balance_div0" className={styles.balance_div} onClick={setMaxAmount}>
                              Balance: {formatBalance(balances['ETH'])}
                          </div>
                      </div>
                  </div>
                  <div className={styles.change_arrow} onClick={changeTokens}>
                      <svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="18px" viewBox="0, 0, 400,400">
                          <g id="svgg">
                              <path id="path0" className={styles.path0_change_arrow} d="M192.188 1.238 C 188.081 3.005,58.300 132.899,56.086 137.459 C 51.519 146.864,55.761 157.972,65.625 162.437 C 69.117 164.017,70.020 164.028,200.000 164.028 C 329.980 164.028,330.883 164.017,334.375 162.437 C 344.239 157.972,348.481 146.864,343.914 137.459 C 341.581 132.656,211.867 2.959,207.642 1.206 C 203.968 -0.319,195.767 -0.302,192.188 1.238" stroke="none" fill="#000000" fillRule="evenodd" />
                              <path id="path1" className={styles.path1_change_arrow} d="M65.625 237.563 C 55.761 242.028,51.519 253.136,56.086 262.541 C 58.419 267.344,188.133 397.041,192.358 398.794 C 193.955 399.458,197.394 400.000,200.000 400.000 C 202.606 400.000,206.045 399.458,207.642 398.794 C 211.867 397.041,341.581 267.344,343.914 262.541 C 348.481 253.136,344.239 242.028,334.375 237.563 C 328.832 235.054,71.168 235.054,65.625 237.563" stroke="none" fill="#000000" fillRule="evenodd" />
                          </g>
                      </svg>
                  </div>
                  <div id="token_div1" className={`${styles.token_div} ${styles.token_div_down}`} onClick={focusInput}>
                      <div className={styles.input_div_main}>
                          <div>
                              <div className={styles.swap_label}>
                                  To
                              </div>
                              <div className={styles.input_div}>
                                  <input id="input1" className={`${styles.input_field} ${styles.no_outline}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false"></input>
                              </div>
                          </div>
                          <button className={styles.choice_btn} onClick={getTokens}>
                              <span className={styles.choice_span}>
                                  <div className={styles.choosed_token_div}>
                                      <div className={styles.choosed_token_name}>
                                          Select a token
                                      </div>
                                  </div>
                                  <div>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="currentColor" className={`bi bi-caret-down-fill ${styles.input_arrow}`} viewBox="0 0 16 16">
                                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                      </svg>
                                  </div>
                              </span>
                          </button>
                      </div>
                      <div className={styles.balance_div_main}>
                          <div id="balance_div1" className={styles.balance_div} onClick={setMaxAmount}>
                              Balance: ???
                          </div>
                      </div>
                  </div>
                  <div id="swap_tokens_div" className={`${styles.swap_tokens_div}`}>
                      <button className={styles.swap_tokens_btn}>
                          Connect wallet
                      </button>
                  </div>
              </div>

              <div id={styles.settings_div}>
                  <div className={styles.tx_settings_div_main}>
                      <div className={`${styles.tx_settings_title} ${styles.settings_title}`}>Transaction Settings</div>
                      <div className={styles.tx_settings_div}>
                          <div className={styles.tx_settings_div_micro}>
                              <div className={styles.info_row}>
                                  <div>
                                      Slippage tolerance
                                  </div>
                                  <div className={`${styles.question_icon} ${styles.tooltip}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6e6e6e" className="bi bi-question-lg" viewBox="0 0 16 16">
                                          <path fillRule="evenodd" d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777ZM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14Z" />
                                      </svg>
                                      <span className={`${styles.tooltiptext_down} ${styles.tooltiptext_down_tip}`}>Your transaction will revert if the price changes unfavorably by more than this percentage.</span>
                                  </div>
                              </div>
                              <div className={styles.slip_input_div_main}>
                                  <div id={styles.auto_btn} className={styles.activated_auto_btn} onClick={setAutoSlipValue}>
                                      Auto
                                  </div>
                                  <div className={styles.slip_input_div}>
                                      <span id="slip_warnings" className={`${styles.slip_svg_span} ${styles.tooltip}`}>
                                      </span>
                                      <input id="slip_input" className={`${styles.slip_input_field} ${styles.no_outline}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.10" spellCheck="false"></input>
                                      %
                                  </div>
                              </div>
                          </div>
                          <div className={styles.tx_settings_div_micro}>
                              <div className={styles.info_row}>
                                  <div>
                                      Transaction deadline
                                  </div>
                                  <div className={`${styles.question_icon} ${styles.tooltip}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6e6e6e" className="bi bi-question-lg" viewBox="0 0 16 16">
                                          <path fillRule="evenodd" d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777ZM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14Z" />
                                      </svg>
                                      <span className={`${styles.tooltiptext_down} ${styles.tooltiptext_down_tip}`}>Your transaction will revert if it is pending for more than this period of time.</span>
                                  </div>
                              </div>
                              <div className={styles.dl_input_div_main}>
                                  <div className={styles.dl_input_div}>
                                      <input id="dl_input" className={`${styles.dl_input_field} ${styles.no_outline}`} inputMode="numeric" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="30" spellCheck="false"></input>
                                  </div>
                                  <div className={styles.minutes_div}>minutes</div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className={styles.intrfc_settings_div_main}>
                      <div className={`${styles.intrfc_settings_title} ${styles.settings_title}`}>Interface Settings</div>
                      <div className={styles.exp_mode_div_main}>
                          <div className={styles.exp_mode_div}>
                              <div className={`${styles.info_row} ${styles.exp_mode_info_row}`}>
                                  <div>
                                      Expert Mode
                                  </div>
                                  <div className={`${styles.question_icon} ${styles.tooltip}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6e6e6e" className="bi bi-question-lg" viewBox="0 0 16 16">
                                          <path fillRule="evenodd" d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777ZM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14Z" />
                                      </svg>
                                      <span className={`${styles.tooltiptext_up} ${styles.tooltiptext_up_tip}`}>Allow high price impact trades and skip the confirm screen. Use at your own risk.</span>
                                  </div>
                              </div>
                          </div>
                          <div className={styles.switch_button} onClick={handleExpCheckboxClick}>
                              <input id="exp_input" className={styles.switch_button_checkbox} type="checkbox"></input>
                              <label className={styles.switch_button_label} for="">
                                  <span className={styles.switch_button_label_span}>Off</span>
                              </label>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div id="exp_modal_outer" className={styles.modal_outer} onClick={handleExpModalClick}>
              <div id="exp_modal_inner" className={styles.modal_inner}>
                  <div className={`${styles.exp_modal_div_main} ${styles.exp_modal_div_grid}`}>
                      <div className={styles.exp_modal_title}>
                          <div></div>
                          <div className={styles.exp_modal_title_text}>Are you sure?</div>
                          <svg className={styles.close_modal} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" onClick={closeExpModal}>
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                      </div>
                      <div className={styles.line}></div>
                      <div className={`${styles.exp_modal_div} ${styles.exp_modal_div_grid}`}>
                          <div className={styles.modal_secondary_text}>Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in bad rates and lost funds.</div>
                          <div className={styles.modal_main_text}>ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.</div>
                          <button className={styles.exp_modal_btn} onClick={setExpMode}>
                              <div className={styles.exp_modal_btn_text} id="confirm-expert-mode">Turn On Expert Mode</div>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </main>
    </div>
  )
  
}

