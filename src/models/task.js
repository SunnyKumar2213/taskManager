const mongoose = require('mongoose');
const validator= require('validator');
const TaskSchema=mongoose.Schema({
        description:{
            type:String,
            require:true,
            trim:true
            
        },
        complete:{
            type:Boolean,
            default:false
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:'users'
        }

},{timestamps:true}
);

const User=mongoose.model("tasks",TaskSchema);

module.exports=User