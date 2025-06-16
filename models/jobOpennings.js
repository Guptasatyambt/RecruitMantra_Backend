const mongoose=require("mongoose");

const openningsSchema=new mongoose.Schema({
    Title:{
        type:String,
        require:true,
        unique:true,
    },
    jd:{  
        type:String,
        require:true,
    },
    NoOfOpenning:{
        type:String,
        require:true,
    },
    ReleaseDate:{
        type:Date,
        require:true,
    },
    LasTDayofApplication:{
        type:Date,
        require:true,
    },
    Location:{
        type:String,
        require:true,
    },
    Mode:{
        type:String,
        require:true,
    },
    KeyResponcibility:{
        type:String,
        require:true,
    },
    Experience:{
        type:Number,
        require:true,
    },
    Package:{
        type:Number,
        require:true,
    },
    skills:[{
        type:String,
        require:true,
    }],
    
},{timestamps:true});

const OPENNING=mongoose.model('openning',openningsSchema);

module.exports=OPENNING;
