// require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
// require("./db");
const multer = require('multer')
const transaction = require('./model/transaction')
const cors = require('cors')
const bcrypt = require('bcrypt')
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const User = require('./model/registerModal')
const addUser =  require('./model/addUserModal')
const axios = require('axios')
app.use(express.json())
app.use(bodyParser.json());

app.use(cors()) 


 

mongoose.connect("mongodb://127.0.0.1:27017/Reactjs")
.then(()=>{console.log("Connect to dataBase")})
.catch((err)=>console.log("Not Connect dB",err))




// middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'abcd',
  resave: true,
  saveUninitialized: true
}));




// register
app.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);  
        const hashPass = await bcrypt.hash(req.body.password, salt);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashPass,
        });
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});


 
// login
app.post('/login', async(req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
     console.log(  req.body.name);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Wrong password" });
    }
    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// logout
app.get('/logout', (req, res) => {
  // Destroy the session to log the user out
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Redirect to the home page after logout
      res.redirect('/');
    }
  });
});

app.get('/', (req, res) => {
  const isLoggedIn = req.session.user ? true : false;
  res.render('home', { isLoggedIn });
});
 

//CRUD -create
app.post('/adduser',async (req,res)=>{

  let user = new addUser();
  user.designation = req.body.designation;
  user.name = req.body.name;
  user.walletaddress = req.body.walletaddress;
  const doc = await user.save();

  console.log(doc);
  res.json(doc);
})

//- Read
app.get('/getuser',async (req,res)=>{
  const docs = await addUser.find({})
  res.json(docs);
})




// Api file

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
  const createAndSaveTransaction = async () => {
    const Transaction = require('./model/transaction');
  
    
    const jsonData = {
      transactionHash: nft.transactionHash,
      createdAt: nft.createdAt,
      network: nft.network,
      state: nft.state,
      from: nft.from,
      to: nft.to,
    };
  
    const transaction = new Transaction(jsonData);
  
    try {
      await transaction.save();
      console.log('Data saved successfully');
    } catch (error) {
      console.error(error);
    }
  };
  
  createAndSaveTransaction();

  
  res.status(201).json({
    transactionHash:nft.transactionHash,
    cid:ipfsImgData.cid
})
})
  
//- Read
app.get('/getTransaction', async (req, res) => {
  const trans = await transaction.find({});
  res.json(trans);
});





const port = process.env.PORT || 5000
app.listen(port,()=>{
    console.log(`server running at ${port}`)
})  

