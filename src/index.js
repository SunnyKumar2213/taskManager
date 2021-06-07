const express = require('express');
require('./db/mongoose');
const app=express();
const port=process.env.PORT || 5000;
const bcrypt=require('bcryptjs');
app.use(express.json());

const userRouter=require('./routers/user');
const taskRouter = require('./routers/task');
var schedule = require('node-schedule');
var request = require('request');



app.use(userRouter);
app.use(taskRouter);
app.listen(port,()=>{
    console.log("Server is up :" +port)
})



