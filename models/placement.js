const mongoose=require("mongoose");

const placementSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        required: true,
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'college',
        required: true,
    }
},{timestamps:true});

const PLACEMENT=mongoose.model('placement',placementSchema);

module.exports=PLACEMENT;