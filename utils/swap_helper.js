import jazzicon from "@metamask/jazzicon";
import { renderIcon } from "@download/blockies";

import styles from "../styles/Swap.module.scss";

import ALLOWED_CHAINIDS from "../public/allowed_chainids.json";
import ETH_TOKEN from "../public/eth_token.json";

export const getSeed = (address) => {
  const addr = address.slice(2, 10);
  return Number.parseInt(addr, 16);
};

export const createElementFromHTML = (htmlString) => {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

export const setJazzIcon = (element, address) => {
  const seed = getSeed(address);
  const icon = jazzicon(16, seed);
  element.appendChild(icon);
};

export const setBlockIcon = (element, address) => {
  const canvas = createElementFromHTML(
    `
            <canvas class="${styles.canvas}"/>
        `
  );
  renderIcon({ seed: address.toLowerCase() }, canvas);
  element.appendChild(canvas);
};

export const filterChainId = (chainId_) => {
  chainId_ = Number.parseInt(chainId_);
  if (ALLOWED_CHAINIDS.includes(chainId_)) {
    return chainId_;
  }
  return undefined;
};

export const getTokensCurChainId = (tokenListAll_, chainId_) => {
  var tokenListCur = [ETH_TOKEN];
  for (let token of tokenListAll_) {
    if (token["chainId"] === chainId_) {
      tokenListCur.push(token);
    }
  }
  return tokenListCur;
};

export const getPopularTokensCurChainId = (popularTokensAll_, chainId_) => {
  var popularTokensCur = [ETH_TOKEN];
  for (let token of popularTokensAll_[chainId_.toString()]) {
    popularTokensCur.push(token);
  }
  return popularTokensCur;
};

export const clearDiv = (div) => {
  div.innerHTML = "";
};

export const removeNeadlessZeros = (number_str) => {
  if (number_str.includes(".")) {
    let i;
    for (i = number_str.length - 1; i > -1; i--) {
      if (number_str[i] != "0") {
        break;
      }
    }

    if (number_str[i] == ".") {
      i--;
    }
    return number_str.slice(0, i + 1);
  }

  return number_str;
};

export const formatTokenPrice = (token_price) => {
  var d = ",";
  var g = 3;
  var regex = new RegExp("\\B(?=(\\d{" + g + "})+(?!\\d))", "g");
  var parts = Number.parseFloat(token_price)
    .toLocaleString("fullwide", {
      minimumFractionDigits: 18,
      useGrouping: false,
    })
    .split(",");
  var token_price_formated;
  let n = 0;
  let k = 0;
  let nums = false;
  if (parts[0] == "0") {
    token_price_formated = parts[0] + ".";
    for (let i of parts[1]) {
      k += 1;
      if (i != "0") {
        nums = true;
        n += 1;
      } else {
        if (!!nums) {
          n += 1;
        }
      }
      token_price_formated += i;
      if (n == 4) {
        break;
      }
    }
  } else {
    token_price_formated = parts[0].replace(regex, d);
    if (!!parts[1]) {
      token_price_formated +=
        "." + parts[1].slice(0, Math.max(5 - parts[0].length, 0));
    }
  }

  token_price_formated = removeNeadlessZeros(token_price_formated);
  return token_price_formated;
};

export const floatToString = (number) => {
  if (number == undefined) {
    return "";
  }

  return removeNeadlessZeros(
    number
      .toLocaleString("fullwide", {
        minimumFractionDigits: 18,
        useGrouping: false,
      })
      .replace(",", ".")
  );
};

export const stringToFloat = (number_str) => {
  if (number_str == "" || number_str == undefined || number_str == null) {
    return undefined;
  }

  return Number.parseFloat(number_str);
};

export const openTab = (page) => {
  window.open(page, "_blank");
};

export const pageUp = () => {
  window.scrollTo(0, 0);
};

export const formatBalance = (balance) => {
  if (!Number.isInteger(balance)) {
    if (balance == undefined) {
      return 0;
    }
    var d = ",";
    var g = 3;
    var regex = new RegExp("\\B(?=(\\d{" + g + "})+(?!\\d))", "g");
    var parts = Number.parseFloat(balance)
      .toLocaleString("fullwide", {
        minimumFractionDigits: 18,
        useGrouping: false,
      })
      .split(",");
    var balance = parts[0].replace(regex, d);
    if (!!parts[1]) {
      balance += "." + parts[1].slice(0, Math.max(5 - parts[0].length, 0));
      balance = removeNeadlessZeros(balance);
    }
  }
  return balance;
};

export const formatEthBalance = (balance, prefix) => {
  balance ||= 0;
  if (!Number.isInteger(balance)) {
    const k = 6 - prefix.length;
    var d = ",";
    var g = 3;
    var regex = new RegExp("\\B(?=(\\d{" + g + "})+(?!\\d))", "g");
    var parts = Number.parseFloat(balance)
      .toLocaleString("fullwide", {
        minimumFractionDigits: 18,
        useGrouping: false,
      })
      .split(",");
    var balance = parts[0].replace(regex, d);
    if (!!parts[1]) {
      balance += "." + parts[1].slice(0, Math.max(k - parts[0].length, 0));
      balance = removeNeadlessZeros(balance);
    }
  }

  balance += ` ${prefix}ETH`;
  return balance;
};

export const isInFamilyTree = (child, parent) => {
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
};

export const getExpIcon = () => {
  return createElementFromHTML(
    `
        <svg class="${styles.expert_mode_svg}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 250">
            <text class="${styles.cls_1}" x="50%" y="50%" dominant-baseline="middle">EXPERT</text>
        </svg>
    `
  );
};

export const getNoResultDiv = () => {
  return createElementFromHTML(
    `<div class="${styles.list_token_no_result}">No results found.</div>`
  );
};

export const isOverflown = (tokenListCur_length) => {
  // 0.8 - 80% of window height = modal height
  // 240 - min height of upper choose modal part
  // 56 - height of list token
  return window.innerHeight * 0.8 - 240 < tokenListCur_length * 56;
};

export const determineInnerModalId = (modalName) => {
  const modalNameFull = `${modalName}_modal_inner`;
  return styles[modalNameFull] || modalNameFull;
};

export const replaceBrokenImg = (event) => {
  let svg = `
        <svg class=${styles.token_icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.93 4.93 14.14 14.14"/>
        </svg>
        `;
  event.srcElement.parentNode.replaceChild(
    createElementFromHTML(svg),
    event.srcElement
  );
};

export const formatAddress = (addr) => {
  return addr.slice(0, 6) + "..." + addr.slice(addr.length - 4, addr.length);
};
