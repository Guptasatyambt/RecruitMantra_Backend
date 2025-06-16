const mongoose=require("mongoose");

const adminSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
},{timestamps:true});

const ADMIN=mongoose.model('admin',adminSchema);

module.exports=ADMIN;