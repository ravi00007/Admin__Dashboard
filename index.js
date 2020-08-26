const express =require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User');
const Cart = require('./models/Cart');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
var fs = require('fs'); 
const { throws } = require('assert');
const Favorite = require('./models/fav');
const { count } = require('console');
mongoose.connect('mongodb+srv://cron:9304@ravi@cluster0.zl5bd.mongodb.net/cron?retryWrites=true&w=majority', {useNewUrlParser:true,useUnifiedTopology: true },(err)=>{
    if(!err){
        console.log("mongodb connection succeeded..")
    }
    else{
    console.log('error in :' + err)
    }
})
const app = express();
app.use(cors());
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads")
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));

    }
});
 var counter =0;
 var deletecounter=0;
const upload = multer({
    storage:storage
});
app.use('/uploads',express.static(path.join(__dirname + 'uploads')));
app.use('/dist',express.static('dist'))
app.use('/products/dist',express.static('dist'))
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json()) 
app.set('view engine','ejs');
//--------------------------------------------------------------

app.get('/login',(req,res)=>{
    res.render('login')              
});
app.get('/admin',(req,res)=>{
    res.render('login') 
})
app.get('/dashbord',(req,res)=>{
   

    User.find({}).count()
    .then(function(items){
        res.render("index",{
            items:items,
            counter:counter,
            deletedcounter:deletecounter
        }); 
        console.log(items)
    })
    
   
        
    
    
});
app.get('/viewall',(req,res)=>{
    res.render('all');
})
app.get('/creat',(req,res)=>{
    res.render('create')
});  
app.get('/edit',(req,res)=>{
    res.render('edit')
});
  
app.get('/products/delete/:id',(req,res)=>{
    deletecounter = deletecounter+1
    User.findByIdAndDelete(req.params.id,(err,result)=>{
        if(err) throw console.log(err)
        else{
            
            res.redirect('/products/1');
            console.log('deleted');
        }
    })
});


app.post('/update',upload.single('image'),(req,res)=>{
let name= req.body.name;
let price = req.body.price;
let brand = req.body.brand;
let image = req.body.image;
let id = req.body.id
counter=counter+1
console.log(id)
console.log(name)
User.findByIdAndUpdate(id, { name: name , price:price,brand:brand,image:image}, 
function (err, docs) { 
    if (err){ 
        console.log(err) 
    }  
    else{ 
        res.redirect('/products/1');
        console.log("Updated User"); 
    } 
});



// let newname = req.body.name1
// User.findOne({
//     name:name
// })
// .then(user=>{ 
//     let id = user._id
//     User.findByIdAndUpdate({})
//     User.update({"_id":id},{$set: {"name": newname,
//     "price":req.body.price,
//     "brand":req.body.brand,
//     "image": { 
//         data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
//         contentType: 'image/png'
//     }
//      }}, 
//     (err,user)=>{
//         if(!err){
//             res.send('DATA UPDATED')
//         }
//     })
// })
})
app.get('/alldetails',(req,res)=>{
    var perPage = 5
    var page = 1;
    var s = (perPage * page) - perPage
    User.find({})
    .skip(5)
    .limit(perPage)
    .sort({_id:-1})
    .exec(function(err, details) {
        User.countDocuments().exec(function(err, count) {
            if (err) return next(err)
            res.render('all', {
                details: details,
                current: page,
                pages: Math.ceil(count / perPage)
            })
        })
    })
    // User.find({},(err,details)=>{
    //   if(err){
    //     console.log(err)
    //   }else{
    //     res.render('all',{details:details})
    //     // .json(details)
    //     console.log(details)
    //   }
    // })
  
});

app.post("/search",(req,res)=>{
    var key = req.body.searchkey;
   if(key!=""){
       var filter =User.find({name:key});
       filter.exec(function(err,data){
           if(err) throw err;
           res.render('all',{
               details:data,
               current:1,
               pages:1
            })
       })
   }
})

app.get('/autocomplete',(req,res)=>{
    var regex = new RegExp(req.query["term"],'i');
    var filter = User.find({name:regex},{"name":1})
    .sort({"updated_at":-1})
    .sort({"created_at":-1})
    .limit(8);
    filter.exec(function(err,data){
        var result =[];
        // console.log(data)
        if(!err){
            if(data && data.length && data.length >0){
                data.forEach(user=>{
                    let obj={
                        id:user._id,
                        label:user.name
                    };
                    result.push(obj);
                })
            }
        }
        
        res.jsonp(result);
    })
})
   
app.get('/products/:id',(req,res)=>{
    var perPage = 5
    var page = req.params.id|| 1
    var s = (perPage * page) - perPage
   
    User.find({})
    .skip(s)
    .limit(perPage)
    .sort({_id:-1})
    .exec(function(err, details) {
        User.countDocuments().exec(function(err, count) {
            if (err) return next(err)
            res.render('all', {
                details: details,
                current: page,
                active:'Activate',
                pages: Math.ceil(count / perPage)
            })
        })
    })
})

app.post('/create',upload.single('image'), (req, res, next)=>{
    var obj = { 
        name: req.body.name, 
        price: req.body.price, 
        brand : req.body.brand,
        image : req.body.image,
        title :req.body.title,
        description:req.body.description,
        
        // image: { 
        //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
        //     contentType: 'image/png'
        // }  
    }
    User.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
             item.save(); 
             console.log('product added');
             res.redirect('/dashbord'); 
        } 
    });
    console.log(obj)
})

