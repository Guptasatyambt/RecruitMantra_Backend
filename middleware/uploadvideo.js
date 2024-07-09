const path =require('path');
const multer= require('multer');

// Set the storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const uid = req.body.uid;
      cb(null, file.fieldname + '-' +(uid)+'-'+ Date.now() + path.extname(file.originalname));
    }
  });
  
  // Initialize upload variable
  const uploadvideo = multer({
    storage: storage,
    limits: { fileSize: 100000000 }, // Limit file size to 100MB
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    }
  })
  
  // Check file type
  function checkFileType(file, cb) {
    const filetypes = /mp4|mkv|mov|avi/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Videos Only!');
    }
  }

  module.exports=uploadvideo
  