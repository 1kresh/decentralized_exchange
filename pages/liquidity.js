import Head from 'next/head'
import styles from '../styles/Liquidity.module.scss'
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

import ETH_TOKEN from '../public/eth_token.json';
import ETH_PREFIXES from '../public/eth_prefixes.json';
import ALLOWED_CHAINIDS from '../public/allowed_chainids.json';
import token_list_all from '../public/token_list_all.json';
import popular_tokens_all from '../public/popular_tokens_all.json';
import genericErc20Abi from '../public/Erc20.json';

export default function Liquidity() {

    const avatarRef = useRef()

    const [provider, setProvider] = useState();
    const [web3, setWeb3] = useState();
    const [chainId, setChainId] = useState();
    const [address, setAddress] = useState();
    const [ethBalance, setEthBalance] = useState();
    const [balances, setBalances] = useState();
    const [liquidityContract, setLiquidityContract] = useState();

    const checkConnection = () => {
        if (window.ethereum) {
            setProvider(window.ethereum);
            setWeb3(new Web3(window.ethereum));
        };
    };

    useEffect(() => {
        if (provider) {
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
        if (web3) {
            web3.eth.net.getId()
                .then(filterChainId);
            web3.eth.getAccounts()
                .then((addrs) => {
                    if (addrs) {
                        setAddress(addrs[0]);
                    }
                });
        }
    }, [web3]);

    useEffect(() => {
        if (web3 && address && chainId) {
            web3.eth.getBalance(address)
                .then((balance) => setEthBalance(web3.utils.fromWei(balance, 'ether')));
        }
    }, [web3, address, chainId]);

    useEffect(() => {
        const element = avatarRef.current;
        if (element && address) {
            const addr = address.slice(2, 10);
            const seed = parseInt(addr, 16);
            const icon = jazzicon(16, seed);
            if (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            element.appendChild(icon);
        }
    }, [address, avatarRef, ethBalance]);

    const connectWalletHandler = async () => {
        if (provider) {
            provider.request({
                    method: "eth_requestAccounts"
                })
                .then(() => setWeb3(new Web3(provider)));
        }
    }

    const switchNetworkHandler = async () => {
        if (provider) {
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

    const openTab = (page) => {
        window.open(page, '_blank');
    }

    const togglePage = (event) => {
        event.preventDefault();

        if (event.which) { // if event.which, use 2 for middle button
            if (event.which === 2) {
                openTab("/");
            }
        } else if (event.button) { // and if event.button, use 1 or 4 for middle button
            if (navigator.userAgent.indexOf("Chrome") != -1 && event.button === 1) {
                openTab("/");
            } else if (event.button === 4) {
                openTab("/");
            }
        } else {
            setTimeout(() => {
                window.location.href = "/";
            }, 275);
            document.getElementById('menuDiv').classList.toggle(styles.toggle_menu);
            document.getElementById('swpBtn').classList.remove(styles.hover_effect);
        }
    }

    const pageUp = () => {
        window.location.href = "#";
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
            if (parts[1]) {
                balance += "." + parts[1].slice(0, Math.max(k - parts[0].length, 0))
                balance = removeSufficientsZeros(balance);
            }
        }

        balance += ` ${prefix}ETH`;
        return balance;
    }

    const removeSufficientsZeros = (number_str) => {
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

    const formatAddress = (addr) => {
        return addr.slice(0, 6) + "..." + addr.slice(addr.length - 4, addr.length);
    }

    useEffect(() => {
        checkConnection();
    }, []);

    return (
        <div className={`${styles.container} ${styles.unselectable}`}>

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
                        <div id="swpBtn" className={`${styles.swap_button} ${styles.menu_button} ${styles.hover_effect}`} onMouseDown={togglePage}>Swap</div>
                        <div className={`${styles.liquidity_button} ${styles.menu_button}`} onClick={pageUp}>Liquidity</div>
                    </div>
                </div>
                <div className={`${styles.connect_button_div}`}>
                    {!address &&
                    <button id="connectBtn" className={`${styles.connect_button} ${styles.rotate_on_hover} ${styles.bg_change_on_hover}`} onClick={connectWalletHandler}>
                        Connect wallet
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
                            </svg>
                        </div>
                    </button>
                    }
                    {address && !chainId &&
                    <button id="connectBtn" className={`${styles.connect_button} ${styles.rotate_on_hover_new} ${styles.bg_change_on_hover}`} onClick={switchNetworkHandler}>
                        Switch network
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                            </svg>
                        </div>
                    </button>
                    }
                    {address && ethBalance && chainId &&
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
                    }
                </div>
            </nav>
        
            <main className={styles.main}>
                <noscript>You need to enable JavaScript to run this app.</noscript>
            </main>
        </div>
    )
}
