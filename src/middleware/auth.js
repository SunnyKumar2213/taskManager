const jwt= require('jsonwebtoken');
const User= require('../models/user');

const auth=async(req,res,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
       
        const decoded = jwt.verify(token, process.env.JWTSECRETKEY);
        const user_id = decoded._id.replace(/["']/g, "");
        const user = await User.findOne({ _id: user_id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }
        req.token=token;// for logout specific user token.
        req.user = user // getting user data in each API.
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
    
}

module.exports=auth;