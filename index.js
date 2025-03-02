const express = require("express");
require("dotenv").config();
const path = require('path');
const userroute = require('./routes/userroute')
const feedbackroute = require('./routes/feedbackroute')
const interviewroute = require('./routes/interviewrout')
const hrinterviewroutes=require('./routes/hrInterview')
const seriesroutes=require('./routes/series')
const bodyParser = require('body-parser');
const { ConnectionDB } = require('./connection');
const { validation } = require('./service/auth')
const cors = require('cors');
const applicantroute = require('./routes/careersroutes')

const app = express();
const port = process.env.PORT;
ConnectionDB(process.env.MONGO_URL)

const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://www.recruitmantra.com',
  'https://recruit-mantra-git-master-satyam-gupta-s-projects.vercel.app' // Production domain
];

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
app.use((error, req, res, next) => {  if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'Invalid JSON' });
  } else {
    next();
  }
});

app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/resume', express.static('resume'))

app.use('/user', userroute);
app.use('/feedback', feedbackroute)
app.use('/carrer', applicantroute);

app.use('/interview', interviewroute)
app.use('/hrInterview',hrinterviewroutes)
app.use('/series',seriesroutes)
// app.use(cookieParser());
app.get('/', (req, res) => {
  res.send('Welcome to the RecruitMantra Backend!');
});

app.listen(port,'0.0.0.0', () => {
  console.log(`server started at port ${port}`)
})
