import Head from 'next/head'
import Image from 'next/image'
import IMask from 'imask'
import {
    useEffect,
    useState,
    useRef
} from "react";
import {
    subtract,
    bignumber,
    divide
} from "mathjs";
import Web3 from "web3";
import jazzicon from "@metamask/jazzicon"

import styles from '../styles/Swap.module.scss'

import ETH_TOKEN from '../public/eth_token.json';
import ETH_PREFIXES from '../public/eth_prefixes.json';
import ALLOWED_CHAINIDS from '../public/allowed_chainids.json';
import token_list_all from '../public/token_list_all.json';
import popular_tokens_all from '../public/popular_tokens_all.json';
import genericErc20Abi from '../public/Erc20.json';


export default function Swap() {
    const avatarRef = useRef();
    const clearDivTimeout = useRef();

    const [provider, setProvider] = useState();
    const [web3, setWeb3] = useState();
    const [chainId, setChainId] = useState();
    const [address, setAddress] = useState();
    const [ethBalance, setEthBalance] = useState();
    const [balances, setBalances] = useState();
    const [swapContract, setSwapContract] = useState();

    const checkConnection = () => {
        const rpc = window.ethereum;
        if (!!rpc) {
            setProvider(rpc);
            setWeb3(new Web3(rpc));
        };
    };

    useEffect(() => {
        if (!!provider) {
            provider.on('chainChanged', (chainId) => {
                clearAccountStates();
                filterChainId(chainId)
            });
            provider.on('accountsChanged', (address) => {
                clearAccountStates();
                setAddress(address[0]);
            });
        }
    }, [provider]);

    const clearAccountStates = () => {
        setEthBalance();
        setBalances();
    }

    useEffect(() => {
        if (!!web3) {
            web3.eth.net.getId()
                .then(filterChainId);
            web3.eth.getAccounts()
                .then((addresses) => {
                    if (!!addresses) {
                        setAddress(addresses[0]);
                    }
                });
        }
    }, [web3]);

    useEffect(() => {
        if (!!web3 && !!address && !!chainId) {
            web3.eth.getBalance(address)
                .then((balance) => setEthBalance(web3.utils.fromWei(balance, 'ether')));
        }
    }, [web3, address, chainId]);

    useEffect(() => {
        const element = avatarRef.current;
        if (!!element && !!address) {
            const addr = address.slice(2, 10);
            const seed = parseInt(addr, 16);
            const icon = jazzicon(16, seed);
            if (!!element.firstChild) {
                element.removeChild(element.firstChild);
            }
            element.appendChild(icon);
        }
    }, [address, avatarRef, ethBalance]);

    const connectWalletHandler = async () => {
        if (!!provider) {
            provider.request({
                    method: "eth_requestAccounts"
                })
                .then(() => setWeb3(new Web3(provider)));
        }
    }

    const switchNetworkHandler = async () => {
        if (!!provider) {
            provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{
                        chainId: '0x1'
                    }],
                })
                .then(() =>
                    web3.eth.net.getId()
                    .then(filterChainId));
        }
    }

    useEffect(() => {

    }, [balances]);

    const filterChainId = (chainId_) => {
        chainId_ = Number.parseInt(chainId_);
        if (ALLOWED_CHAINIDS.includes(chainId_)) {
            setChainId(chainId_);
        } else {
            setChainId();
        }
    }

    const [tokenListAll, setTokenListAll] = useState(token_list_all['tokens']);

    useEffect(() => {
        if (!!tokenListAll) {
            if (chainId != undefined) {
                getTokensCurChainId(tokenListAll, chainId);
            } else {
                getTokensCurChainId(tokenListAll, 1);
            }
        }
    }, [tokenListAll, chainId]);

    const [popularTokensAll, setPopularTokensAll] = useState(popular_tokens_all);
    const [tokenListCur, setTokenListCur] = useState();

    useEffect(() => {
        if (!!tokenListCur && !!popularTokensAll) {
            if (!!chainId) {
                getPopularTokensCurChainId(tokenListCur, popularTokensAll, chainId);
            } else {
                getPopularTokensCurChainId(tokenListCur, popularTokensAll, 1);
            }
        }
    }, [tokenListCur, popularTokensAll, chainId])

    const [popularTokensCur, setPopularTokensCur] = useState();

    const getTokensCurChainId = (tokenListAll_, chainId_) => {
        var tokenListCur = [ETH_TOKEN]
        for (let token of tokenListAll_) {
            if (token['chainId'] === chainId_) {
                tokenListCur.push(token);
            }
        }
        setTokenListCur(tokenListCur);
    }

    const getPopularTokensCurChainId = (tokenListCur_, popularTokensAll_, chainId_) => {
        var popularTokensCur = [ETH_TOKEN];
        for (let token of popularTokensAll_[chainId_.toString()]) {
            popularTokensCur.push(token);
        }
        setPopularTokensCur(popularTokensCur)
    }

    useEffect(() => {
        if (!!address && !!tokenListCur && !!chainId) {
            const web3_tmp = new Web3(window.ethereum);
            var balances_tmp = {};
            for (let token of tokenListCur) {
                if (!!token['address']) {
                    const contract = new web3_tmp.eth.Contract(genericErc20Abi, token['address']);
                    contract.methods.balanceOf(address).call()
                        .then((balance) => {
                            balances_tmp[token['address']] = balance != 0 ? divide(bignumber(balance), bignumber(10 ** token['decimals'])) : 0;
                        })
                        .catch(() => {
                            balances_tmp[token['address']] = 0;
                        })
                }
            }
            setBalances(balances_tmp);
        }
    }, [address, tokenListCur, chainId]);

    const [chooseTokenNum, setChooseTokenNum] = useState();

    useEffect(() => {
        if (!!popularTokensCur && !!tokenListCur) {
            if ([0, 1].includes(chooseTokenNum)) {
                clearTimeout(clearDivTimeout.current);
                openChooseModal();
            } else {
                clearDivTimeout.current = setTimeout(() => {
                    clearDiv(document.getElementById(styles.choose_modal_inner));
                }, 275);
                closeChooseModal();
            }
        } else {
            setChooseTokenNum();
        }
    }, [popularTokensCur, tokenListCur, chooseTokenNum]);

    const [chooseModalInput, setChooseModalInput] = useState();

    useEffect(() => {
        if (chooseModalInput == undefined) {
            return;
        }
        const timeOutId = setTimeout(() => handleSearchTokenInput(chooseModalInput), 275);
        return () => clearTimeout(timeOutId);
    }, [chooseModalInput]);



    const [token0, setToken0] = useState(ETH_TOKEN);

    useEffect(() => {
        checkTokens(token0, token0Amount, token1, token1Amount, tokenInputFocus);
    }, [token0]);

    const [token1, setToken1] = useState();

    useEffect(() => {
        checkTokens(token0, token0Amount, token1, token1Amount, tokenInputFocus);
    }, [token1]);

    const [settingsOn, setSettingsOn] = useState();

    useEffect(() => {
        if (settingsOn != undefined) {
            toggleSettings();
            const timeOutId = setTimeout(() => {
                if (!settingsOn) {
                    clearDiv(document.getElementById(styles.settings_div));
                }
            }, 275);
            return () => clearTimeout(timeOutId);
        }
    }, [settingsOn]);

    const [slipMask, setSlipMask] = useState();

    useEffect(() => {
        if (!!slipMask) {
            slipMaskInitHandler();
            document.getElementsByClassName(styles.activated_auto_btn)[0].addEventListener('click', () => {
                slipMask.value = '';
            });
        }
    }, [slipMask]);

    const [dlMask, setDlMask] = useState();

    useEffect(() => {
        if (!!dlMask) {
            dlMaskInitHandler();
        }
    }, [dlMask]);

    const [isExpert, setIsExpert] = useState();

    useEffect(() => {
        if (isExpert != undefined) {
            setExpIconOn(isExpert);
            setOpenedExpModal();
            if (isExpert) {
                setExpCheckboxOn(true);
                localStorage.setItem('isExpert', '1');
            } else {
                localStorage.removeItem('isExpert');
            }
        }
    }, [isExpert]);

    useEffect(() => {
        if (!!slipMask && !!dlMask) {
            const slip_value = localStorage.getItem('slip_value');
            const dl_value = localStorage.getItem('dl_value');
            slipMask.value = slip_value ? slip_value : '';
            dlMask.value = dl_value ? dl_value : '';
        }
    }, [slipMask, dlMask, isExpert]);

    const [openedExpModal, setOpenedExpModal] = useState();

    useEffect(() => {
        if (!isExpert && openedExpModal) {
            openExpModal();
        } else {
            closeExpModal();
            if (!isExpert) {
                setExpCheckboxOn(false);
            }
        }
    }, [openedExpModal]);

    const [expCheckboxOn, setExpCheckboxOn] = useState(false);

    useEffect(() => {
        if (expCheckboxOn != undefined) {
            if (expCheckboxOn) {
                if (!isExpert) {
                    setOpenedExpModal(true);
                }
            } else {
                setIsExpert(false);
            }
        }
    }, [expCheckboxOn]);

    const [expIconOn, setExpIconOn] = useState();

    useEffect(() => {
        if (expIconOn != undefined) {
            const expert_mode_div = document.getElementById("expert_mode_div");
            clearDiv(expert_mode_div);
            if (expIconOn) {
                expert_mode_div.appendChild(getExpIcon());
            }
        }
    }, [expIconOn]);

    const [tokenInputFocus, setTokenInputFocus] = useState();

    const [token0Amount, setToken0Amount] = useState();

    useEffect(() => {
        if ((token0Amount == undefined || token0Amount == 0) && tokenInputFocus == 0) {
            setTokenInputFocus();
            setToken1Amount();
            document.getElementById('input1').value = '';
            clearDiv(document.getElementsByClassName(styles.swap_info_div)[0]);
        } else {
            if (!!token0 && !!token1 && tokenInputFocus == 0) {
                document.getElementById('input1').value = '';
                const timeOutId = setTimeout(() => handleToken0Input(token0Amount, token0, token1), 275);
                return () => clearTimeout(timeOutId);
            }
        }
    }, [token0Amount, tokenInputFocus]);

    const handleToken0Input = (token0Amount_, token0_, token1_) => {
        const token1Amount_ = calculateToken1Amount(token0Amount_, token0_, token1_);
        document.getElementById('input1').value = floatToString(token1Amount_);
        setToken1Amount(token1Amount_);
        const swap_info_div = document.getElementsByClassName(styles.swap_info_div)[0];
        clearDiv(swap_info_div);
        swap_info_div.appendChild(
            getTokenPriceInfoDiv(
                formatTokenPrice(
                    token0Amount_ / token1Amount_
                )
            )
        );
    }

    const [token1Amount, setToken1Amount] = useState();

    useEffect(() => {
        if ((token1Amount == undefined || token1Amount == 0) && tokenInputFocus == 1) {
            setTokenInputFocus();
            setToken0Amount();
            document.getElementById('input0').value = '';
            clearDiv(document.getElementsByClassName(styles.swap_info_div)[0]);
        } else {
            if (!!token0 && !!token1 && tokenInputFocus == 1) {
                document.getElementById('input0').value = '';
                const timeOutId = setTimeout(() => handleToken1Input(token1Amount, token0, token1), 275);
                return () => clearTimeout(timeOutId);
            }
        }
    }, [token1Amount, tokenInputFocus]);

    const handleToken1Input = (token1Amount_, token0_, token1_) => {
        const token0Amount_ = calculateToken0Amount(token1Amount_, token0_, token1_);
        document.getElementById('input0').value = floatToString(token0Amount_);
        setToken0Amount(token0Amount_);
        const swap_info_div = document.getElementsByClassName(styles.swap_info_div)[0];
        clearDiv(swap_info_div);
        swap_info_div.appendChild(
            getTokenPriceInfoDiv(
                formatTokenPrice(
                    token0Amount_ / token1Amount_
                )
            )
        );
    }

    const calculateToken1Amount = (token0_amount, token0, token1) => {
        return (token0_amount / 34).toFixed(8);
    }

    const calculateToken0Amount = (token1_amount, token0, token1) => {
        return (token1_amount / 34).toFixed(8);
    }

    const clearDiv = (div) => {
        div.innerHTML = '';
    }

    const formatTokenPrice = (token_price) => {
        var d = ",";
        var g = 3;
        var regex = new RegExp('\\B(?=(\\d{' + g + '})+(?!\\d))', 'g');
        var parts = Number.parseFloat(token_price).toLocaleString('fullwide', {
            minimumFractionDigits: 18,
            useGrouping: false
        }).split(",");
        var token_price_formated;
        let n = 0;
        let k = 0;
        let nums = false;
        if (parts[0] == '0') {
            token_price_formated = parts[0] + '.';
            for (let i of parts[1]) {
                k += 1;
                if (i != '0') {
                    nums = true;
                    n += 1
                } else {
                    if (!!nums) {
                        n += 1
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
                token_price_formated += "." + parts[1].slice(0, Math.max(5 - parts[0].length, 0))
            }
        };

        token_price_formated = removeNeadlessZeros(token_price_formated);
        return token_price_formated;
    }

    const getTokenPriceInfoDiv = (price) => {
        return createElementFromHTML(
            `
            <div class="${styles.swap_info_token_price_div}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M512 80c0 18.01-14.3 34.6-38.4 48-29.1 16.1-72.4 27.5-122.3 30.9-3.6-1.7-7.4-3.4-11.2-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4.2-24.5.6l-1.1-.6C142.3 114.6 128 98.01 128 80c0-44.18 85.1-80 192-80 106 0 192 35.82 192 80zm-351.3 81.1c10.2-.7 20.6-1.1 31.3-1.1 62.2 0 117.4 12.3 152.5 31.4 24.8 13.5 39.5 30.3 39.5 48.6 0 3.1-.7 7.9-2.1 11.7-4.6 13.2-17.8 25.3-35 35.6-.1 0-.3.1-.4.2-.3.2-.6.3-.9.5-35 19.4-90.8 32-153.6 32-59.6 0-112.94-11.3-148.16-29.1-1.87-1-3.69-2.8-5.45-2.9C14.28 274.6 0 258 0 240c0-34.8 53.43-64.5 128-75.4 10.5-1.6 21.4-2.8 32.7-3.5zm231.2 25.5c28.3-4.4 54.2-11.4 76.2-20.5 16.3-6.8 31.4-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9-14.7 7.4-32.4 13.6-52.4 18.4.1-1.7.2-3.5.2-5.3 0-21.9-10.6-39.9-24.1-53.4zM384 336c0 18-14.3 34.6-38.4 48-1.8.1-3.6 1.9-5.4 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.58-12.6-153.61-32C14.28 370.6 0 354 0 336v-35.4c12.45 10.3 27.62 18.7 43.93 25.5C83.44 342.6 135.8 352 192 352c56.2 0 108.6-9.4 148.1-25.9 7.8-3.2 15.3-6.9 22.4-10.9 6.1-3.4 11.8-7.2 17.2-11.2 1.5-1.1 2.9-2.3 4.3-3.4V336zm32-57.9c18.1-5 36.5-9.5 52.1-16 16.3-6.8 31.4-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9-16.3 16.3-45 29.7-81.3 38.4.1-1.7.2-3.5.2-5.3v-57.9zM192 448c56.2 0 108.6-9.4 148.1-25.9 16.3-6.8 31.4-15.2 43.9-25.5V432c0 44.2-86 80-192 80C85.96 512 0 476.2 0 432v-35.4c12.45 10.3 27.62 18.7 43.93 25.5C83.44 438.6 135.8 448 192 448z"/>
                </svg>
                1 ${token1['symbol']} = ${price} ${token0['symbol']}
            </div>
            
        `);
    }

    const checkTokens = (token0_, token0Amount_, token1_, token1Amount_, tokenInputFocus_) => {
        if (!!token0_ && !!token1_ && (!!token0Amount_ || !!token1Amount_) && [0, 1].includes(tokenInputFocus_)) {
            if (tokenInputFocus_ == 0) {
                handleToken0Input(token0Amount_, token0_, token1_);
            } else {
                handleToken1Input(token1Amount_, token0_, token1_);
            }
        }
    }

    const floatToString = (number) => {
        if (number == undefined) {
            return '';
        }

        return removeNeadlessZeros(
            number.toLocaleString('fullwide', {
                minimumFractionDigits: 18,
                useGrouping: false
            })
            .replace(",", ".")
        )
    }

    const stringToFloat = (number_str) => {
        if (number_str == '' || number_str == undefined || number_str == null) {
            return undefined;
        }

        return Number.parseFloat(number_str);
    }

    const openTab = (page) => {
        window.open(page, '_blank');
    }

    const togglePage = (event) => {
        event.preventDefault();

        if (!!event.which) { // if event.which, use 2 for middle button
            if (event.which === 2) {
                openTab("/liquidity");
            }
        } else if (!!event.button) { // and if event.button, use 1 or 4 for middle button
            if (navigator.userAgent.indexOf("Chrome") != -1 && event.button === 1) {
                openTab("/liquidity");
            } else if (event.button === 4) {
                openTab("/liquidity");
            }
        } else {
            setTimeout(() => {
                window.location.href = "/liquidity";
            }, 275);
            document.getElementById('menuDiv').classList.toggle(styles.toggle_menu);
            const liqBtn = document.getElementById('liqBtn');
            liqBtn.classList.add(styles.uneventable);
            liqBtn.classList.remove(styles.hover_effect);
        }
    }

    const pageUp = () => {
        window.location.href = "#";
    }

    const tokenInputsInitMask = () => {
        const token_inputs = document.getElementsByClassName(styles.input_field);
        const params_token_input = {
            mask: Number,
            scale: 18,
            signed: false,
            padFractionalZeros: false,
            normalizeZeros: true,
            radix: '.',
        }
        IMask(token_inputs[0], params_token_input)
        IMask(token_inputs[1], params_token_input)
    }

    const settingsInputsInitMask = (settings_div) => {
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
        setSlipMask(IMask(settings_div.getElementsByClassName(styles.slip_input_field)[0], params_slip_input));
        setDlMask(IMask(settings_div.getElementsByClassName(styles.dl_input_field)[0], params_dl_input));
    }

    const slipMaskInitHandler = () => {
        slipMask.on('accept', () => {
            localStorage.setItem('slip_value', slipMask.value);
            const auto_btn = document.getElementById(styles.auto_btn);
            const slip_warnings = document.getElementById('slip_warnings');
            if (slipMask.value === '') {
                auto_btn.classList.add(styles.activated_auto_btn);
                clearDiv(slip_warnings);
            } else {
                auto_btn.classList.remove(styles.activated_auto_btn);
                const slip_value_float = Number.parseFloat(slipMask.value);
                if (slip_value_float >= 0.05 && slip_value_float <= 1.0) {
                    clearDiv(slip_warnings);
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

    const toggleSettings = () => {
        var icon = document.getElementById('settings_icon'),
            deg = !settingsOn ? 0 : -120;
        icon.style.webkitTransform = 'rotate(' + deg + 'deg)';
        icon.style.mozTransform = 'rotate(' + deg + 'deg)';
        icon.style.msTransform = 'rotate(' + deg + 'deg)';
        icon.style.oTransform = 'rotate(' + deg + 'deg)';
        icon.style.transform = 'rotate(' + deg + 'deg)';

        const settings_div = document.getElementById(styles.settings_div);
        if (settingsOn) {
            const child = createElementFromHTML(
                `
            <div class="${styles.tx_settings_div_main}">
                <div class="${styles.tx_settings_title} ${styles.settings_title}">Transaction Settings</div>
                <div class="${styles.tx_settings_div}">
                    <div class="${styles.tx_settings_div_micro}">
                        <div class="${styles.info_row}">
                            <div>
                                Slippage tolerance
                            </div>
                            <div class="${styles.question_icon} ${styles.tooltip}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#6e6e6e">
                                    <path d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777zM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14z"/>
                                </svg>
                                <span class="${styles.tooltiptext_down} ${styles.tooltiptext_down_tip}">Your transaction will revert if the price changes unfavorably by more than this percentage.</span>
                            </div>
                        </div>
                        <div class="${styles.slip_input_div_main}">
                            <div id="${styles.auto_btn}" class="${styles.activated_auto_btn}">
                                Auto
                            </div>
                            <div class="${styles.slip_input_div}">
                                <span id="slip_warnings" class="${styles.slip_svg_span} ${styles.tooltip}">
                                </span>
                                <input id="slip_input" class="${styles.slip_input_field} ${styles.no_outline}" inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.10" spellCheck="false"></input>
                                %
                            </div>
                        </div>
                    </div>
                    <div class="${styles.tx_settings_div_micro}">
                        <div class="${styles.info_row}">
                            <div>
                                Transaction deadline
                            </div>
                            <div class="${styles.question_icon} ${styles.tooltip}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#6e6e6e">
                                    <path d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777zM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14z"/>
                                </svg>
                                <span class="${styles.tooltiptext_down} ${styles.tooltiptext_down_tip}">Your transaction will revert if it is pending for more than this period of time.</span>
                            </div>
                        </div>
                        <div class="${styles.dl_input_div_main}">
                            <div class="${styles.dl_input_div}">
                                <input id="dl_input" class="${styles.dl_input_field} ${styles.no_outline}" inputMode="numeric" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="30" spellCheck="false"></input>
                            </div>
                            <div class="${styles.minutes_div}">minutes</div>
                        </div>
                    </div>
                </div>
            </div>
        `);

            settingsInputsInitMask(child);
            clearDiv(settings_div);
            settings_div.appendChild(child);

            child = createElementFromHTML(
                `
            <div class="${styles.intrfc_settings_div_main}">
                <div class="${styles.intrfc_settings_title} ${styles.settings_title}">Interface Settings</div>
                <div class="${styles.exp_mode_div_main}">
                    <div class="${styles.exp_mode_div}">
                        <div class="${styles.info_row} ${styles.exp_mode_info_row}">
                            <div>
                                Expert Mode
                            </div>
                            <div class="${styles.question_icon} ${styles.tooltip}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#6e6e6e">
                                    <path d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777zM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14z"/>
                                </svg>
                                <span class="${styles.tooltiptext_up} ${styles.tooltiptext_up_tip}">Allow high price impact trades and skip the confirm screen. Use at your own risk.</span>
                            </div>
                        </div>
                    </div>
                    <div class="${styles.switch_button}">
                        <input id="exp_input" class="${styles.switch_button_checkbox}" type="checkbox" ${expCheckboxOn ? 'checked' : ''}></input>
                        <label class="${styles.switch_button_label}" htmlFor="">
                            <span class="${styles.switch_button_label_span}">Off</span>
                        </label>
                    </div>
                </div>
            </div>
        `);
            child.getElementsByClassName(styles.switch_button_checkbox)[0].addEventListener('click', (event) => setExpCheckboxOn(event.target.checked));

            settings_div.appendChild(child);

            settings_div.classList.toggle(styles.settings_div_activated);
        } else {
            settings_div.classList.toggle(styles.settings_div_activated);

            setSlipMask();
            setDlMask();
        }
    }

    const formatBalance = (balance) => {
        if (!Number.isInteger(balance)) {
            if (balance == undefined) {
                return 0;
            }
            var d = ",";
            var g = 3;
            var regex = new RegExp('\\B(?=(\\d{' + g + '})+(?!\\d))', 'g');
            var parts = Number.parseFloat(balance).toLocaleString('fullwide', {
                minimumFractionDigits: 18,
                useGrouping: false
            }).split(",");
            var balance = parts[0].replace(regex, d);
            if (!!parts[1]) {
                balance += "." + parts[1].slice(0, Math.max(5 - parts[0].length, 0))
                balance = removeNeadlessZeros(balance);
            }
        }
        return balance;
    }

    const formatEthBalance = (balance, prefix) => {
        if (!Number.isInteger(balance)) {
            const k = 6 - prefix.length;

            if (balance == undefined) {
                return 0;
            }
            var d = ",";
            var g = 3;
            var regex = new RegExp('\\B(?=(\\d{' + g + '})+(?!\\d))', 'g');
            var parts = Number.parseFloat(balance).toLocaleString('fullwide', {
                minimumFractionDigits: 18,
                useGrouping: false
            }).split(",");
            var balance = parts[0].replace(regex, d);
            if (!!parts[1]) {
                balance += "." + parts[1].slice(0, Math.max(k - parts[0].length, 0))
                balance = removeNeadlessZeros(balance);
            }
        }

        balance += ` ${prefix}ETH`;
        return balance;
    }

    const removeNeadlessZeros = (number_str) => {
        if (number_str.includes('.')) {
            let i;
            for (i = number_str.length - 1; i > -1; i--) {
                if (number_str[i] != '0') {
                    break;
                }
            }

            if (number_str[i] == '.') {
                i--;
            }
            return number_str.slice(0, i + 1);
        }

        return number_str;
    }

    const setMaxAmount = (token_num, token) => {
        // document.getElementById("input0").value = (getBalance(address0) - 0.01).toString();
        const cur_balance = getBalance(token);

        if (cur_balance < 0.0000001) {
            cur_balance = 0;
        }

        if (!token['address']) {
            cur_balance = Math.max(subtract(bignumber(cur_balance), 0.01), 0);
        }

        if (cur_balance == 0) {
            cur_balance = undefined;
        }

        setTokenInputFocus(token_num);
        if (token_num == 0) {
            document.getElementById('input0').value = cur_balance != undefined ? cur_balance : '';
            setToken0Amount(cur_balance);
        } else {
            document.getElementById('input1').value = cur_balance != undefined ? cur_balance : '';
            setToken1Amount(cur_balance);
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
        if (!event.target.closest('#' + styles.settings_div) && !isInFamilyTree(event.target, document.getElementById("settings_toggle_btn"))) {
            if (document.getElementById(styles.settings_div).classList.contains(styles.settings_div_activated)) {
                setSettingsOn(false);
            }
        }
    }

    const changeTokens = () => {
        setToken0(token1);
        setToken1(token0);
        if ([0, 1].includes(tokenInputFocus)) {
            setTokenInputFocus(1 - tokenInputFocus);
            setToken0Amount(token1Amount);
            setToken1Amount(token0Amount);
            const input0 = document.getElementById('input0');
            const input1 = document.getElementById('input1');
            const tmp = input0.value;
            input0.value = input1.value;
            input1.value = tmp;
        }
    }

    const closeExpModal = () => {
        setTimeout(() => {
            clearDiv(document.getElementById('exp_modal_inner'));
            makeBodyScrollable();
        }, 275);
        const exp_modal_outer = document.getElementById('exp_modal_outer');
        exp_modal_outer.classList.remove(styles.open_partially);
        exp_modal_outer.classList.remove(styles.open_fully);
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
                    <div class="${styles.exp_modal_btn_text}">Turn On Expert Mode</div>
                </button>
            </div>
        </div>
    `);

        html.getElementsByTagName('svg')[0].addEventListener('click', () => setOpenedExpModal());
        html.getElementsByTagName('button')[0].addEventListener('click', () => setIsExpert(true));

        const exp_modal_inner = document.getElementById('exp_modal_inner');
        clearDiv(exp_modal_inner);
        exp_modal_inner.appendChild(html);

        const exp_modal_outer = document.getElementById('exp_modal_outer');
        exp_modal_outer.classList.add(styles.open_partially);
        setTimeout(() => exp_modal_outer.classList.add(styles.open_fully), 275);

        setSettingsOn(false);

        makeBodyUnscrollable();
    }

    const handleExpModalClick = (event) => {
        if (!event.target.closest('#exp_modal_inner')) {
            setOpenedExpModal();
        }
    }

    const handleKeydown = (event) => {
        if (event.key === 'Escape') {
            setOpenedExpModal();
            setChooseTokenNum();
        }
    }

    const getExpIcon = () => {
        return createElementFromHTML(
            `
        <svg class="${styles.expert_mode_svg}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 250">
            <text class="${styles.cls_1}" x="50%" y="50%" dominant-baseline="middle">EXPERT</text>
        </svg>
    `);
    }

    const closeChooseModal = () => {
        setTimeout(() => {
            makeBodyScrollable();
        }, 275);
        const choose_modal_outer = document.getElementById('choose_modal_outer');
        choose_modal_outer.classList.remove(styles.open_fully);
        choose_modal_outer.classList.remove(styles.open_partially);
    }

    const getPopularTokenDiv = (popular_token, choosed_tokens) => {
        const disabled_partially = popular_token == choosed_tokens[1];
        const popular_token_div = createElementFromHTML(
        `
        <div class="${styles.popular_token}
                    ${popular_token == choosed_tokens[0] ? styles.disabled_fully : ''}
                    ${disabled_partially ? styles.disabled_partially : ''}">
            <img class="${styles.token_icon}" src=${popular_token['logoURI']} draggable="false" alt="" width="24px" height="24px" layout="fixed" />
            <div class=${styles.choosed_token_name}>
                ${popular_token['symbol']}
            </div>
        </div>
        `);
        popular_token_div.getElementsByTagName('img')[0].addEventListener('error', replaceBrokenImg);
        if (disabled_partially) {
            popular_token_div.addEventListener('click', () => setChooseTokenNum(() => {
                changeTokens();
                return;
            }));
        } else {
            popular_token_div.addEventListener('click', () => setChooseTokenNum((chooseTokenNum) => {
                [setToken0, setToken1][chooseTokenNum](popular_token);
                return;
            }));
        }

        return popular_token_div;
    }

    const getTokenDiv = (token, choosed_tokens, is_overflown) => {
        const disabled_partially = token == choosed_tokens[1];
        const cur_balance = getBalance(token);
        const token_div = createElementFromHTML(
        `
        <div class="${is_overflown ? styles.list_token_margined : ''}">
            <div class="${styles.list_token}
                        ${token == choosed_tokens[0] ? styles.disabled_fully : ''}
                        ${disabled_partially ? styles.disabled_partially : ''}">
                <img class="${styles.token_icon} ${styles.list_token_icon}" src=${token['logoURI']} draggable="false" alt="" width="24px" height="24px" layout="fixed" />
                <div class=${styles.list_token_title}>
                    <span class=${styles.list_token_symbol}>${token['symbol']}</span>
                    <span class=${styles.list_token_name}>${token['name']}</span>
                </div>
                <div class=${styles.list_token_balance}>
                    ${cur_balance != undefined ? formatBalance(cur_balance) : ''}
                </div>
            </div>
        </div>
        `);
        token_div.getElementsByTagName('img')[0].addEventListener('error', replaceBrokenImg);
        if (disabled_partially) {
            token_div.addEventListener('click', () => setChooseTokenNum(() => {
                changeTokens();
                return;
            }));
        } else {
            token_div.addEventListener('click', () => setChooseTokenNum((chooseTokenNum) => {
                [setToken0, setToken1][chooseTokenNum](token);
                return;
            }));
        }
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

        choose_section.getElementsByClassName(styles.close_modal)[0].addEventListener('click', () => setChooseTokenNum());
        const search_input = choose_section.getElementsByClassName(styles.token_search_input)[0];
        search_input.addEventListener('change', (event) => setChooseModalInput(event.target.value));
        search_input.addEventListener('input', (event) => setChooseModalInput(event.target.value));
        const popular_tokens_div = choose_section.getElementsByClassName(styles.popular_tokens_div)[0];
        const tokens_div = choose_section.getElementsByClassName(styles.choose_modal_div_lower)[0];

        const choosed_tokens = chooseTokenNum == 0 ? [token0, token1] : [token1, token0]; // [currently choosing token, another one]
        for (let popular_token of popularTokensCur) {
            popular_tokens_div.appendChild(getPopularTokenDiv(popular_token, choosed_tokens));
        }

        const is_overflown = isOverflown(tokenListCur.length);
        if (is_overflown) {
            tokens_div.classList.add(styles.margined);
        }

        if (!!tokenListCur.length) {
            for (let token of tokenListCur) {
                tokens_div.appendChild(getTokenDiv(token, choosed_tokens, is_overflown));
            }
        } else {
            tokens_div.appendChild(getNoResultDiv());
        }

        const choose_modal_inner = document.getElementById(styles.choose_modal_inner);
        clearDiv(choose_modal_inner);
        choose_modal_inner.appendChild(choose_section);

        const choose_modal_outer = document.getElementById('choose_modal_outer');
        choose_modal_outer.classList.add(styles.open_partially);
        setTimeout(() => choose_modal_outer.classList.add(styles.open_fully), 275);

        makeBodyUnscrollable();
    }

    const isOverflown = (tokenListCur_length) => {
        // 0.8 - 80% of window height = modal height 
        // 240 - min height of upper choose modal part
        // 56 - height of list token
        return window.innerHeight * 0.8 - 240 < tokenListCur_length * 56;
    }

    const makeBodyUnscrollable = () => {
        document.body.classList.add(styles.unscrollable);
    }

    const makeBodyScrollable = () => {
        document.body.classList.remove(styles.unscrollable);
    }

    const handleChooseModalClick = (event) => {
        if (!event.target.closest('#' + styles.choose_modal_inner)) {
            setChooseTokenNum();
        }
    }

    const handleSearchTokenInput = (chooseModalInput) => {
        const tokens_div = document.getElementsByClassName(styles.choose_modal_div_lower)[0];
        clearDiv(tokens_div);
        const choosed_tokens = chooseTokenNum == 0 ? [token0, token1] : [token1, token0]; // [currently choosing token, another one]
        const regex = /^0x[a-fA-F0-9]{40}$/;
        if (chooseModalInput.match(regex)) {
            for (let token of tokenListCur) {
                if (token['address'] === chooseModalInput) {
                    tokens_div.appendChild(getTokenDiv(token, choosed_tokens));
                }
            }
        } else {
            const chooseModalInputToLower = chooseModalInput.toLowerCase()
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
        }
        
        if (tokens_div.innerHTML == '') {
            tokens_div.appendChild(getNoResultDiv());
        }
    }

    const createElementFromHTML = (htmlString) => {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }

    const replaceBrokenImg = (event) => {
        let svg = `
        <svg class=${styles.token_icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.93 4.93 14.14 14.14"/>
        </svg>
      `;
        event.srcElement.parentNode.replaceChild(createElementFromHTML(svg), event.srcElement);

    }

    const formatAddress = (addr) => {
        return addr.slice(0, 6) + "..." + addr.slice(addr.length - 4, addr.length);
    }

    const getBalance = (token) => {
        if (!!ethBalance || !!balances) {
            if (!!token['address']) {
                return balances[token['address']];
            }
            return ethBalance;
        }
        return undefined;
    }

    const isEnough = (token0_, token0Amount_) => {
        if (!!token0Amount_) {
            return isEnoughBalance(token0_, token0Amount_);
        }
        return isEnoughBalance(token0_, Number.parseFloat(document.getElementById("input0").value));
    }

    const isEnoughBalance = (token, tokenAmount) => {
        var balance = getBalance(token);
        if (token['symbol'] == 'ETH') {
            balance -= 0.01;
        }
        return balance >= tokenAmount;
    }

    const swapTokens = (token0_, token0Amount_, token1_) => {
        
    }

    useEffect(() => {
        tokenInputsInitMask();
        checkConnection();
        setIsExpert(localStorage.getItem('isExpert'));
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
                        <path className={styles.arrow_up} d="m323.5 136-52 52H336v143h80V188h64.5l-52-52c-28.6-28.6-52.2-52-52.5-52-.3 0-23.9 23.4-52.5 52zM336 387v40h80v-80h-80v40zm64 0v24h-48v-48h48v24z" />
                        <path className={styles.arrow_down} d="M96 252.5V324H31.5l52.3 52.2 52.2 52.3 52.2-52.3 52.3-52.2H176V181H96v71.5zM96 125v40h80V85H96v40z" />
                    </svg>
                </a>
                <div className={styles.menu_main}>
                    <div id="menuDiv" className={`${styles.menu} ${styles.toggle_init}`}>
                        <div className={`${styles.swap_button} ${styles.menu_button}`} onClick={pageUp}>Swap</div>
                        <div id="liqBtn" className={`${styles.liquidity_button} ${styles.menu_button} ${styles.hover_effect}`} onMouseDown={togglePage}>Liquidity</div>
                    </div>
                </div>
                <div className={`${styles.connect_button_div}`}>
                    {!address
                        ? (
                            <button id="connectBtn" className={`${styles.connect_button} ${styles.rotate_on_hover} ${styles.bg_change_on_hover}`} onClick={connectWalletHandler}>
                                Connect wallet
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
                                    </svg>
                                </div>
                            </button>
                        )
                        : (!chainId
                            ? (
                                <button id="connectBtn" className={`${styles.connect_button} ${styles.rotate_on_hover_new} ${styles.bg_change_on_hover}`} onClick={switchNetworkHandler}>
                                    Switch network
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                            <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                                        </svg>
                                    </div>
                                </button>
                            )
                            : (!ethBalance
                                ? (
                                    <div className={`${styles.account_div_main} ${styles.please_wait_div}`}>
                                        Please wait 
                                        <div className={styles.lds_dual_ring}></div>
                                    </div>
                                )
                                : (
                                    <div className={`${styles.account_div_main}`}>
                                        <div className={styles.eth_balance_div} onClick={()=> {navigator.clipboard.writeText(ethBalance); }}>
                                            {formatEthBalance(ethBalance, ETH_PREFIXES[chainId.toString()])}
                                        </div>
                                        <div className={styles.account_div} onClick={()=> {navigator.clipboard.writeText(address); }}>
                                            <div className={styles.address_div}>
                                                {formatAddress(address)}
                                            </div>
                                            <div ref={avatarRef} className={styles.avatar_div}>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                        )
                    }
                </div>
            </nav>
        
            <main className={styles.main}>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div className={styles.swap_div_main}>
                    <div className={styles.swap_div}>
                        <div className={styles.swap_header}>
                            <div className={styles.settings_icon_div}>
                                <button id="settings_toggle_btn" className={styles.settings_toggle} onClick={()=> setSettingsOn(settingsOn => !settingsOn)}>
                                    <svg id="settings_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                                    </svg>
                                    <div id="expert_mode_div" className={styles.expert_mode_div}></div>
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
                                        <input id="input0" className={`${styles.input_field} ${styles.no_outline}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false" onInput={(event)=> {
                                        setTokenInputFocus(0);
                                        setToken0Amount(stringToFloat(event.target.value));
                                        }}/>
                                    </div>
                                </div>
                                <button className={styles.choice_btn} onClick={()=> setChooseTokenNum(0)}>
                                    <span className={styles.choice_span}>
                                        <div className={styles.choosed_token_div}>
                                            {!!token0
                                                && (
                                                    <Image className={`${styles.token_icon}`} src={token0['logoURI']} draggable="false" onError={replaceBrokenImg} alt="" width="24px" height="24px" layout="fixed" />
                                                )                                            
                                            }
                                            {!!token0
                                                ? (
                                                    <div className={styles.choosed_token_name}>
                                                        {token0['symbol']}
                                                    </div>
                                                )
                                                : (
                                                    <div className={`${styles.choosed_token_name} ${styles.choosed_token_name_select}`}>
                                                        Select a token
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <svg className={styles.input_arrow} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                            </svg>
                                        </div>
                                    </span>
                                </button>
                            </div>
                            <div className={styles.balance_div_main}>
                                {!!address && !!token0
                                    && (((!token0['address'] && !!ethBalance) || (!!token0['address'] && !!balances))
                                        ? (
                                            <div id="balance_div0" className={styles.balance_div0} onClick={()=> setMaxAmount(0, token0)}>
                                                Balance: {formatBalance(getBalance(token0))}
                                            </div>
                                        )
                                        : (
                                            <div className={styles.balance_div1}>
                                                <div>
                                                    Balance: 
                                                </div>
                                                <div className={`${styles.lds_dual_ring} ${styles.lds_dual_ring_balance}`}>
                                                </div>
                                            </div>
                                        )
                                    )
                                }
                            </div>
                        </div>
                        <div className={styles.change_arrow} onClick={changeTokens}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 385 400">
                                <path d="M192.188 1.238C188.081 3.005 58.3 132.899 56.086 137.459c-4.567 9.405-.325 20.513 9.539 24.978 3.492 1.58 4.395 1.591 134.375 1.591s130.883-.011 134.375-1.591c9.864-4.465 14.106-15.573 9.539-24.978-2.333-4.803-132.047-134.5-136.272-136.253-3.674-1.525-11.875-1.508-15.454.032M65.625 237.563c-9.864 4.465-14.106 15.573-9.539 24.978 2.333 4.803 132.047 134.5 136.272 136.253 1.597.664 5.036 1.206 7.642 1.206 2.606 0 6.045-.542 7.642-1.206 4.225-1.753 133.939-131.45 136.272-136.253 4.567-9.405.325-20.513-9.539-24.978-5.543-2.509-263.207-2.509-268.75 0" />
                            </svg>
                        </div>
                        <div id="token_div1" className={styles.token_div} onClick={focusInput}>
                            <div className={styles.input_div_main}>
                                <div>
                                    <div className={styles.swap_label}>
                                        To
                                    </div>
                                    <div className={styles.input_div}>
                                        <input id="input1" className={`${styles.input_field} ${styles.no_outline}`} inputMode="decimal" autoComplete="off" autoCorrect="off" autofill="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false" onInput={(event)=> {
                                        setTokenInputFocus(1);
                                        setToken1Amount(stringToFloat(event.target.value));
                                        }}/>
                                    </div>
                                </div>
                                <button className={styles.choice_btn} onClick={()=> setChooseTokenNum(1)}>
                                    <span className={styles.choice_span}>
                                        <div className={styles.choosed_token_div}>
                                            {!!token1
                                                && (
                                                    <Image className={`${styles.token_icon}`} src={token1['logoURI']} draggable="false" onError={replaceBrokenImg} alt="" width="24px" height="24px" layout="fixed" />
                                                )    
                                            }
                                            {!!token1
                                                ? (
                                                    <div className={styles.choosed_token_name}>
                                                        {token1['symbol']}
                                                    </div>
                                                )
                                                : (
                                                    <div className={`${styles.choosed_token_name} ${styles.choosed_token_name_select}`}>
                                                        Select a token
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <svg className={styles.input_arrow} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                            </svg>
                                        </div>
                                    </span>
                                </button>
                            </div>
                            <div className={styles.balance_div_main}>
                                {!!address && !!token1
                                    && (((!token1['address'] && !!ethBalance) || (!!token1['address'] && !!balances))
                                        ? (
                                            <div id="balance_div1" className={styles.balance_div1}>
                                                Balance: {formatBalance(getBalance(token1))}
                                            </div>
                                        )
                                        : (
                                            <div className={styles.balance_div1}>
                                                <div>
                                                    Balance: 
                                                </div>
                                                <div className={`${styles.lds_dual_ring} ${styles.lds_dual_ring_balance}`}>
                                                </div>
                                            </div>
                                        )
                                    )
                                }
                            </div>
                        </div>
                        <div className={styles.swap_info_div}>
                        </div>
                        <div id="swap_tokens_div" className={`${styles.swap_tokens_div}`}>
                            {!address
                                ? (
                                    <button className={` ${styles.swap_tokens_default_div} ${styles.swap_tokens_connect_btn}`} onClick={connectWalletHandler}>
                                        Connect wallet
                                    </button>
                                )
                                : ((!token0 || !token1)
                                    ? (
                                        <div className={`${styles.swap_tokens_default_div} ${styles.swap_tokens_select_div}`}>
                                            Select a token
                                        </div>
                                    )
                                    : (!!token0Amount
                                        ? (
                                            <div className={`${styles.swap_tokens_default_div} ${styles.swap_tokens_select_div}`}>
                                                Enter an amount
                                            </div>
                                        )
                                        : (!isEnough(token0, token0Amount)
                                            ? (
                                                <div className={`${styles.swap_tokens_default_div} ${styles.swap_tokens_select_div}`}>
                                                    Insufficient {token0['symbol']} balance
                                                </div>
                                            )
                                            : (
                                                <div className={`${styles.swap_tokens_default_div} ${styles.swap_tokens_connect_btn}`} onClick={swapTokens(token0, token0Amount, token1)}>
                                                    Swap
                                                </div>
                                            )

                                        )

                                    )

                                )
                            
                            }
                        </div>
                    </div>
                    <div id={styles.settings_div}>
                    </div>
                </div>
                <div id="exp_modal_outer" className={`${styles.modal_outer} ${styles.uneventable}`} onClick={handleExpModalClick}>
                    <div id="exp_modal_inner" className={styles.modal_inner}>
                    </div>
                </div>
                <div id="choose_modal_outer" className={`${styles.modal_outer} ${styles.uneventable}`} onClick={handleChooseModalClick}>
                    <div id={styles.choose_modal_inner} className={styles.modal_inner}>
                    </div>
                </div>
            </main>
        </div>
    )
}
