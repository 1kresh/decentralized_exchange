import ISimswapFactory from "@simswap/periphery/build/ISimswapFactory.json";
import ISimswapPool from "@simswap/periphery/build/ISimswapPool.json";

import env from "./env.json";
import contracts from "./public/contracts.json";

import Web3 from "web3";
import fs from "fs";

const tmp = () => {
  for (const chainId of ["3", "4", "5"]) {
    const web3 = new Web3(env.chainId_endpoint[chainId]);
    const factoryContract = new web3.eth.Contract(
      ISimswapFactory["abi"],
      contracts["factories"][chainId]
    );
    const allPools = await factoryContract.methods.allPools().call();
  
    var file = { pools: [] };
    for (const pool in allPools) {
      const poolContract = new web3.eth.Contract(ISimswapPool["abi"], pool);
      const token0 = await poolContract.methods.token0.call();
      const token1 = await poolContract.methods.token1.call();
      const balance0 = await poolContract.methods.balance0.call();
      const balance1 = await poolContract.methods.balance1.call();
      file["pools"].push({
        pool: pool,
        token0: token0,
        token1: token1,
        balance0: balance0,
        balance1: balance1,
      });
    }
  
    fs.writeFile(`reserves_${chainId}.json`, JSON.stringify(file));
  
    var xhr = new XMLHttpRequest();
    xhr.setRequestHeader(
      "Authorization",
      "Basic " + `${env.ipfs_endpoint.id}:${env.ipfs_endpoint.secret}`
    );
    let formData = new FormData();
    formData.append("file", `reserves_${chainId}.json`);
    xht.send(formData);
    xhr.open("POST", "https://ipfs.infura.io:5001/api/v0/add");
    xhr.open(
      "POST",
      "https://ipfs.infura.io:5001/api/v0/pin/add?arg=QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn"
    );
  }
}

