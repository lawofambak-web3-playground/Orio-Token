import { React, useState } from "react";
import { ethers } from "ethers";
import OrioToken from "./OrioToken.json";
import OrioTokenSale from "./OrioTokenSale.json";

function App() {
  const [account, setAccount] = useState([]);
  const [data, setData] = useState("");

  // Deployed contract addresses
  const tokenAddress = "0xAbf10038184376Ec49A5DBF47f5cB618896FDfEB";
  const tokenSaleAddress = "0xDB2b16D0e8b29966A326dB3E9f909bB4005D467f";

  // Connect MetaMask account
  const connectAccount = async () => {
    try {
      if (window.ethereum) {
        const account = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(account);
      } else {
        window.alert("Need MetaMask installed to buy tokens.")
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Set input data
  const getData = (val) => {
    setData(val.target.value);
  };

  // Buy ORIO tokens
  const buyToken = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      // Checks if user is connected to Rinkeby network
      if (networkName === "rinkeby") {
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(tokenAddress, OrioToken.abi, signer);
        const tokenSaleContract = new ethers.Contract(tokenSaleAddress, OrioTokenSale.abi, signer);

        // Allowing user to buy tokens from the token sale contract
        const buyTokenTxn = await tokenSaleContract.buyTokens({ value: ethers.utils.parseEther(data) });
        console.log("Transaction pending...", buyTokenTxn);
        await buyTokenTxn.wait();
        console.log("Transaction succeeded!");
        const signerAddress = await signer.getAddress();
        const accountBalance = await tokenContract.balanceOf(signerAddress);
        console.log("Orio Token balance: ", parseFloat(accountBalance) / 10 ** 18);

        // Clearing state for input data after transaction
        setData("");
      } else {
        window.alert("Please connect to Rinkeby");
      }
    } catch (error) {
      setData("");
      window.alert(error.message);
    }
  };

  return (
    <div className="App">
      <header className="Header">
        ⚫Orio🍪Token⚪
      </header>
      <p className="PriceInfo">1 ORIO = 0.01 ETH</p>
      {account.length ? (<div>
        <input className="Input" type="text" placeholder="Amount of ETH" onChange={getData} />
        <button className="Button" onClick={buyToken}>Buy ORIO</button>
      </div>) : (<button className="Button" onClick={connectAccount}>Connect Wallet</button>)}
      <footer className="Footer">Need MetaMask installed to buy tokens / Rinkeby</footer>
    </div>
  );
}

export default App;
