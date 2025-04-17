const mongoose=require("mongoose");

const branchSchema = new mongoose.Schema({
    branchName: {
        type: String
    }
},{timestamps:true});

const BRANCH=mongoose.model('branch',branchSchema);

module.exports=BRANCH;