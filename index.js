const express=require("express");
require("dotenv").config();
const path = require('path');
const userroute = require('./routes/userroute')
const feedbackroute = require('./routes/feedbackroute')
const interviewroute = require('./routes/interviewrout')
const hrinterviewroutes=require('./routes/hrInterview')
const seriesroutes=require('./routes/series')
const companyroute = require('./routes/companyroutes')
const jobOpenning=require('./routes/jobOpennings');
const studentroute = require('./routes/studentroutes')
const collegeroute = require('./routes/collegeroutes')
const collegeadminroute = require('./routes/collegeadminroutes')
const adminroute = require('./routes/adminroutes')
const applicantroute = require('./routes/careersroutes')
const bodyParser = require('body-parser');
const {ConnectionDB}=require('./connection');
const{validation}=require('./service/auth')

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/resume', express.static('resume'))

app.use('/user', userroute);
app.use('/feedback', feedbackroute)
app.use('/carrer', applicantroute);
app.use('/job',jobOpenning);

app.use('/interview', interviewroute)
app.use('/hrInterview',hrinterviewroutes)
app.use('/series',seriesroutes)
app.use('/dashboard', companyroute)

app.use('/student', studentroute)
app.use('/college', collegeroute)
app.use('/collegeadmin', collegeadminroute)
app.use('/admin', adminroute)
// app.use(cookieParser());
app.get('/', (req, res) => {
  res.send('Welcome to the RecruitMantra Backend!');
});


app.listen(port ,()=>{
    console.log(`server started at port ${port}`)
})
    