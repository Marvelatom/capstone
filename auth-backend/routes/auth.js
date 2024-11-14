const express = require('express');
const router = express.Router();
const { register, login, signout } = require('../controllers/authController'); // Ensure the path is correct

router.post('/register', register);
router.post('/login', login);
router.post('/signout', signout);
// Get user data by ID
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);  // Fetch user by ID from MongoDB
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });



const { deleteAccount } = require('../controllers/authController');
// DELETE route to handle account deletion
router.delete('/delete', deleteAccount);


const path = require('path');
const fs = require('fs');
const multer = require('multer');
// Define the directory for saving images
const folderPath = path.join('D:\\Capstone\\softaware\\IrisRecognition_ML\\CASIA1\\300');
// Ensure the directory exists
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}
// Function to get the next counter based on existing files in the folder
const getNextCounter = () => {
  const files = fs.readdirSync(folderPath);
  const fileNumbers = files
    .map(file => {
      const match = file.match(/^300_1_(\d+)\.jpg$/);
      return match ? parseInt(match[1]) : null;
    })
    .filter(num => num !== null);

  // If there are no matching files, start from 1
  if (fileNumbers.length === 0) {
    return 1;
  }

  // Get the highest number and increment it
  return Math.max(...fileNumbers) + 1;
};
// Create storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folderPath); // Set the folder where files will be saved
  },
  filename: (req, file, cb) => {
    const count = getNextCounter();
    const fileName = `300_1_${count}.jpg`; // Set filename to 300_1_n format
    cb(null, fileName);
  }
});
// Set up multer to handle single file uploads
const upload = multer({ storage: storage });
// Route for handling iris image uploads
router.post('/upload-iris', upload.single('irisImage'), (req, res) => {
  try {
    // Multer automatically saves the image to the specified folder
    res.status(200).json({ success: true, message: 'Image uploaded and saved.' });
  } catch (error) {
    console.error('Error uploading iris image:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});








module.exports = router;
