// satyamguptabt
// CifR88CZjEtHNjbj


const MongoClient = require('mongodb').MongoClient;
const mongoose=require("mongoose");

const ConnectionDB=async(Url)=>{
try{
const connect=await mongoose.connect(Url)
console.log("Database connected",
connect.connection.host,
connect.connection.name
)
}catch(err){
    console.log(err)
    process.exit(1)
}
}
module.exports={ConnectionDB,};