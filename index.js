const express=require("express");
require("dotenv").config();
const userroute=require('./routes/userroute')
const feedbackroute=require('./routes/feedbackroute')
const admin = require('firebase-admin');
const interviewroute=require('./routes/interviewrout')
const bodyParser = require('body-parser');
const {ConnectionDB}=require('./connection');
const{validation}=require('./service/auth')
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const app=express();
const port=process.env.PORT;
ConnectionDB(process.env.MONGO_URL)


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
    