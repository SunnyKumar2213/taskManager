const express = require('express');
const router = new express.Router();
const Task=require('../models/task');
const auth=require('../middleware/auth');

router.get('/getTasks',auth,async(req,res)=>{ 
    try{
        //const task=await Task.find({owner:req.user._id});
        const match={}; 
        const sort={};
        if(req.query.completed){
            match.complete=req.query.completed ==='true';
        }
        if(req.query.sortBy){
            var part=req.query.sortBy.split(':');
            sort[part[0]]=part[1]==='desc'? -1 : 1

        }
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit :parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        return res.status(200).send(req.user.tasks);
    }catch(e){
        return res.status(400).send(e);
    }
})

router.get('/getTaskById/:id', auth,async (req,res)=>{
    const _id=req.params.id;
    try{
        const task=await Task.findOne({_id,owner:req.user._id});
        if(!task){
            return   res.status(400).send("User not Found");
        }
        return  res.status(200).send(task)
    }catch(e){
        return res.status(500).send(e);
    }

})


 
router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates=Object.keys(req.body);
    const allowUpdate=['complete',"description"];

    const isValidateOperation=updates.every((update)=> allowUpdate.includes(update));
    if(!isValidateOperation){
        return res.status(400).send("Error: invalid attribute for update");
    }
    try{
    const updateTask=await Task.findOne({_id:req.params.id,owner:req.user._id});
    if(!updateTask){
        return res.status(200).send("Task not found");
    }
    updates.forEach((update)=>{updateTask[update]=req.body[update];});
    await updateTask.save();
    return res.status(200).send(updateTask);
}
catch(err){
    res.status(400).send("Error");
}
})


router.post('/newTask',auth,async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    });
    try{
        const data= await task.save();
        return res.status(200).send(data);
    }catch(e){
        return res.status(400).send(e);
    }
});

router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
       // const task = await Task.findByIdAndDelete({_id:req.params.id,owner:req.user._id});
       const ownerId=req.user.owner;
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user.owner});
        if(!task){ 
            return res.status(400).send("Error: Task is not found");
        }
        return res.status(200).send(task);
    }catch(err){
        res.status(400).send(err);
    }

})


module.exports=router;