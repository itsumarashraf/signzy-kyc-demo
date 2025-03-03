const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const app = express();
const PORT = 3000;
const cors = require('cors');

// Use JSON middleware to parse JSON request body
app.use(express.json());
app.use(cors());

// Replace with your actual API key from Signzy
const API_KEY = '0sLWtGb8INTFNGHzhgFmvDhSkpT1lCWP';  // Add your Signzy API key here

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: 'deqs21yrs', 
  api_key: '619945378769143', 
  api_secret: '2WMAdRnrw7dApNCRzzb2cGEDCUs' // Click 'View API Keys' above to copy your API secret
});

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// POST endpoint to handle Aadhaar extraction
app.post('/aadhaar/extraction', upload.fields([
  { name: 'frontDocument', maxCount: 1 },
  { name: 'backDocument', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), async (req, res) => {
  try {
    // Log received form data and files
    console.log(req.body); // Non-file fields like 'kycType'
    console.log(req.files); // Uploaded files (frontDocument, backDocument, selfie)

    // Initialize an array to hold the image URLs
    const imageUrls = [];

    // Function to upload images to Cloudinary
    const uploadToCloudinary = async (fileBuffer) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              reject('Cloudinary Upload Error:', error);
            } else {
              resolve(result.secure_url);
            }
          }
        ).end(fileBuffer);
      });
    };

    // Upload front and back documents (if present)
    if (req.files.frontDocument) {
      const frontDocUrl = await uploadToCloudinary(req.files.frontDocument[0].buffer);
      imageUrls.push(frontDocUrl);
    }
    if (req.files.backDocument) {
      const backDocUrl = await uploadToCloudinary(req.files.backDocument[0].buffer);
      imageUrls.push(backDocUrl);
    }

    // Upload selfie (if present)
    if (req.files.selfie) {
      const selfieUrl = await uploadToCloudinary(req.files.selfie[0].buffer);
      imageUrls.push(selfieUrl);
    }

    // After all files are uploaded to Cloudinary, send the URLs to Signzy API
    const formData = {
      files: imageUrls, // Send the URLs of the uploaded images
      mask: true, // Your Signzy-specific parameters (adjust as needed)
    };

    // Make a POST request to the Signzy API
    const response = await axios.post('https://api-preproduction.signzy.app/api/v3/aadhaar/extraction', formData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,  // Add your Signzy API key here
      },
    });

    // Send the response back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error making request to Signzy:', error);
    res.status(500).json({ error: 'Failed to process Aadhaar extraction' });
  }
});


app.post('/facematch', upload.fields([
  { name: 'selfie', maxCount: 1 }
]), async (req, res) => {
  try {
    // Log received form data and files
    console.log('body',req.body); // Non-file fields like 'kycType'
    console.log('files',req.files); // Uploaded files (frontDocument, backDocument, selfie)

    // Initialize an array to hold the image URLs
    const imageUrls = [];

    // Function to upload images to Cloudinary
    const uploadToCloudinary = async (fileBuffer) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              reject('Cloudinary Upload Error:', error);
            } else {
              resolve(result.secure_url);
            }
          }
        ).end(fileBuffer);
      });
    };


    // Upload selfie (if present)
    if (req.files.selfie) {
      const selfieUrl = await uploadToCloudinary(req.files.selfie[0].buffer);
      imageUrls.push(selfieUrl);
    }

    // After all files are uploaded to Cloudinary, send the URLs to Signzy API
    const formData = {
      files: imageUrls[0], // Send the URLs of the uploaded images
      firstImage: imageUrls[0],
      secondImage: req.body.adhaarFrontImageLink,
      threshold: '0.95',
    };

    // Make a POST request to the Signzy API
    const response = await axios.post('https://api-preproduction.signzy.app/api/v3/face/match', formData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,  // Add your Signzy API key here
      },
    });

    // Send the response back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error making request to Signzy:', error);
    res.status(500).json({ error: 'Failed to process facematch' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
