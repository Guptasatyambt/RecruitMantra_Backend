const jwt=require("jsonwebtoken")
const secret="$@tyam12345";
const asyncHandler=require('express-async-handler')
function setuser(user) {
   return jwt.sign({
    _id:user._id,
    email:user.email,
   },secret)
}

function getUser(token) {
    if(!token) return null;
    try {
    return jwt.verify(token,secret);
    } catch (error) {
        return null;
    }
    
  }



  const validation=asyncHandler(async(req,res,next)=>{
    let token;
    let authheader=req.headers.Authorization || req.headers.authorization
    if(authheader &&authheader.startsWith("Bearer")){
        token=authheader.split(" ")[1];
        if(!token){
            res.status(401);
            throw new Error("Anuthrised User");
        }
        jwt.verify(token,secret,(err,decode)=>{
            if(err){
                res.status(401)
                throw new Error("Anauthrised user")
            }
            req.user=decode;
            next();
    
        })
        
    }
    // res.status(400).json("Invalid token");
    });

module.exports={
    setuser,getUser,validation
}