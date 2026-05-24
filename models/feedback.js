const mongoose=require("mongoose");

const feedbackSchema=new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
      },
      email:{
        type:String
      },
    feedback:{
        type:String,
        require:true,
    },
   
},{timestamps:true});

const FEEDBACK=mongoose.model('feedback',feedbackSchema);

module.exports=FEEDBACK;