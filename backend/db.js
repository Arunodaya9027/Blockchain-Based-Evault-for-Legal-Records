const mongoose = require("mongoose");
const uri = 'mongodb+srv://deepakkumar13204:Deepak32561@cluster0.ueaos86.mongodb.net/?retryWrites=true&w=majority';


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('Connected to MongoDB');
      // Add your code here to perform operations on the database
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));
