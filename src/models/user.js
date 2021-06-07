const mongoose = require('mongoose');
const validator= require('validator');
const bcrypt=require('bcryptjs');
var jwt = require('jsonwebtoken');
const Task=require('./task');

const UserSchema=mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        unique:true, 
        require:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email is not valid")
            }
        }
    },
    password:{
        type:String,
        require:true,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Password can not contain in ""')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0)
             throw new Error("Age should be grater than 0")
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});
UserSchema.virtual('tasks',{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})

UserSchema.statics.findByCredential=async(email,password)=>{
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user

}
UserSchema.methods.toJSON= function(){
    const user=this;
    const userObject=user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;   
    return userObject;
    

}
UserSchema.methods.generateToken=async function(){
    const user = this
    const token = jwt.sign({ _id:JSON.stringify(user._id)}, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// Hash the plain text password
UserSchema.pre('save', async function (next){
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8);
    }
    next();

});
// Delete when user is remove.
UserSchema.pre('remove',async function(next){
    const   user =this
    await  Task.deleteMany({owner:user_id})

    next();
});
const User=mongoose.model("users",UserSchema);



module.exports=User