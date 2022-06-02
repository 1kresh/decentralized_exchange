import Head from 'next/head'
import styles from '../styles/Home.module.scss'
import IMask from 'imask'
import {useEffect, useState, useRef} from "react";

import token_list_all from '../public/token_list_all.json'
import popular_tokens_all from '../public/popular_tokens_all.json'
import { createMochaInstanceAlreadyDisposedError } from 'mocha/lib/errors';

const ETH_TOKEN = {
    "chainId": '',
    "address": '',
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18,
    "logoURI": "data:image/png;base64,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"
};

export default function Swap() {
  const initFlag = useRef(true);
  const tokenListCurFlag = useRef(true);
  const popularTokensCurFlag = useRef(true);
  const expertFlag = useRef(true);
  const cacheFlag = useRef(true);

  const [tokenListAll, setTokenListAll] = useState(token_list_all['tokens']);

  useEffect(() => {
    if (tokenListAll && tokenListCurFlag.current) {
        tokenListCurFlag.current = false;
        getTokensCurChainId();
    }
  }, [tokenListAll]);

  const [popularTokensAll, setPopularTokensAll] = useState(popular_tokens_all['tokens']);
  const [tokenListCur, setTokenListCur] = useState();

  useEffect(() => {
    if (tokenListCur && popularTokensAll && popularTokensCurFlag.current) {
      popularTokensCurFlag.current = false;
      getPopularTokensCurChainId();
    }
  }, [tokenListCur, popularTokensAll])

  const [popularTokensCur, setPopularTokensCur] = useState();

  const getTokensCurChainId = () => {
    var tokenListCur = [ETH_TOKEN]
    for (let token of tokenListAll) {
        if (token['chainId'] === chainId) {
            tokenListCur.push(token);
        }
    }
    setTokenListCur(tokenListCur);
  }

  const getPopularTokensCurChainId = () => {
    var popularTokensCur = [ETH_TOKEN];
    for (let tokenSymbol of popularTokensAll[chainId.toString()]) {
        popularTokensCur.push(getTokenBySymbol(tokenSymbol));
    }
    setPopularTokensCur(popularTokensCur)
  }

  const [token0InputMask, setToken0InputMask] = useState();

  useEffect(() => {
    if (token0InputMask) {
        token0InputInitHandler();
    }
  }, [token0InputMask]);

  const [token1InputMask, setToken1InputMask] = useState();

  useEffect(() => {
    if (token1InputMask) {
        token1InputInitHandler();
    }
  }, [token1InputMask]);

  const [chooseTokenNum, setChooseTokenNum] = useState();

  useEffect(() => {
    if ([0, 1].includes(chooseTokenNum)) {
        openChooseModal();
    }
  }, [chooseTokenNum]);

  const [chooseModalInput, setChooseModalInput] = useState();

  useEffect(() => {
    if (chooseModalInput == null) {
        return;
    }
    const timeOutId = setTimeout(() => handleSearchTokenInput(chooseModalInput), 300);
    return () => clearTimeout(timeOutId);
  }, [chooseModalInput]);

  const [token0, setToken0] = useState(ETH_TOKEN);
  const [token1, setToken1] = useState({"symbol": "uncelected"});
  const [rotatedSettings, setRotatedSettings] = useState(false);
  const [chainId, setChainId] = useState(1);
  const [slipMask, setSlipMask] = useState();

  useEffect(() => {
    if (slipMask) {
        slipMaskInitHandler();
    }
  }, [slipMask]);

  const [dlMask, setDlMask] = useState();

  useEffect(() => {
    if (dlMask) {
        dlMaskInitHandler();
    }
  }, [dlMask]);

  const [expert, setExpert] = useState(false);

  useEffect(() => {
      if (expertFlag.current) {
        expertFlag.current = false;
        return;
      }
      toogleExpIcon();
      closeExpModal();
      if (expert) {
        localStorage.setItem('expert', '1');
      } else {
        localStorage.removeItem('expert');
      }
  }, [expert]);

  useEffect(() => {
    if (slipMask && dlMask && [false, true].includes(expert) && cacheFlag.current) {
        cacheFlag.current = false;
        setCacheValues();
    }
  }, [slipMask, dlMask, expert]);

  
  var balances = {
    'ETH': 0.376304703077471623,
    'UNI': 235.000000
  }

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

  const inputsInitMask = () => {
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
      setToken0InputMask(IMask(token_inputs[0], params_token_input));
      setToken1InputMask(IMask(token_inputs[1], params_token_input));
      setSlipMask(IMask(document.getElementById('slip_input'), params_slip_input));
      setDlMask(IMask(document.getElementById('dl_input'), params_dl_input));
  }

  const token0InputInitHandler = () => {
    const token0InputHandler = () => {
        console.log('00');
        console.log(token0InputMask.value);
    }
    token0InputMask.on('accept', token0InputHandler);
  }

  const token1InputInitHandler = () => {
    const token1InputHandler = () => {
        console.log('11');
        console.log(token1InputMask.value);
    }
    token1InputMask.on('accept', token1InputHandler);
  }

  const slipMaskInitHandler = () => {
    slipMask.on('accept', () => {
        localStorage.setItem('slip_value', slipMask.value);
        const auto_btn = document.getElementById(styles.auto_btn);
        const slip_warnings = document.getElementById('slip_warnings');
        if (slipMask.value === '') {
            auto_btn.classList.add(styles.activated_auto_btn);
            slip_warnings.innerHTML = '';
        } else {
            auto_btn.classList.remove(styles.activated_auto_btn);
            const slip_value_float = Number.parseFloat(slipMask.value);
            if (slip_value_float >= 0.05 && slip_value_float <= 1.0) {
                slip_warnings.innerHTML = '';
            } else {
                if (slip_value_float > 1.0) {
                    setFrontrun(slip_warnings);
                } else if (slip_value_float < 0.05) {
                    setFail(slip_warnings);
                } else {
                    if (slip_value_float > 1.0) {
                        setFrontrun(slip_warnings);
                    } else {
                        setFail(slip_warnings);
                    }
                }
            }
        }
    });
  }

  const dlMaskInitHandler = () => {
    const dlInputHandler = () => {
        localStorage.setItem('dl_value', dlMask.value);
    }

    dlMask.on('accept', dlInputHandler);
  }

  const setCacheValues = () => {
      const slip_value = localStorage.getItem('slip_value');
      const dl_value = localStorage.getItem('dl_value');
      slipMask.value = slip_value ? slip_value : '';
      dlMask.value = dl_value ? dl_value : '';
      if (localStorage.getItem('expert')) {
        document.getElementById("exp_input").checked = true;
        setExpert(true);
      }
  }

  const setFrontrun = (elem) => {
      elem.innerHTML = `
      <svg class=${styles.slip_svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M362.5-.5h21c31.609 9.516 46.109 30.85 43.5 64-5.194 25.194-20.36 40.36-45.5 45.5-27.958 3.264-48.125-7.569-60.5-32.5-9.477-27.89-2.644-50.723 20.5-68.5 6.687-3.943 13.687-6.776 21-8.5zm-20 512h-18c-12.104-2.94-19.27-10.607-21.5-23a5819.74 5819.74 0 0 0 0-130 841.18 841.18 0 0 0-59.5-35.5 390.675 390.675 0 0 0-26-21c-10.228-10.236-17.062-22.403-20.5-36.5-1.636-12.152.697-23.486 7-34a14539.583 14539.583 0 0 0 60.5-97.5c-25-.667-50-.667-75 0a39.785 39.785 0 0 0-8.5 10.5 559.459 559.459 0 0 1-21 34c-13.883 14.607-27.883 14.607-42 0-5.083-10.341-4.417-20.341 2-30a2314.027 2314.027 0 0 0 34-55c3.649-4.742 8.482-7.242 14.5-7.5l31.5-.5a2067.34 2067.34 0 0 1 90.5 2.5 47.352 47.352 0 0 1 12 5 3166.57 3166.57 0 0 1 63 42c7.886 5.886 12.386 13.72 13.5 23.5.5 21.997.667 43.997.5 66a995.37 995.37 0 0 1 75 1.5c13.002 4.484 18.502 13.651 16.5 27.5-2.167 10.167-8.333 16.333-18.5 18.5-36.333.667-72.667.667-109 0-5.947-1.613-9.447-5.447-10.5-11.5l-1-51a4618.213 4618.213 0 0 1-44.5 68 3552.01 3552.01 0 0 0 68 42.5c4.785 4.069 7.619 9.236 8.5 15.5.667 50.667.667 101.333 0 152-1.899 12.842-9.066 20.842-21.5 24zm77-319c11.338-.167 22.672 0 34 .5 3.205 1.415 4.872 3.915 5 7.5a52.024 52.024 0 0 1-7 13.5c-10 .667-20 .667-30 0-3.433-3.932-5.766-8.432-7-13.5.172-3.693 1.839-6.359 5-8zm-241 84c8.962 21.143 22.962 38.31 42 51.5 1.304.804 1.971 1.971 2 3.5a3764.455 3764.455 0 0 1-31.5 76c-7.069 10.391-16.236 12.558-27.5 6.5a8352.81 8352.81 0 0 0-113-47c-11.326-3.983-16.992-11.983-17-24 .192-22.185 11.192-33.852 33-35a51.439 51.439 0 0 1 11 3 2416.022 2416.022 0 0 0 72.5 29.5 2797.132 2797.132 0 0 0 28.5-64zm242 4c12.386-.394 24.72.106 37 1.5 4.708 1.378 8.208 4.212 10.5 8.5 5.076 17.372 8.076 35.038 9 53-3.292 13.294-11.459 22.127-24.5 26.5a256.122 256.122 0 0 1-32 0c-18.68-6.509-26.847-19.676-24.5-39.5l8-38c3.216-7.34 8.716-11.34 16.5-12z"/>
      </svg>
      <span class=${styles.tooltiptext_down}>Your transaction may be frontrun.</span>
      `
  }

  const setFail = (elem) => {
      elem.innerHTML = `
      <svg class=${styles.slip_svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
        <path d="M94.646 1.553c-9.304 3.364-16.199 9.61-20.65 18.705l-2.512 5.133-.39 100.781-.391 100.781-2.018 4.297c-1.11 2.363-4.946 8.164-8.526 12.891-3.58 4.726-8.5 11.23-10.934 14.453-42.779 56.637-29.117 125.053 27.858 139.505L84.575 400l95.017-.005c91.764-.005 95.094-.056 97.251-1.478 5.588-3.684 5.177 3.033 5.183-84.756l.005-78.818 7.342.384c16.154.845 15.614-.84 16.096 50.22l.39 41.406 2.512 5.132c13.277 27.132 51.159 27.33 64.348.337l2.672-5.469.21-91.406.211-91.406-2.01-7.014c-5.822-20.325-21.861-35.964-42.091-41.044-5.427-1.363-8.825-1.552-27.899-1.552h-21.719l-.226-34.57-.226-34.57-2.672-5.469c-3.497-7.156-9.704-13.363-16.86-16.859L256.641.391 177.734.216C101.432.047 98.69.091 94.646 1.553m157.698 23.979c6.266 3.905 5.832-1.319 6.076 73.101l.216 66.211H94.489l.216-66.211.217-66.211 1.713-2.734c4.015-6.408.2-6.128 81.49-5.985l71.484.125 2.735 1.704M123.157 49.139c-5.395 3.557-5.178 1.652-5.178 45.392s-.217 41.835 5.178 45.393c3.472 2.289 103.339 2.289 106.811 0 5.395-3.558 5.178-1.653 5.178-45.393s.217-41.835-5.178-45.392c-3.472-2.289-103.339-2.289-106.811 0m88.562 45.392v23.438h-23.438l-.005-8.008c-.007-11.45-3.022-15.419-11.713-15.419-8.692 0-11.707 3.969-11.714 15.419l-.005 8.008h-23.438V71.094H211.719v23.437m93.901 45.899.239 22.461 2.512 5.132c6.866 14.03 17.547 20.258 34.741 20.258h9.274l-.216 65.821c-.212 64.234-.255 65.882-1.779 68.413-4.515 7.492-15.017 7.492-19.532 0-1.496-2.483-1.579-4.352-1.953-43.999l-.39-41.407-2.672-5.468c-6.526-13.357-16.548-19.353-33.071-19.789l-10.742-.283v-93.6h23.35l.239 22.461m36.736-10.807c7.007 7.653 9.896 16.482 9.964 30.444l.024 4.99-7.302-.382c-14.53-.76-15.655-2.635-16.005-26.669l-.26-17.854 4.793 2.555c2.729 1.454 6.513 4.433 8.786 6.916m-83.762 152.799v94.141H147.719l3.687-4.883c18.257-24.177 18.18-59.845-.18-83.008-6.581-8.303-8.842-12.517-9.429-17.574-.914-7.877-4.88-11.713-12.109-11.713-9.811 0-11.229 2.692-11.725 22.256-.35 13.785-.58 15.93-1.953 18.218-4.497 7.491-15.011 7.491-19.526 0-1.516-2.518-1.569-4.185-1.783-57.086l-.22-54.492h164.113v94.141M74.156 309.766c11.99 24.537 47.367 26.991 61.953 4.297l1.255-1.954 1.388 3.125c2.019 4.546 2.447 18.816.762 25.394-6.703 26.163-34.37 41.58-59.238 33.009-36.727-12.659-42.803-56.425-13.549-97.591l3.976-5.594.391 16.922.39 16.923 2.672 5.469"/>
      </svg>
      <span class=${styles.tooltiptext_down}>Your transaction may fail.</span>`
  }

  const focusInput = (event) => {
      if (!event.target.id.includes('balance_div') &&
          event.target.tagName !== 'input') {
          var elem = event.target;
          while (!elem.id.includes('token_div')) {
              elem = elem.parentNode;
          }
          if (!isInFamilyTree(event.target, elem.getElementsByClassName(styles.choice_btn)[0])) {
              elem.getElementsByTagName("input")[0].focus();
          }
      }
  }

  const toogleSettings = () => {
      var icon = document.getElementById('settings_icon'),
          deg = rotatedSettings ? 0 : -120;
      icon.style.webkitTransform = 'rotate(' + deg + 'deg)';
      icon.style.mozTransform = 'rotate(' + deg + 'deg)';
      icon.style.msTransform = 'rotate(' + deg + 'deg)';
      icon.style.oTransform = 'rotate(' + deg + 'deg)';
      icon.style.transform = 'rotate(' + deg + 'deg)';
      setRotatedSettings(!rotatedSettings);
      document.getElementById(styles.settings_div).classList.toggle(styles.settings_div_activated);
  }

  const getTokenBySymbol = (symbol) => {
      for (let token of tokenListCur) {
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
      var cur_token = input.id === "input0" ? token0 : token1;
      const cur_balance = balances[cur_token['symbol']] ? balances[cur_token['symbol']] : 0;
      if(cur_balance != 0) {
        if (cur_token['symbol'] != "unselected") {
          input.value = cur_token === 'ETH' ? cur_balance - 0.01 : cur_balance;
        }
        input.blur = true;
      }
     
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
      if (!event.target.closest('#' + styles.settings_div) && !isInFamilyTree(event.target, document.getElementById("settings_toogle_btn"))) {
          if (document.getElementById(styles.settings_div).classList.contains(styles.settings_div_activated)) {
              toogleSettings();
          }
      }
  }

  const setToken = (token) => {
      const token_div = document.getElementById(`token_div${chooseTokenNum}`);
      if ([token1, token0][chooseTokenNum] == token) {
        changeTokens();
        return;
      }
      chooseTokenNum == 0 ? setToken0(token) : setToken1(token);
      
      token_div.getElementsByTagName("input")[0].value = "";
      const choosed_token_div = token_div.getElementsByClassName(styles.choosed_token_div)[0];
      choosed_token_div.innerHTML = "";
      const balance = token_div.getElementsByClassName(styles.balance_div)[0];
      var div = document.createElement('div');
      div.classList.add(styles.choosed_token_name);
      if (token['symbol'] === 'unselected') {
          div.innerHTML = "Select a token";
          balance.innerHTML = "Balance: ???";
      } else {
          var img = document.createElement('img');
          img.src = token['logoURI'];
          img.classList.add(styles.token_icon);
          img.draggable = false;
          img.addEventListener("error", replaceBrokenImg);
          choosed_token_div.appendChild(img);
          div.innerHTML = token['symbol'];
          balance.innerHTML = 'Balance: ' + (balances[token['symbol']] ? formatBalance(balances[token['symbol']]) : 0);
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
      setToken0(token1);
      setToken1(token0);
      token0InputMask.updateValue();
      token1InputMask.updateValue();
  }

  const setAutoSlipValue = () => {
        slipMask.value = '';
  }

  const closeExpModal = () => {
      setTimeout(() => {
        document.getElementById('exp_modal_inner').innerHTML = '';
      }, 275);
      document.getElementById('exp_modal_outer').classList.remove(styles.open);
      
      if (!expert) {
          document.getElementById('exp_input').checked = false;
      }
  }

  const openExpModal = () => {
    const html = createElementFromHTML(`
        <div class="${styles.modal_div_main} ${styles.exp_modal_div_main} ${styles.modal_div_grid} ${styles.exp_modal_div_grid}">
            <div class="${styles.modal_title} ${styles.exp_modal_title}">
                <div></div>
                <div class="${styles.exp_modal_title_text}">Are you sure?</div>
                <svg class="${styles.close_modal} ${styles.exp_close_modal}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
            </div>
            <div class="${styles.line}"></div>
            <div class="${styles.exp_modal_div} ${styles.modal_div_grid} ${styles.exp_modal_div_grid}">
                <div class="${styles.modal_secondary_text}">Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in bad rates and lost funds.</div>
                <div class="${styles.modal_main_text}">ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.</div>
                <button class="${styles.exp_modal_btn}">
                    <div class="${styles.exp_modal_btn_text}" id="confirm-expert-mode">Turn On Expert Mode</div>
                </button>
            </div>
        </div>
    `);

    html.getElementsByTagName('svg')[0].addEventListener('click', closeExpModal);
    html.getElementsByTagName('button')[0].addEventListener('click', () => setExpert(true));

    document.getElementById('exp_modal_inner').appendChild(html);
    document.getElementById('exp_modal_outer').classList.add(styles.open);
    toogleSettings();
  }

  const handleExpCheckboxClick = () => {
      if (expert) {
        setExpert(false);
      } else {
        openExpModal();
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
          closeChooseModal();
      }
  }

  const toogleExpIcon = () => {
      const expert_mode_div = document.getElementById("expert_mode_div");
      if (expert) {
          expert_mode_div.innerHTML = `
          <svg class=${styles.expert_mode_svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 250">
            <text class=${styles.cls_1} transform="matrix(1.277 0 0 1.472 -11 231.004)">EXPERT</text>
          </svg>
        `;
      } else {
          expert_mode_div.innerHTML = "";
      }
  }

  const closeChooseModal = (token = '') => {
    setTimeout(() => {
        document.getElementById(styles.choose_modal_inner).innerHTML = '';
    }, 275);
    document.getElementById('choose_modal_outer').classList.remove(styles.open);
    if (token) {
        setToken(token);
    }
    setChooseTokenNum();
  }
    
  const getPopularTokenDiv = (popular_token, choosed_tokens) => {
    const popular_token_div = createElementFromHTML(
    `
        <div class="${styles.popular_token}
                    ${popular_token == choosed_tokens[0] ? styles.disabled_fully : ''}
                    ${popular_token == choosed_tokens[1] ? styles.disabled_partially : ''}">
            <img class="${styles.token_icon}" src=${popular_token['logoURI']} draggable="false">
            </img>
            <div class=${styles.choosed_token_name}>
                ${popular_token['symbol']}
            </div>
        </div>
    `);
    popular_token_div.addEventListener('click', () => closeChooseModal(popular_token));
    
    return popular_token_div;
  }

  const getTokenDiv = (token, choosed_tokens) => {
    const token_div = createElementFromHTML(
    `
        <div class="${styles.list_token}
                    ${token == choosed_tokens[0] ? styles.disabled_fully : ''}
                    ${token == choosed_tokens[1] ? styles.disabled_partially : ''}">
            <img class="${styles.token_icon} ${styles.list_token_icon}" src=${token['logoURI']} draggable="false"></img>
            <div class=${styles.list_token_title}>
                <span class=${styles.list_token_symbol}>${token['symbol']}</span>
                <span class=${styles.list_token_name}>${token['name']}</span>
            </div>
            <span></span>
            <div class=${styles.list_token_balance}>
                ${formatBalance(balances[token['symbol']] ? balances[token['symbol']] : 0)}
            </div>
        </div>
    `);
    token_div.addEventListener('click', () => closeChooseModal(token));
    return token_div;
  }

  const getNoResultDiv = () => {
    return createElementFromHTML(`<div class="${styles.list_token_no_result}">No results found.</div>`);
  }

    const openChooseModal = () => {
        const choose_section = createElementFromHTML(`
        <div class="${styles.modal_div_main} ${styles.choose_modal_div_main}">
            <div class="${styles.choose_modal_div_upper} ${styles.choose_modal_div_grid}">
                <div class=${styles.modal_title}>
                    <div></div>
                    <svg class="${styles.close_modal} ${styles.choose_close_modal}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                </div>
                <input class="${styles.token_search_input} ${styles.no_outline}" type="text" placeholder="Search name or paste address" autoComplete="off"/>
                <div class=${styles.popular_tokens_div}>
                </div>
            </div>
            <div class=${styles.line}></div>
            <div class=${styles.choose_modal_div_lower}>
            </div>
        </div>`);

        choose_section.getElementsByClassName(styles.close_modal)[0].addEventListener('click', () => closeChooseModal());
        const search_input = choose_section.getElementsByClassName(styles.token_search_input)[0];
        search_input.addEventListener('change', (event) => setChooseModalInput(event.target.value));
        search_input.addEventListener('input', (event) => setChooseModalInput(event.target.value));
        const popular_tokens_div = choose_section.getElementsByClassName(styles.popular_tokens_div)[0];
        const tokens_div = choose_section.getElementsByClassName(styles.choose_modal_div_lower)[0];

        const choosed_tokens = chooseTokenNum == 0 ? [token0, token1] : [token1, token0]; // [currently choosing token, another one]
        for (let popular_token of popularTokensCur) {
            popular_tokens_div.appendChild(getPopularTokenDiv(popular_token, choosed_tokens));
        }

        if (tokenListCur.length) {
            for (let token of tokenListCur) {
                tokens_div.appendChild(getTokenDiv(token, choosed_tokens));
            }
        } else {
            tokens_div.appendChild(getNoResultDiv());
        }
        

        document.getElementById(styles.choose_modal_inner).appendChild(choose_section);
        document.getElementById('choose_modal_outer').classList.add(styles.open);
    }

  const handleChooseModalClick = (event) => {
    if (!event.target.closest('#' + styles.choose_modal_inner)) {
      closeChooseModal();
    }
  }

  const handleSearchTokenInput = (chooseModalInput) => {
    const tokens_div = document.getElementsByClassName(styles.choose_modal_div_lower)[0];
    tokens_div.innerHTML = '';
    const chooseModalInputToLower = chooseModalInput.toLowerCase()

    const choosed_tokens = chooseTokenNum == 0 ? [token0, token1] : [token1, token0]; // [currently choosing token, another one]
    if (chooseModalInput == '') {
        for (let token of tokenListCur) {
            tokens_div.appendChild(getTokenDiv(token, choosed_tokens));
        }
    } else {
        for (let token of tokenListCur) {
            if (token['symbol'].toLowerCase().includes(chooseModalInputToLower) ||
                token['name'].toLowerCase().includes(chooseModalInputToLower)) {
                tokens_div.appendChild(getTokenDiv(token, choosed_tokens));
            }
        }
    }
    if (tokens_div.innerHTML == '') {
        tokens_div.appendChild(getNoResultDiv());
    }
  }

  const createElementFromHTML = (htmlString)  => {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }

  const replaceBrokenImg = (event) => {
      let svg =  `
        <svg class=${styles.token_icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.93 4.93 14.14 14.14"/>
        </svg>
      `;
      event.srcElement.parentNode.replaceChild(createElementFromHTML(svg), event.srcElement);

  }

  useEffect(() => {
    if (initFlag.current) {
        initFlag.current = false;
        inputsInitMask();
    }
  }, []);

  return (
    <div className={`${styles.container} ${styles.unselectable}`} onClick={closeSettings} onKeyDown={handleKeydown}>

      <Head>
          <title>Simple Swap</title>
          <meta name="description" content="Exchange for ethereum network" />
          <link rel="icon" href="/icon.ico" />
      </Head>

      <nav className="navbar navbar-light fixed-top">
          <a className={`navbar-brand ${styles.translate_on_hover}`} href="#" draggable="false">
          <svg className={`d-inline-block ${styles.icon}`} version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path className={styles.arrow_up} d="m323.5 136-52 52H336v143h80V188h64.5l-52-52c-28.6-28.6-52.2-52-52.5-52-.3 0-23.9 23.4-52.5 52zM336 387v40h80v-80h-80v40zm64 0v24h-48v-48h48v24z"/>
              <path className={styles.arrow_down} d="M96 252.5V324H31.5l52.3 52.2 52.2 52.3 52.2-52.3 52.3-52.2H176V181H96v71.5zM96 125v40h80V85H96v40z"/>
          </svg>
          </a>
          <div id="menuDiv" className={`${styles.menu} ${styles.swap_toogle}`}>
              <div className={`${styles.swap_button} ${styles.menu_button}`} onClick={pageUp}>Swap</div>
              <div id="liqBtn" className={`${styles.liquidity_button} ${styles.menu_button} ${styles.hover_effect}`} onMouseDown={tooglePage}>Liquidity</div>
          </div>
          <button id="connectBtn" className={`${styles.menu_button} ${styles.connect_button} ${styles.rotate_on_hover} ${styles.bg_change_on_hover}`} onClick={connectWallet}>Connect wallet 
              <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
              </svg>
              </div>
          </button>
      </nav>

      <main className={styles.main}>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div className={styles.swap_div_main}>
              <div className={styles.swap_div}>
                  <div className={styles.swap_header}>
                      <div className={styles.settings_icon_div}>
                          <button id="settings_toogle_btn" className={styles.settings_toogle} onClick={toogleSettings}>
                              <svg id="settings_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                              </svg>
                              <div id="expert_mode_div" className={styles.expert_mode}></div>
                          </button>
                      </div>
                  </div>
                  <div id="token_div0" className={styles.token_div} onClick={focusInput}>
                      <div className={styles.input_div_main}>
                          <div>
                              <div className={styles.swap_label}>
                                  From
                              </div>
                              <div className={styles.input_div}>
                                  <input id="input0" className={`${styles.input_field} ${styles.no_outline}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false"></input>
                              </div>
                          </div>
                          <button className={styles.choice_btn} onClick={() => setChooseTokenNum(0)}>
                              <span className={styles.choice_span}>
                                  <div className={styles.choosed_token_div}>
                                      <img className={`${styles.token_icon}`} src={token0['logoURI']} draggable="false">
                                      </img>
                                      <div className={styles.choosed_token_name}>
                                        {token0['symbol']}
                                      </div>
                                  </div>
                                  <div>
                                      <svg className={styles.input_arrow} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 385 400">
                          <path d="M192.188 1.238C188.081 3.005 58.3 132.899 56.086 137.459c-4.567 9.405-.325 20.513 9.539 24.978 3.492 1.58 4.395 1.591 134.375 1.591s130.883-.011 134.375-1.591c9.864-4.465 14.106-15.573 9.539-24.978-2.333-4.803-132.047-134.5-136.272-136.253-3.674-1.525-11.875-1.508-15.454.032M65.625 237.563c-9.864 4.465-14.106 15.573-9.539 24.978 2.333 4.803 132.047 134.5 136.272 136.253 1.597.664 5.036 1.206 7.642 1.206 2.606 0 6.045-.542 7.642-1.206 4.225-1.753 133.939-131.45 136.272-136.253 4.567-9.405.325-20.513-9.539-24.978-5.543-2.509-263.207-2.509-268.75 0"/>
                      </svg>
                  </div>
                  <div id="token_div1" className={styles.token_div} onClick={focusInput}>
                      <div className={styles.input_div_main}>
                          <div>
                              <div className={styles.swap_label}>
                                  To
                              </div>
                              <div className={styles.input_div}>
                                  <input id="input1" className={`${styles.input_field} ${styles.no_outline}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false"></input>
                              </div>
                          </div>
                          <button className={styles.choice_btn} onClick={() => setChooseTokenNum(1)}>
                              <span className={styles.choice_span}>
                                  <div className={styles.choosed_token_div}>
                                      <div className={styles.choosed_token_name}>
                                          Select a token
                                      </div>
                                  </div>
                                  <div>
                                      <svg className={styles.input_arrow} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
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
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6e6e6e">
                                          <path d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777zM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14z"/>
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
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6e6e6e">
                                          <path d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777zM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14z"/>
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
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6e6e6e">
                                          <path d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777zM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14z"/>
                                      </svg>
                                      <span className={`${styles.tooltiptext_up} ${styles.tooltiptext_up_tip}`}>Allow high price impact trades and skip the confirm screen. Use at your own risk.</span>
                                  </div>
                              </div>
                          </div>
                          <div className={styles.switch_button} onClick={handleExpCheckboxClick}>
                              <input id="exp_input" className={styles.switch_button_checkbox} type="checkbox"></input>
                              <label className={styles.switch_button_label} htmlFor="">
                                  <span className={styles.switch_button_label_span}>Off</span>
                              </label>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div id="exp_modal_outer" className={styles.modal_outer} onClick={handleExpModalClick}>
              <div id="exp_modal_inner" className={styles.modal_inner}>
              </div>
          </div>
          <div id="choose_modal_outer" className={styles.modal_outer} onClick={handleChooseModalClick}>
              <div id={styles.choose_modal_inner} className={styles.modal_inner}>
              </div>
          </div>
      </main>
    </div>
  )
}
