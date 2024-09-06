const {setuser}=require('../service/auth')
const User=require('../models/usermodel');
const bycrpt=require('bcrypt');
const fs=require('fs')
const isEmailValid=require('../middleware/email_validate');
const { profile } = require('console');
const {getobjecturl,putObject}=require('../middleware/aws')




async function handleregister(req,res){
    try{
    const{email,password} =req.body
    if(!email||!password){
        return res.status(404).json({message:"All field are compulsory"});
    }
   
    const allReadyExist=await User.findOne({email})
    if(allReadyExist){
        return res.status(403).json({message:"User already Exist"})
    }
    const bycrptpassword=await bycrpt.hash(password,10)
    const user=await User.create({
        name:"",
        email:email,
        password:bycrptpassword,
        resume:"",
        profileimage:"",
        college:"",
        branch:"",
        year:"",
        specialization:"",
        interest:"",
        interview:[],
    })
   
    const token=setuser(user);
    return res.status(200).json({message:"Success",data:{token,id:user.id,name:""}});
}
catch(e){
    return res.status(500).json({ message: "Internal Server Error", error: e.message });
}
    }
     
    async function handledetails(req,res){
        const {name,college,branch,year,specialization,interest}=req.body
        if(!name||!college||!branch||!year||!specialization||!interest&&req.file){
            return res.status(400).json("All field are compulsory");
        }
        try{
        const user=req.user;
    const email=user.email;
    const password=user.password;
   const updateduser= await User.findByIdAndUpdate(user._id,
        {$set:{
        name:name,
        email:email,
        password:password,
        resume:req.files['resume'][0].path.replace(/\\/g, '/') ,
        profileimage:req.files['profileimage'][0].path.replace(/\\/g, '/') ,
        college:college,
        branch:branch,
        year:year,
        specialization:specialization,
        interest:interest,
        interview:[],
    }}
    ,{new:true})
    return res.status(200).json({message:"Success",data:{email:email,profile:updateduser.profileimage,resume:updateduser.resume}});
}
catch(e){
    return res.status(500).json({ message: "Internal Server Error", error: e.message });
}
    }

    async function handlelogin(req,res){
        const {email,password}=req.body;
        if(!email ||!password){
            res.status(400).json({message:"enter details correctly"})
            // throw new Error("enter details correctly")
        }
        try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not exist! please sign In"})
            // throw new Error("User not exist! please sign In")
        }
        if(user&& (await bycrpt.compare(password,user.password))){
            const token=setuser(user);
            return res.status(200).json({message:"Success",data:{token,id:user.id,name:user.name}});
        }
        else{
            return res.status(400).json({message:"Incorrect password"})
        }
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
    }

    async function getinfo(req,res){
        
        try{
            const email=req.user.email;
            const user=await User.findOne({email})
            return res.status(200).json(user);
        }
        catch(e){
            return res.status(500).json({ message: "Internal Server Error", error: e.message });
        }
    }

    async function handlestart(req,res){
        try{
        const email=req.user.email;
        const user=await User.findOne({email})
        const level=req.query.level
        let coin=user.coins;
        let fee=50
        if(level=='beginner'){
            fee=10  
        }
        if(level=='intermidiate'){
            fee=15
        }
        if(level=='advance'){
            fee=25
        }
    
    if(coin>=fee){
        coin=coin-fee;
        const updateduser= await User.findByIdAndUpdate(user._id,
             {$set:{
             coins:coin,
         }}
         ,{new:true})
         return res.status(200).json({message:"Success",data:{coins:coin}})
        
    }
    else{
    return res.status(201).json({message:"Insufficient Balance"})
    }
}
catch(e){
    return res.status(500).json({ message: "Internal Server Error", error: e.message });
}
    }
    
    async function givecoins(req,res){
        const email=req.user.email;
        const user=await User.findOne({email})
        var coins=user.coins
        coins+=100
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            coins:coins,
        }}
        ,{new:true})
        return res.status(200).json(updateduser)
    }

    

    //  function deleteFile(filePath) {
    //     setTimeout(() => {
    //       fs.unlink(filePath, (err) => {
    //         if (err) {
    //           console.error(`Internal error Failed to delete file: ${filePath}`, err);
    //         } 
    //       });
    //     },   10*60*1000); // 10 minutes
    //   }

      async function handleimage(req,res) {
        try{
            const user=req.user;
            // const img=await getobjecturl("133507648727420508.jpg")
            const url=await putObject(`image-${Date.now()}.jpeg`,"image/jpeg")
            console.log(url);
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            profileimage:req.file.path.replace(/\\/g, '/') ,
        }}
        ,{new:true})
        console.log(req.file.path.replace(/\\/g, '/') )
        return res.status(200).json({message:"Success",data:{profile:updateduser.profileimage}});
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
      }

      async function updateresume(req,res) {
        try{
            const user=req.user;
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            resume:req.file.path.replace(/\\/g, '/') ,
        }}
        ,{new:true})
        console.log(req.file.path.replace(/\\/g, '/') )
        return res.status(200).json({message:"Success",data:{resume:updateduser.resume}});
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
      }

      async function updateyear(req,res) {
        const {year}=req.body
        console.log(year)
        try{
            
            const user=req.user;
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            year:year ,
        }}
        ,{new:true})
        return res.status(200).json({message:"Success",data:{year:updateduser.year}});
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
      }

    
    module.exports={handleregister,handledetails ,handlelogin,getinfo,handlestart,givecoins,handleimage,updateyear,updateresume};