const express=require("express");
const userroute=require('./routes/userroute')
const feedbackroute=require('./routes/feedbackroute')
const interviewroute=require('./routes/interviewrout')
const bodyParser = require('body-parser');
const {ConnectionDB}=require('./connection');
const{validation}=require('./service/auth')

const app=express();
const port=4005;
ConnectionDB('mongodb+srv://satyamguptabt:CifR88CZjEtHNjbj@cluster0.okjrq95.mongodb.net/')


app.use(express.json());
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON' });
    } else {
      next();
    }
  });
  
app.use(express.urlencoded({extended:false}));
app.use('/resume',express.static('resume'))
app.use('/user',userroute);
app.use('/feedback',feedbackroute)
app.use('/interview',validation,interviewroute)
// app.use(cookieParser());


app.listen(port ,()=>{
    console.log(`server started at port ${port}`)
})
    