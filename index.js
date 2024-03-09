const express=require("express");

const bodyParser = require('body-parser');


const app=express();
const port=4000;



app.use(express.json());
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON' });
    } else {
      next();
    }
  });
  
app.use(express.urlencoded({extended:false}));
// app.use(cookieParser());


app.listen(port ,()=>{
    console.log(`server started at port ${port}`)
})
    