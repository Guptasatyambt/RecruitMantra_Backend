const {setuser}=require('../service/auth')
const User=require('../models/usermodel');
const bycrpt=require('bcrypt');
const { set } = require('mongoose');




async function handleregister(req,res){
    const{email,password} =req.body
    if(!email||!password){
        return res.status(400).json("All field are compulsory");
    }
    const allReadyExist=await User.findOne({email})
    if(allReadyExist){
        return res.status(400).json("User Exist")
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
    })
    const token=setuser(user);
    return res.status(200).json({token});  
    }
     
    async function handledetails(req,res){
        const {name,college,branch,year,specialization,interest,resume,profileimage}=req.body

        if(!name||!college||!branch||!year||!specialization||!interest||!resume||!profileimage){
            return res.status(400).json("All field are compulsory");
        }
        const user=req.user;
    const email=user.email;
    const password=user.password;
    console.log(password)
   const updateduser= await User.findByIdAndUpdate(user._id,
        {$set:{
        name:name,
        email:email,
        password:password,
        resume:resume,
        profileimage:profileimage,
        college:college,
        branch:branch,
        year:year,
        specialization:specialization,
        interest:interest,
    }}
    ,{new:true})
    res.status(200).json(updateduser)
    }

    async function handlelogin(req,res){
        const {email,password}=req.body;
        if(!email ||!password){
            res.status(400)
            throw new Error("enter details correctly")
        }
    
        const user=await User.findOne({email})
        if(!user){
            res.status(404)
            throw new Error("User not exist! please sign In")
        }
        if(user&& (await bcrypt.compare(password,user.password))){
            const token=setuser(user)
            res.status(200).json({accesswebtoken})
        }
        else{
            res.status(400).json({message:"Incorrect password"})
        }
    }

    async function getinfo(req,res){
        
        try{
            const user=req.user;
            return res.status(200).json(user);
        }catch(e){
             res.status(401).json({message:"sorry"})
        }
    }
    module.exports={handleregister,handledetails ,handlelogin,getinfo};