app.post('/login',(req,res)=>{
    let email = req.body.email;
    let pass = req.body.pass;
    console.log(email);    
    console.log(pass);
    let e ="admin@gmail.com";
    let p ="Admin@123456";
    if(email==e){
        if(pass===p){
          res.redirect('/dashbord');
        }else{
            res.send("wrong password");
        }
    }else{
        res.send("invalid Email");
    }
    
    
   
})


app.get('/api/alldetails',(req,res)=>{

    User.find({},(err,details)=>{
      if(err){
        console.log(err)
      }else{
          res.status(200).json(details);
        // res.render('all',{details:details})
        // // .json(details)
        // console.log(details)
      }
    }) 
  })

  app.get('/:id',(req,res)=>{
    User.find({"_id":req.params.id},(err,details)=>{
        if(err){
        //   console.log(err.stack,"debug");
        }else{ 
          res.render('edit',{details:details})
          // .json(details)
          console.log(details)
        }
      })  
  })

//   app.get('isactivate/:id',(req,res)=>{
//       console.log("this is the id ", req.params.id)
//   })





// Post request which will handle db of Fav list
app.post("/:id", async (req, res) => {
	// res.send("working");

	try {
		//Pulling out the item form the db
		const item = await User.findById(req.params.id);
		//Check if it exists in fav item
		const favExists = await Favorite.findOne({ objId: req.params.id });
		console.log(favExists, "favExists");
		//If it  exist in fav db
		if (favExists) {
			console.log("favExists");
			//If it exists in fav db then make the flag false
			const unFavorite = await User.findByIdAndUpdate(
				req.params.id,
				{
					favorite: false,
				},
				{ new: true }
			);
			//Delete from favlist
			var DeletedItem =await Favorite.findOneAndDelete({ objId: req.params.id });
			res.status(200).json({
				DeletedItem
			});
		} else {
			// Collect the things you need
			const favorite = new Favorite({
				image: item.image,
				objId: item._id,
				title: item.title,
				description: item.description,
			});
			//Save it
			await favorite.save();
			//Rase a flag that it is true
			const updateFlag = await User.findByIdAndUpdate(
				req.params.id,
				{
					favorite: true,
				},
				{ new: true }
			);
			res.status(200).json({
				updateFlag,
			});
		}
	} catch (error) {
		res.status(400).json({ msg: "something went wrong", err: error.message });

		console.log(error.stack);
	}
});

// Get all the fav items
app.get("/", async (req, res) => {
	try {
		const favItems = await Favorite.find({});
		res.status(200).json(favItems);
	} catch (err) {
		res.status(400).json(err);
	}
});
//Get a single Fav item
app.get("/:id", async (req, res) => {
	try {
		const favItems = await Favorite.findById(req.params.id);
		res.status(200).json(favItems);
	} catch (err) {
		res.status(400).json(err);
	}
});

//Delete a fav item
app.delete("/:id/:objId", async (req, res) => {
	try {
		const item = await Favorite.findByIdAndDelete(req.params.id, {
			useFindAndModify: true,
		});

		//If it exists in fav db then make the item flag false
		const itemFlag = await User.findByIdAndUpdate(
			req.params.objId,
			{
				favorite: false,
			},
			{ new: true }
		);
		res.status(200).json(item);
	} catch (error) {
		res.status(400).json(error);
		console.log(error.message);
	}
});

app.post("/new/api/for/:id", async (req, res) => {
	// res.send("working");
	try {
        //Pulling out the item form the db
        console.log("prams id",req.params.id);
        const item = await User.findById(req.params.id);
        console.log("item id",item._id);
		//Check if it exists in Cart item
		const cartExists = await Cart.findOne({ objId: req.params.id });
		console.log(cartExists, "cartExists");
		//If it  exist in Cart db
		if (cartExists) {
			console.log("item in cart Exists");
			//If it exists in cart db then make the flag false
			const increaseQuantity = await User.findByIdAndUpdate(
				req.params.id,
				{
					item: item + 1,
				},
				{ new: true }
			);
			res.status(200).json(increaseQuantity);
		} else {
			// Collect the things you need
			const cartItem = new Cart({
				// / Ravi Put down your created proparties /
              
                price:item.price,
                brand:item.brand,
                image: item.image,
				objId: item._id,
				title: item.title,
				description: item.description,
			});
			//Save it
			const savedItem = await cartItem.save();

			res.status(200).json({
				savedItem,
			});
		}
	} catch (error) {
		res.status(400).json({ msg: "something went wrong", err: error });

		console.log(error.stack);
	}
});



app.get("/new/api/getdetails", async (req, res) => {
	try {
		const cartItems = await Cart.find({});
		res.status(200).json(cartItems);
	} catch (err) {
		res.status(400).json(err);
	}
});

app.delete("/new/api/delete/:id", async (req, res) => {
	try {
		const item = await Cart.findByIdAndDelete(req.params.id);

		res.status(200).json(item);
	} catch (error) {
		res.status(400).json(error);
		console.log(error.message);
	}
});

app.get("/new/api/singlefav/:id", async (req, res) => {
	try {
		const cartItems = await Cart.findById(req.params.id);
		res.status(200).json(cartItems);
	} catch (err) {
		res.status(400).json(err);
	}
});
app.get('/new/api/onedata/:id',(req,res)=>{
    User.findById(req.params.id)
    .then((data)=>{
        res.status(200).json(data)
    }).catch((err)=>{
        console.log(err)
        res.status(400).json(err)
    })
})

const PORT =process.env.PORT || 7000;
app.listen(PORT, console.log(`server started at port ${PORT}`));