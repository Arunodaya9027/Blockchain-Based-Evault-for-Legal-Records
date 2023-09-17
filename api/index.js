const Transaction = require('./modal/transaction');
const express = require('express')
const multer = require('multer')
const cors = require('cors');
const axios = require('axios')
const app = express()
const port=process.env.PORT || 5000

app.use(express.json())

const upload = multer({
    limits:{
        fileSize:100000000000000
    }
})

const starton = axios.create({
    baseURL: "https://api.starton.io/v3",
    headers: {
        "x-api-key": "sk_live_7e3b15b6-f5b9-42e4-943f-c29bbb48b0e9",
    },
  })

  app.post('/upload',cors(),upload.single('file'),async(req,res)=>{
   
    let data = new FormData();
    const blob = new Blob([req.file.buffer],{type:req.file.mimetype});
    data.append("file",blob,{filename:req.file.originalname})
    data.append("isSync","true");

    async function uploadImageOnIpfs(){
        const ipfsImg = await starton.post("/ipfs/file", data, {
            headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}` },
          })
          return ipfsImg.data;
    }
    async function uploadMetadataOnIpfs(imgCid){
        const metadataJson = {
            name: `A Wonderful NFT`,
            description: `Probably the most awesome NFT ever created !`,
            image: `ipfs://ipfs/${imgCid}`,
        }
        const ipfsMetadata = await starton.post("/ipfs/json", {
            name: "My NFT metadata Json",
            content: metadataJson,
            isSync: true,
        })
        return ipfsMetadata.data;
    }
    
    const SMART_CONTRACT_NETWORK="polygon-mumbai"
    const SMART_CONTRACT_ADDRESS="0x4528b87321AF8919550E54a6aF96C8D032B66d43"
    //
    const WALLET_IMPORTED_ON_STARTON="0x5Bb267e2f180ACdA8F7648E2eB61B92Ceebc957c";
    //0xa46E0a2e9BfBA42b5DD93489eB43A3dCE2F76951
    async function mintNFT(receiverAddress,metadataCid){
        const nft = await starton.post(`/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`, {
            functionName: "mint",
            signerWallet: WALLET_IMPORTED_ON_STARTON,
            speed: "low",
            params: [receiverAddress, metadataCid],
        })
        return nft.data;
    }
    const RECEIVER_ADDRESS = "0x7aFf35d9972F8300464dA5ded10BFca9C2bBE15c"
    const ipfsImgData = await uploadImageOnIpfs();
    const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
    const nft = await mintNFT(RECEIVER_ADDRESS,ipfsMetadata.cid)

    
    console.log("Atharv")
    // console.log(nft)

    const jsonData = {
        transactionHash:nft.transactionHash,
        createdAt:nft.createdAt,
        network:nft.network,
        state:nft.state,
        from:nft.from,
        to:nft.to,
       
    };
    
    const transaction = new Transaction(jsonData);
    
    transaction.save((err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Data saved successfully');
      }
    });
    

    res.status(201).json({
        transactionHash:nft.transactionHash,
        cid:ipfsImgData.cid
    })
  })
  app.listen(port,()=>{
    console.log('Server is running on port '+ port);
  })



//"x-api-key": "sk_live_51f7e32a-8ef6-409a-b6f5-07da5d565611"