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
        "x-api-key": "sk_live_af528fa3-42a9-4d97-a153-c6e18b820540",
    },
  })

  app.post('/upload',cors(),upload.single('file'),async(req,res)=>{
   
    let data = new FormData();
    const blob = new Blob([req.file.buffer],{type:req.file.mimetype});
    data.append("file",blob,{filename:req.file.originalnam})
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
    const SMART_CONTRACT_ADDRESS="0x80b10fCfF4a99CdB96251dE1436707B5afeCe048"
    //
    const WALLET_IMPORTED_ON_STARTON="0xe48b5EB0f00cdf9E897FFf71Cf286F2Fc4882691";
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
    const RECEIVER_ADDRESS = "0x90a484da305fC6890D5D9f4258B5C959742Ca6bF"
    const ipfsImgData = await uploadImageOnIpfs();
    const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
    const nft = await mintNFT(RECEIVER_ADDRESS,ipfsMetadata.cid)
    console.log(nft)
    res.status(201).json({
        transactionHash:nft.transactionHash,
        cid:ipfsImgData.cid
    })
  })
  app.listen(port,()=>{
    console.log('Server is running on port '+ port);
  })



//"x-api-key": "sk_live_51f7e32a-8ef6-409a-b6f5-07da5d565611"