const path =require('path');
const multer= require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'resume/')
    },
    filename: function (req, file, cb) {
      var ext=path.extname(file.originalname)
      cb(null, `${req.user._id}`+Date.now()+`${ext}`)

    }
  })

   
  
  const upload = multer({ storage })

  module.exports=upload