const mongoose = require('mongoose');
// date base url from mongodb website or localhost like 
//mongodb+srv://abc:abc@cluster0.ptpym.mongodb.net/databaseName
mongoose.connect(process.env.mongodb_key,{
    useNewUrlParser:true,
    useCreateIndex:true

});