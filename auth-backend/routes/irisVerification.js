// irisVerification.js
const { exec } = require('child_process');

const verifyIris = (filename, callback) => {
  const pythonScriptPath = 'D:/Capstone/softaware/IrisRecognition_ML/src/verifyDB_casia1.py';
  const templateDir = './templates/CASIA1/';
  
  // Build the Python command
  const command = `python "${pythonScriptPath}" --template_dir "${templateDir}" --mode verify --filename "${filename}"`;

  // Execute the Python script
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return callback({ success: false, message: 'Error running verification', error: error.message });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return callback({ success: false, message: 'Error in verification process', stderr });
    }

    console.log(`stdout: ${stdout}`);
    callback({ success: true, message: 'Verification successful', result: stdout });
  });
};

module.exports = { verifyIris };
