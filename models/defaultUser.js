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
    branchId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'branch'
    },
    year: {
        type: Number,
    },
    cgpa:{
        type: mongoose.Decimal128,
        required: false,
        default: 0,
    },
    resume: {
        type: String,
        required: true
    },
    verified:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const DEFAULTUSER=mongoose.model('defaultUser',defaultUserSchema);

module.exports = DEFAULTUSER;
