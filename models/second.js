const mongoose = require('mongoose');
 

const UserSchema2 = new mongoose.Schema({
    title: {
		type: String,
		required: true,
    },
    description: {
		type: String,
	},
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
    favorite: {
		type: Boolean,
		default: false,
  },
  isactive: {
    type: Boolean,
    default: true
}

    // image: 
    // { 
    //     data: Buffer, 
    //     contentType: String 
    // }

   
})
 

const User2 = mongoose.model('product2',UserSchema2);
module.exports = User2;

