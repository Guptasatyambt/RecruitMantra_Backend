// const express =require("express");
// require("dotenv").config();
// import { join } from 'path';
// import userroute from './routes/userroute';
// import feedbackroute from './routes/feedbackroute';
// import interviewroute from './routes/interviewrout';
// import hrinterviewroutes from './routes/hrInterview';
// import seriesroutes from './routes/series';
// import companyroute from './routes/companyroutes';
// import jobOpenning from './routes/jobOpennings';
// import studentroute from './routes/studentroutes';
// import collegeroute from './routes/collegeroutes';
// import collegeadminroute from './routes/collegeadminroutes';
// import adminroute from './routes/adminroutes';
// import applicantroute from './routes/careersroutes';
// import branchroute from './routes/branchroutes';
// import bodyParser from 'body-parser';
// import { ConnectionDB } from './connection';
// import { validation } from './service/auth';
// import cors from 'cors';
const express = require('express');
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
const branchroute = require('./routes/branchroutes');
const bodyParser = require('body-parser');
const {ConnectionDB}=require('./connection');
const{validation}=require('./service/auth')
const cors = require('cors');

const app=express();
const port=process.env.PORT;
ConnectionDB(process.env.MONGO_URL)
const allowedOrigins = ["http://localhost:3000"]
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error('Not allowed by CORS')); // Origin is not allowed
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true, // Allow credentials like cookies
}));

app.use(express.json());
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON' });
    } else {
      next();
    }
  });
  
app.use(express.urlencoded({extended:false}));

// app.use('/uploads', static(join(__dirname, 'uploads')));
// app.use('/resume', static('resume'))

app.use('/user', userroute);
app.use('/feedback', feedbackroute)
app.use('/carrer', applicantroute);
app.use('/job',jobOpenning);

app.use('/interview', interviewroute)
app.use('/hrInterview',hrinterviewroutes)
app.use('/series',seriesroutes)
app.use('/company', companyroute)

app.use('/student', studentroute)
app.use('/college', collegeroute)
app.use('/collegeadmin', collegeadminroute)
app.use('/admin', adminroute)
app.use('/branch', branchroute);
// app.use(cookieParser());
app.get('/', (req, res) => {
  res.send('Welcome to the RecruitMantra Backend!');
});


app.listen(port ,()=>{
    console.log(`server started at port ${port}`)
})
    