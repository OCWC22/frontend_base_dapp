import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";
import SignatureCanvas from "react-signature-canvas";

//different gateways to access ipfs 
const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  //Hooks to make selecting in redux easier
  const dispatch = useDispatch();
  //grab blockcahin state from redux state management 
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const elementRef = useRef();

  const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/";
  const name = "nft name";
  const description = "IPFS minted nfttttt";

  //2 in 1 function 1. create metadata 2. mint it  
  const createMetaDataAndMint = async (_name, _desc, _imgBuffer) => {
    try {
      const addedImage = await ipfsClient.add(_imgBuffer);
      //addedImage is an object so must get the .path of that object or err
      console.log(ipfsBaseUrl + addedImage.path);
    } catch (err) {
      console.log(err);
    }
  };

  const startMintingProcess = () => {
    //we can use getImageData because it is returning a buffer that we are passing in
    // as _imgBuffer
    createMetaDataAndMint(name, description, getImageData());
    getImageData();
  };

  const getImageData = () => {
    //get the current ref reference on the html page
    const canvasEl = elementRef.current;
    //paramteris type of data it wants to print out ex: image in format png
    let dataUrl = canvasEl.toDataURL("image/png");
    //IPFS requires a buffer before the upload
    const buffer = Buffer(dataUrl.split(",")[1], "base64");
    console.log(buffer);
    return buffer;
  };

  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
    //dependency smart contract on blockcahin redux effect and dispatch
  }, [blockchain.smartContract, dispatch]);

  return (
    //similar to the use effect if statement, but checking if acc is empty and if 
    //the state of the blockchain dopesnt have smart contract then its not connected
      <s.Screen>
      {blockchain.account === "" || blockchain.smartContract === null ? (
        //ai = aligned centers; jc = justified content
        <s.Container flex={1} ai={"center"} jc={"center"}>
          <s.TextTitle>Connect to the Blockchain</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault();
              //dispatch to the blockchainaction.js
              dispatch(connect());
            }}
          >
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== "" ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container flex={1} ai={"center"} style={{ padding: 24 }}>
          <s.TextTitle style={{ textAlign: "center" }}>
            Welcome mint your signature
          </s.TextTitle>
          <s.SpacerLarge/>
          <StyledButton
              onClick={(e) => {
                e.preventDefault();
                startMintingProcess();
                }}
          >        
            MINT
          </StyledButton>
          <s.SpacerLarge/>
          <SignatureCanvas
            backgroundColor={"blue"}
            canvasProps={{ width: 350, height: 350 }}
            ref={elementRef}
          />
        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
