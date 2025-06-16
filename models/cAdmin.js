const mongoose=require("mongoose");

const cAdminSchema = new mongoose.Schema({
    cAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'college',
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    mobile:{
        type: String,
        required: true,
    },
    verified:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const CADMIN=mongoose.model('cAdmin',cAdminSchema);

module.exports=CADMIN;