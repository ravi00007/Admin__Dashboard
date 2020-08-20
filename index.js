const express =require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
var fs = require('fs'); 
const { throws } = require('assert');
const Favorite = require('./models/fav');
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

const upload = multer({
    storage:storage
});
app.use('/uploads',express.static(path.join(__dirname + 'uploads')));
app.use('/dist',express.static('dist'))
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json()) 
app.set('view engine','ejs');
//--------------------------------------------------------------

app.get('/login',(req,res)=>{
    res.render('login')              
});
app.get('/',(req,res)=>{
    res.render('login') 
})
app.get('/dashbord',(req,res)=>{
    res.render("index"); 
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
  
app.get('/delete/:id',(req,res)=>{
    User.findByIdAndDelete(req.params.id,(err,result)=>{
        if(err) throw console.log(err)
        else{
            
            res.redirect('/alldetails');
            console.log('deleted');
        }
    })
});


app.post('/update',upload.single('image'),(req,res)=>{
const name= req.body.name;
let newname = req.body.name1
User.findOne({
    name:name
})
.then(user=>{ 
    let id = user._id
    User.findByIdAndUpdate({})
    User.update({"_id":id},{$set: {"name": newname,
    "price":req.body.price,
    "brand":req.body.brand,
    "image": { 
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
        contentType: 'image/png'
    }
     }}, 
    (err,user)=>{
        if(!err){
            res.send('DATA UPDATED')
        }
    })
})
})
app.get('/alldetails',(req,res)=>{
    User.find({},(err,details)=>{
      if(err){
        console.log(err)
      }else{
        res.render('all',{details:details})
        // .json(details)
        console.log(details)
      }
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
          res.render('index');
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

//   app.get('/:id',(req,res)=>{
//     User.find({"_id":req.params.id},(err,details)=>{
//         if(err){
//           console.log(err)
//         }else{ 
//           res.render('edit',{details:details})
//           // .json(details)
//           console.log(details)
//         }
//       })  
//   })




// Post request which will handle db of Fav list
app.post("api/:id", async (req, res) => {
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
			await Favorite.findOneAndDelete({ objId: req.params.id });
			res.status(200).json({
				unFavorite,
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
app.get("api/", async (req, res) => {
	try {
		const favItems = await Favorite.find({});
		res.status(200).json(favItems);
	} catch (err) {
		res.status(400).json(err);
	}
});
//Get a single Fav item
app.get("api/:id", async (req, res) => {
	try {
		const favItems = await Favorite.findById(req.params.id);
		res.status(200).json(favItems);
	} catch (err) {
		res.status(400).json(err);
	}
});

//Delete a fav item
app.delete("api/:id/:objId", async (req, res) => {
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
const PORT =process.env.PORT || 7000;
app.listen(PORT, console.log(`server started at port ${PORT}`));