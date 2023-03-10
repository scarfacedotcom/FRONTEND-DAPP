import React, { useEffect, useState } from "react";
import Connect from "./components/connect";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import TokenABI from "./token_abi.json";
import { ethers } from "ethers";

const tokenContract = {
  //address: "0x759B7B7De07289224a50113378ab5b8913E349e9",
  address: "0xa514495194b3295314b674ebcda114b04dd76739",
  abi: TokenABI,
};

function Token() {
  const { address } = useAccount();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState(null);

  const {
    data: balance,
    isError: errorBalance,
    isLoading: loadingBalance,
  } = useContractRead({
    ...tokenContract,
    // address: "0x759B7B7De07289224a50113378ab5b8913E349e9",
    // abi: TokenABI,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  const {
    data: tokenDetails,
    isError: errorTokenDetails,
    isLoading: loadingTokenDetails,
  } = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: "name",
      },
      {
        ...tokenContract,
        functionName: "decimals",
      },
      {
        ...tokenContract,
        functionName: "symbol",
      },
      { 
        ...tokenContract, 
        functionName: "totalSupply",
      },
      { 
        ...tokenContract, 
        functionName: "balanceOf", 
        args: [address ?? "0x0"] 
      },
      // { address: "0x5ceA53069455C3aA07ABf87692b5E9E4052d2850", abi: TokenABI,  functionName: "name", chainId: 80001}
    ],
  });

  const { config } = usePrepareContractWrite({
    ...tokenContract,
    functionName: "transfer",
    args: [
      recipientAddress
        ? recipientAddress
        : "0x0000000000000000000000000000000000000000",
      ethers.utils.parseEther(amount ? amount.toString() : "0"),
    ],
  });

  const {
    data: sendData,
    isLoading: sendLoading,
    isSuccess: sendSuccess,
    write,
  } = useContractWrite({
    mode: "recklesslyUnprepared",
    ...tokenContract,
    functionName: "transfer",
    args: [
      recipientAddress
        ? recipientAddress
        : "0x0000000000000000000000000000000000000000",
      ethers.utils.parseEther(amount ? amount.toString() : "0"),
    ],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    write?.();
  };

  const {
    data: sendWaitData,
    isError: errorWaitData,
    isLoading: loadingWaitData,
  } = useWaitForTransaction({
    hash: sendData?.hash,

    onSuccess(data) {
      console.log("SUCCESSFUL: ", data);
    },

    onError(error) {
      console.log("ERROR: ", error);
    },
  });

  if (sendWaitData) {
    console.log("This is our wait data: ", sendWaitData);
  }
  return (
    <div className="bg-image">
      <div className="flex items-center justify-between px-8 py-5 bg-blue-600">
        <div className="text-2xl font-semibold text-white">
          SCAR FACE TOKEN DAPP
        </div>
        <div>
          <Connect />
        </div>
      </div>

      <div className="flex items-center justify-between flex-col">
        {loadingTokenDetails ? (
          <div className="text-blue-400 mt-8 font-bold text-2xl">
            LOADING STATE
          </div>
        ) : (
          <div className="mt-8 bg-gradient-to-r from-blue-200 to-blue-600 rounded-lg p-6">
            <div className="mb-2">
              <span className="font-semibold text-white">ADDRESS:</span>
              {address ?? "0x0"}
            </div>

            <div className="mb-2">
              <span className="font-semibold text-white">BALANCE:</span>
              {String(balance) / 10 ** tokenDetails[1] ?? "0"} {tokenDetails[2]}
            </div>

            <div className="mb-2">
              <span className="font-semibold text-white">NAME:</span>
              {tokenDetails[0] ?? "TOKEN NAME"}
            </div>

            <div className="">
              <span className="font-semibold text-white">TOTAL SUPPLY:</span>
              {tokenDetails[3] / 10 ** tokenDetails[1] ?? "0"}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-10 p-8 rounded-2xl bg-blue-700 max-w-[630px] w-full shadow-lg"
        >
          <div className="text-center font-bold text-3xl text-blue-400 mb-8">
            TRANSFER TOKEN
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-lg text-blue-400">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x0"
              // value={recipientAddress}
              name={"recipientAddress"}
              className="w-full p-3 rounded-lg shadow-lg ring-1 ring-blue-400"
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          <div className="mb-8">
            <label className="block mb-1 text-lg text-blue-400">Amount</label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-3 rounded-lg shadow-lg ring-1 ring-blue-400"
              // value={amount}
              name={"amount"}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            className={`${
              !amount || !recipientAddress
                ? "cursor-not-allowed bg-gray-500"
                : "cursor-pointer bg-blue-400 hover:bg-blue-500"
            } text-white px-10 py-4 w-full rounded-lg`}
            disabled={!amount || !recipientAddress}
            type="submit"
          >
            {sendLoading || loadingWaitData ? "LOADING...." : "SEND"}
          </button>
        </form>
      </div>

      {/* TOTAL SUPPLY: {tokenDetails[3]} */}
    </div>
  );
}

export default Token;
