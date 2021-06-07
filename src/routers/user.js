const express = require('express');
const User=require('../models/user');
const auth=require('../middleware/auth');
const sharp= require('sharp');
const {sendWelcomeEmail,UnsubscribeAccountEmail}=require('../emails/account');



const router = new express.Router();
const multer  = require('multer');

var upload  = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpge|png|PNG|jpg)$/)){
         return cb(new Error ("Please input image"));   
    }


    cb(undefined,true);
}
        

});
router.post('/users/me/avatar',auth,upload.single('avatars'),async(req,res)=>{
    
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
    req.user.avatar= buffer;
    await req.user.save();
    res.send();
 
 },(error,req,res,next)=>{
    res.status(400).send({error:error.message});
});

router.delete('/users/me/avatar',auth,upload.single('avatars'),async(req,res)=>{
    req.user.avatar= undefined;

    await req.user.save();
    res.send("User profile deleted successfully");
 
 });

 
 router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id);;
        if(!user|| !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar);

    }catch(e){
        res.status(400).send(e);
    }
 });


 
 

router.get('/getUsers',auth,async(req,res)=>{
    res.status(200).send(req.user);
})



router.post('/user/login',async(req,res)=>{
    try {
        const user = await User.findByCredential(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
});

router.get('/getUserById/:id', auth,async(req,res)=>{
    const _id=req.params.id;
   try{
       const user=await User.findById(_id);
       if(!user){
           return res.status(200).send("User not found")
       }
       return res.status(200).send(user);
    }
    catch(e){
        return res.status(400).send(e);
    }

})
router.post('/users',async (req,res)=>{
    const user = new User(req.body);
    try{
    await user.save();
    sendWelcomeEmail(user.email,user.name);
    const token=await user.generateToken();
    return res.status(200).send({user,token});
    }catch(e)
    {
        return res.status(400).send(e);
    }
});

router.post('/user/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter(token=>{
            return token.token!==req.token;
        });
        await req.user.save();
        return res.status(200).send("User logout successfully");
    }catch(e){
        return res.status(500).send("Some thing went wrong");
    }
});

router.post('/user/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        return res.status(200).send("All users logout successfully");

    }catch(e){
        res.status(500).send("Something went wrong");
    }
});
router.patch('/users/me',auth,async (req,res)=>{
    const updates=Object.keys(req.body);
    const allowUpdate=['name','age','email','password'];
    const isValidateOperation=updates.every((update)=> allowUpdate.includes(update));

    if(!isValidateOperation){
            return res.status(400).send("Error:Update is not valid please check your parameters");
    }
    try{
        updates.forEach((update)=>{
            req.user[update]=req.body[update];
        });
        await req.user.save();
    return res.status(200).send(req.user);
    }
    catch(e){
        return res.status(400).send(e);
    }

});
router.delete('/users/me',auth,async(req,res)=>{
    try{
        await  UnsubscribeAccountEmail(req.user.email,req.user.name);
        await req.user.remove();
        return res.status(200).send(req.user);
    }catch(err){
        res.status(400).send(err);
    }

})

module.exports=router;