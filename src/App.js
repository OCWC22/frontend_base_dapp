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

  //Need to have loading screen for UI when the click mint and the time it takes 
  //for the minting to coem back 
  //so use a react use state hook
  //https://www.reddit.com/r/reactjs/comments/p9o49g/can_someone_explain_what_setloading_does_and_why/
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [NFTS, setNFTs] = useState([]);


  const elementRef = useRef();

  const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/";
  const name = "nft name";
  const description = "IPFS minted nfttttt";

  console.log(NFTS);

  //needs to connec tto the smart contract, already connecetd via the redux/blockcahinreducer
  //smart contract is set to null from the reducer
  const mint = (_uri) => {

    blockchain.smartContract.methods
      //calling tghe mint() from smartcontracts.sol
      .mint(blockchain.account, _uri)
      //need to specify where its from + shoudl also add value ex eth,matic or else 
      //anyone can mint 
      .send({ from: blockchain.account })
      .once("error", (err) => {
        console.log(err);
        setLoading(false);
        setStatus("Succesfully Error your NFT");
        //receeipt when successfully minted

      }).then((receipt) => {
        console.log(receipt);
        setLoading(false);
        clearCanvas();
        //live updates the UI of the just minted NFT
        dispatch(fetchData(blockchain.account));
        setStatus("Succesfully minted your NFT");
      })
  };

  //2 in 1 function 1. create metadata 2. mint it  
  const createMetaDataAndMint = async (_name, _desc, _imgBuffer) => {
    //have set loading to reflect back to ui
    setLoading(true);
    //have set loading to reflect back to ui
    setStatus("Uploading to IPFS");
    try {
      const addedImage = await ipfsClient.add(_imgBuffer);
      //addedImage is an object so must get the .path of that object or err

      const metaDataobj = {
        name: _name,
        description: _desc,
        image: ipfsBaseUrl + addedImage.path,
      };

      //add metaDataobj to ipfs again  and now we have to store the metadata 
      const addedMetaData = await ipfsClient.add(JSON.stringify(metaDataobj));
      //will print the metadata visible on the ipfs of the NFT
      console.log(ipfsBaseUrl + addedMetaData.path);
      //mint metadata from the uri  
      mint(ipfsBaseUrl + addedMetaData.path);
    } catch (err) {
      console.log(err);
      //set to false to alert the user
      setLoading(false);
      setStatus("Error");
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
    //console.log(buffer);
    return buffer;
  };

  //doesnt take anythign but sets NFT token arrya to empty
  //everytime it loads it empties out when loaded
  const fetchMetaDataForNFTS = () => {
    setNFTs([]);
    data.allTokens.forEach((nft) => {
      //nft returns uri because in smartcontract.sol from RenderTokem
      fetch(nft.uri)
        //need to use json() otherwise error if just use json
        .then((response) => response.json())
        //we want to append to setNFTS[]
        .then((metaData) => {
          //use previous state for best practice and return an array
          setNFTs((prevState) => [
            //print previosu state and append id element and metadata
            ...prevState,
            { id: nft.id, metaData: metaData },
          ]);
        }).catch((err) => {
          console.log(err);
        });

    });
  };

  const clearCanvas = () => {
    const canvasEl = elementRef.current;
    //SignatureCnvas library API function has clear function
    canvasEl.clear();
  }
  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
    //dependency smart contract on blockcahin redux effect and dispatch
  }, [blockchain.smartContract, dispatch]);

  useEffect(() => {
    fetchMetaDataForNFTS();
  }, [data.allTokens]);

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

          {loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                loading....
              </s.TextDescription >
            </>
          ) : null};
          {status !== "" ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                {status}
              </s.TextDescription >
            </>
          ) : null};


          <s.Container fd={"row"}
            jc={"center"}
            style={({ backgroundColor: "pink" })}>
            <s.SpacerLarge />
            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                startMintingProcess();
              }}
            >
              MINT
            </StyledButton>
            <s.SpacerSmall />
            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                clearCanvas();
              }}
            >
              CLEAR
            </StyledButton>
          </s.Container>
          <s.SpacerLarge />
          <SignatureCanvas
            backgroundColor={"blue"}
            canvasProps={{ width: 350, height: 350 }}
            ref={elementRef}
          />
          <s.SpacerLarge />
          {data.loading ? <>
            <s.SpacerSmall />
            <s.TextDescription style={{ textAlign: "center" }}>
              loading....
            </s.TextDescription >
          </> :
            NFTS.map((nft, index) => {
              return (
                <s.Container key={index} style={{ padding: 16 }}>
                  <s.TextTitle>{nft.metaData.name}</s.TextTitle>

                  <img
                    alt={nft.metaData.name}
                    src={nft.metaData.image}
                    width={150} />

                </s.Container>
              );
            })}
        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
