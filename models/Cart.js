const mongoose = require('mongoose');
const CartSchema = new mongoose.Schema({
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
  item: {
		type: Number,
		default: 0,
	},

    // image: 
    // { 
    //     data: Buffer, 
    //     contentType: String 
    // }

   
})
 

const Cart = mongoose.model('Cart',CartSchema);
module.exports = Cart;

