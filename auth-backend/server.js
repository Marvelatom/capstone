// server.js or app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Ensure the path is correct
const pythonScriptRouter = require('./routes/pythonScriptRouter');
const { verifyIris } = require('./routes/irisVerification'); 
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', pythonScriptRouter);
mongoose.connect('mongodb://localhost:27017/hello', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post('/api/verify-iris', (req, res) => {
  const { filename } = req.body;  // Get the filename from the request

  // Call the verifyIris function
  verifyIris(filename, (result) => {
    if (result.success) {
      // If verification is successful
      res.status(200).json(result);
    } else {
      // If verification failed
      res.status(500).json(result);
    }
  });
});



const imageUploadRouter = require('./routes/imageUpload'); // Adjust the path as necessary


// Use the image upload router
app.use('/api', imageUploadRouter);






