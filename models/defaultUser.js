const mongoose=require("mongoose");

const defaultUserSchema = new mongoose.Schema({
    defaultUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    coins: {
        type: Number,
        default: 100
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    resume: {
        type: String,
        required: true
    }
},{timestamps:true});

const DEFAULTUSER=mongoose.model('defaultUser',defaultUserSchema);

module.exports=DEFAULTUSER;