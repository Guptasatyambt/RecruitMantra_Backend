const InterView = require('../models/interview');
const User = require('../models/usermodel');
const {getobjecturl,putObject}=require('../middleware/aws')


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
    const interview=await InterView.create({
        email:email,
        level:level,
        video:"",
        result:0,
        confidence:0,
        accuracy:0
    })
    
    const updateduser= await User.findByIdAndUpdate(user._id,
         {$set:{
         coins:coin,
     }}
     ,{new:true})
     return res.status(200).json({message:"Success",data:{id:interview._id}})
    
}
else{
return res.status(201).json({message:"Insufficient Balance"})
}
}
catch(e){
return res.status(500).json({ message: "Internal Server Error", error: e.message });
}
}


async function handlestop(req, res) {
    try {
        const email = req.user.email;
        const { interview_id, result, confidence, accuracy, complete } = req.body;

        // Validate required fields
        if (result == null || confidence == null || accuracy == null || complete == null) {
            return res.status(400).json("All fields are compulsory");
        }
        const updatedinterview = await InterView.findByIdAndUpdate(
            interview_id,
            {
                $set: {
                    result: result,
                    confidence: confidence,
                    accuracy:accuracy
                }
            },
            { new: true }
        );
        // Fetch the interview by its ID
        const interview = await InterView.findById(interview_id);
        
        // Check if interview exists
        

        const level = interview.level;

        // Fetch user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let coin = user.coins;

        // Calculate reward if interview is complete
        if (complete == "1" || complete === 1) {
            let reward = 0;
            if (level === 'beginner') {
                reward = 10 + result;
            } else if (level === 'intermediate') {
                reward = 15 + result * 2;
            } else if (level === 'advance') {
                reward = 25 + result * 5;
            }
            coin += reward;
        }

        // Update user's interview list
        let user_interview = user.interview;
        user_interview.push({ interview_id: interview_id, result: result });

        // Update the user in the database
        const updateduser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    coins: coin,
                    interview: user_interview
                }
            },
            { new: true }
        );

        return res.status(200).json({ message: "Success", data: { updatedinterview } });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


async function videoupload(req,res){
    try{
    const {interview_id} = req.body;
    const key = `VID-${interview_id}-${Date.now()}.mp4`;
    console.log(`uploads/user-uploads/${key}`)
    console.log(key)
    const interview= await InterView.findByIdAndUpdate(interview_id,
        {$set:{
        video:`uploads/user-uploads/${key}`
    }}
    ,{new:true})
   
    const url=await putObject(key,"video/mp4")
    res.status(200).json({message:"success",key:url})
  
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function getVideoUrl(req,res){
    try{
    const key = req.query.key;
    const video_url=await getobjecturl(key)
    res.status(200).json({message:"success",url:video_url})
  
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function ackServer(req,res){
    try{
    
    res.status(200).json({message:"success",url:video_url})
  
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}




async function getinfo(req, res) {      
    try{
        const interview_id = req.query.interview_id;
        console.log(interview_id)
        const interview=await InterView.findById(interview_id)
        const video_url=await getobjecturl(interview.video);
        console.log(interview)
        res.status(200).json({message:"success",Interview:interview,url:video_url})
      
        }
        catch(e){
            return res.status(500).json({ message: "Internal Server Error", error: e.message });
        }
}




module.exports = {handlestart,handlestop, getinfo,videoupload,getVideoUrl,ackServer};
