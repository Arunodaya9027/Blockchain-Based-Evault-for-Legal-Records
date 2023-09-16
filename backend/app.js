const express = require('express')
const mongoose = require('mongoose')
// require('dotenv').config()
const cors = require('cors')
const bcrypt = require('bcrypt')
const session = require('express-session');
const app = express();
const User = require('./model/registerModal')
const addUser =  require('./model/addUserModal')

app.use(express.json())
app.use(cors()) 

// process.env.PORT
mongoose.connect('mongodb://127.0.0.1:27017/Reactjs')
.then(()=>{console.log("Connect to dataBase")})
.catch(()=>console.log("Not Connect dB"))

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



const port = 8080 
app.listen(port,()=>{
    console.log(`server running at ${port}`)
})