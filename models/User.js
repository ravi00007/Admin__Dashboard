 const mongoose = require('mongoose');
 

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        requied : true
    },
    price:{
        type:String,
        requied : true
    },
    brand:{
        type:String,
        requied : true
    },
    image: {
		type: String,
		required: true,
	},

    // image: 
    // { 
    //     data: Buffer, 
    //     contentType: String 
    // }

   
})
 

const User = mongoose.model('product',UserSchema);
module.exports = User;

