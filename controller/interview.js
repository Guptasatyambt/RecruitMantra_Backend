const InterView = require('../models/interview');
const User = require('../models/usermodel');

async function handlestop(req, res) {
    try{
    const email = req.user.email;
    const {level,result,confidence,accuracy,eye,neck,complete}=req.body
    if(!level||!result||!confidence||!accuracy||!complete){
        return res.status(400).json("All field are compulsory");
    }
    const interview = await InterView.create({
        email: email,
        level: level,
        result:result,
        confidence:confidence,
        accuracy:accuracy,
        eye:eye,
        neck:neck, 
    });

    const user = await User.findOne({ email });
    var coin=user.coins;
    if(complete==1){
    var reward=0
        if(level=='beginner'){
           reward=10+result
        }
        if(level=='intermidiate'){
            reward=15+result*2
        }
        if(level=='advance'){
            reward=25+result*5
        }
        coin=coin+reward
    }
    var user_interview=user.interview;
    user_interview.push(interview.id);
    const updateduser= await User.findByIdAndUpdate(user._id,
                     {$set:{
                     coins:coin,
                     interview:user_interview
                 }}
                 ,{new:true})
                
    return res.status(200).json({message:"Success",data:{interview}})
}
catch(e){
    return res.status(500).json({ message: "Internal Server Error", error: e.message });
}
}

async function getinfo(req, res) {      
    try{
        const id=req.body;
        const interview=await InterView.findById(id)
        return res.status(200).json({interview});
    }catch(e){
         res.status(500).json({ message: "Internal Server Error", error: e.message })
    }
}




module.exports = {handlestop, getinfo};
