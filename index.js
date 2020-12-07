const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User');
const Cart = require('./models/Cart');
const User2 = require('./models/second');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { throws } = require('assert');
const Favorite = require('./models/fav');
const { count } = require('console');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountkey.json');
const { Storage } = require('@google-cloud/storage');
const multerGoogleStorage = require('multer-google-storage');
const { url } = require('inspector');
const session = require('express-session');
const flash = require('connect-flash');

const url = "YOUR mongoDB URL"

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err) {
        console.log("mongodb connection succeeded..")
    }
    else {
        console.log('error in :' + err)
    }
})
const app = express();
app.use(cors());
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 6000 },
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

const store = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

    }
});

const upload = multer({
    storage: store
});


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-crud-restapi-ac1a1.firebaseio.com",
    storageBucket: "gs://fir-crud-restapi-ac1a1.appspot.com/"
});
var counter = 0;
var deletecounter = 0;

const storage = new Storage({
    projectId: "fir-crud-restapi-ac1a1",
    keyFilename: "./ServiceAccountkey.json"
});

const bucketName = "gs://fir-crud-restapi-ac1a1.appspot.com"
app.use('/uploads', express.static(path.join(__dirname + 'uploads')));
app.use('/dist', express.static('dist'))
app.use('/products/dist', express.static('dist'))
app.use('/second/dist', express.static('dist'))
app.use('/sec/dist', express.static('dist'))
app.use('/forajx/dist', express.static('dist'));
app.use('/forajxpro2/dist', express.static('dist'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json())
app.use(cors());
app.set('view engine', 'ejs');
//--------------------------------------------------------------

app.get('/login', (req, res) => {
    res.render('login')
});
app.get('/admin', (req, res) => {
    res.render('login')
})
app.get('/sec/forajx', (req, res) => {
    res.render('ajaxview', { success_msg: req.flash('success_msg') });
})
app.get('/sec/forajxprdct2',(req,res)=>{
    res.render('ajaxview2',{success_msg: req.flash('success_msg') })
})
app.get('/dashbord', async(req, res) => {

    
    const number1 = await User2.countDocuments();
    const number2 = await User.countDocuments();
   
        res.render("index", {
            items1: number2,
            items2:number1,
            counter: counter,
            deletedcounter: deletecounter
        });

});
app.get('/dash',(req,res)=>{
    res.redirect('/dashbord');
})
app.get('/viewall', (req, res) => {
    res.render('all');
})
app.get('/creat', (req, res) => {
    res.render('create')
});
app.get('/creatupdated', (req, res) => {
    res.render('createupdated')
})
app.get('/addforajx', (req, res) => {
    res.render('creatforajx');
})
app.get('/addforajxpro2',(req,res)=>{
    res.render('forproduct2')
})
app.get('/creatupdated2', (req, res) => {
    res.render('secondcreate');
})
app.get('/edit', (req, res) => {
    res.render('edit')
});
app.get('/edit/forajx', (req, res) => {
    res.render('editforajx')
})

app.get('/products/delete/:id', (req, res) => {

    User.findByIdAndDelete(req.params.id, (err, result) => {
        if (err) throw console.log(err)
        else {
            req.flash(
                'success_msg',
                'Product Deleted Successfully'
            );
            res.redirect('/products/1');
            console.log('deleted');
        }
    })
});

app.get('/products/forajx/delete/:id', (req, res) => {

    User.findByIdAndDelete(req.params.id, (err, result) => {
        if (err) throw console.log(err)
        else {
            req.flash(
                'success_msg',
                'Product Deleted Successfully'
            );
            res.redirect('/sec/forajx');
            console.log('deleted');
        }
    })
});

app.get('/products/forajx/prdct2/delete/:id', (req, res) => {

    User2.findByIdAndDelete(req.params.id, (err, result) => {
        if (err) throw console.log(err)
        else {
            req.flash(
                'success_msg',
                'Product Deleted Successfully'
            );
            res.redirect('/sec/forajxprdct2')
            console.log('deleted');
        }
    })
});

app.get('/delete/:id', (req, res) => {

    User.findByIdAndDelete(req.params.id, (err, result) => {
        if (err) throw console.log(err)
        else {
            req.flash(
                'success_msg',
                'Product Deleted Successfully'
            );
            res.redirect('/products/1');
            console.log('deleted');
        }
    })
});


//,upload.single('image') pste on below route
app.post('/update', upload.single('myfile'), (req, res) => {
    if (req.file) {
        (async () => {

            hostedimage = '';
            try {
                //upload a file to the bucket using multer
                filetobeuploded = req.file.path
                console.log("this is file path", req.file.path)
                let uuid = uuidv4()
                await storage.bucket(bucketName).upload(filetobeuploded, {
                    gzip: true,

                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                        cacheControl: 'public, max-age=31536000',
                    },

                }).then((data) => {

                    let file = data[0];

                    // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                    console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                    hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;

                    let name = req.body.name
                    let price = req.body.price
                    let brand = req.body.brand
                    let image = hostedimage
                    let title = req.body.title
                    let description = req.body.description
                    let id = req.body.id;

                    // image: { 
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
                    //     contentType: 'image/png'
                    // }  

                    // console.log("this is object ",obj);
                    User.findByIdAndUpdate(id, { name: name, price: price, brand: brand, image: image, title: title, description: description },
                        function (err, docs) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                req.flash(
                                    'success_msg',
                                    'Updated Successfully'
                                );
                                res.redirect('/products/1');
                                console.log("Updated User");
                            }
                        });



                });

                //  console.log(`${filetobeuploded} uploaded to ${bucketName}.`);
                //  return res.status(200);


            }
            catch (error) {
                console.log("mine debug=>", error.stack);
                return res.status(500).send(error)
            }

        })();
    }
    else {
        let name = req.body.name
        let price = req.body.price
        let brand = req.body.brand
        let title = req.body.title
        let description = req.body.description
        let id = req.body.id;

        // image: { 
        //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
        //     contentType: 'image/png'
        // }  

        // console.log("this is object ",obj);
        User.findByIdAndUpdate(id, { name: name, price: price, brand: brand, title: title, description: description },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    req.flash(
                        'success_msg',
                        'Updated Successfully'
                    );
                    res.redirect('/products/1');
                    console.log("Updated User");
                }
            });
    }

    // User.findByIdAndUpdate(id, { name: name , price:price,brand:brand,image:image}, 
    // function (err, docs) { 
    //     if (err){ 
    //         console.log(err) 
    //     }  
    //     else{ 
    //         res.redirect('/products/1');
    //         console.log("Updated User"); 
    //     } 
    // });

})
// post route for ajax update
app.post('/updateforajx', upload.single('myfile'), (req, res) => {
    if (req.file) {
        (async () => {

            hostedimage = '';
            try {
                //upload a file to the bucket using multer
                filetobeuploded = req.file.path
                console.log("this is file path", req.file.path)
                let uuid = uuidv4()
                await storage.bucket(bucketName).upload(filetobeuploded, {
                    gzip: true,

                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                        cacheControl: 'public, max-age=31536000',
                    },

                }).then((data) => {

                    let file = data[0];

                    // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                    console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                    hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;

                    let name = req.body.name
                    let price = req.body.price
                    let brand = req.body.brand
                    let image = hostedimage
                    let title = req.body.title
                    let description = req.body.description
                    let id = req.body.id;
                    User.findByIdAndUpdate(id, { name: name, price: price, brand: brand, image: image, title: title, description: description },
                        function (err, docs) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                req.flash(
                                    'success_msg',
                                    'Updated Successfully'
                                );
                                res.redirect('/sec/forajx');
                                console.log("Updated User");
                            }
                        });
                });
            }
            catch (error) {
                console.log("mine debug=>", error.stack);
                return res.status(500).send(error)
            }

        })();
    }
    else {
        let name = req.body.name
        let price = req.body.price
        let brand = req.body.brand
        let title = req.body.title
        let description = req.body.description
        let id = req.body.id;

        // image: { 
        //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
        //     contentType: 'image/png'
        // }  

        // console.log("this is object ",obj);
        User.findByIdAndUpdate(id, { name: name, price: price, brand: brand, title: title, description: description },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    req.flash(
                        'success_msg',
                        'Updated Successfully'
                    );
                    res.redirect('/sec/forajx');
                    console.log("Updated User");
                }
            });
    }



})
// route for prouct 2
app.post('/updateforpro2', upload.single('myfile'), (req, res) => {
    if (req.file) {
        (async () => {

            hostedimage = '';
            try {
                //upload a file to the bucket using multer
                filetobeuploded = req.file.path
                console.log("this is file path", req.file.path)
                let uuid = uuidv4()
                await storage.bucket(bucketName).upload(filetobeuploded, {
                    gzip: true,

                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                        cacheControl: 'public, max-age=31536000',
                    },

                }).then((data) => {

                    let file = data[0];

                    // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                    console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                    hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;

                    let name = req.body.name
                    let price = req.body.price
                    let brand = req.body.brand
                    let image = hostedimage
                    let title = req.body.title
                    let description = req.body.description
                    let id = req.body.id;
                    User2.findByIdAndUpdate(id, { name: name, price: price, brand: brand, image: image, title: title, description: description },
                        function (err, docs) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                req.flash(
                                    'success_msg',
                                    'Updated Successfully'
                                );
                                res.redirect('/sec/forajxprdct2')
                                console.log("Updated User");
                            }
                        });
                });
            }
            catch (error) {
                console.log("mine debug=>", error.stack);
                return res.status(500).send(error)
            }

        })();
    }
    else {
        let name = req.body.name
        let price = req.body.price
        let brand = req.body.brand
        let title = req.body.title
        let description = req.body.description
        let id = req.body.id;
        User2.findByIdAndUpdate(id, { name: name, price: price, brand: brand, title: title, description: description },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    req.flash(
                        'success_msg',
                        'Updated Successfully'
                    );
                    res.redirect('/sec/forajxprdct2')
                    console.log("Updated User");
                }
            });
    }



})
app.get('/alldetails', (req, res) => {
    var perPage = 5
    var page = 1;
    var s = (perPage * page) - perPage
    User.find({})
        .skip(5)
        .limit(perPage)
        .sort({ _id: -1 })
        .exec(function (err, details) {
            User.countDocuments().exec(function (err, count) {
                if (err) return next(err)
                res.render('all', {
                    details: details,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    viewall: false
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



app.post("/search", (req, res) => {
    var key = req.body.searchkey;
    if (key != "") {
        var filter = User.find({ name: key });
        filter.exec(function (err, data) {
            if (err) throw err;
            res.render('all', {
                details: data,
                current: 1,
                pages: 1,
                viewall: true,
                success_msg: req.flash('success_msg')
            })
        })
    }
})
app.post("/search2", (req, res) => {
    var key = req.body.searchkey;
    if (key != "") {
        var filter = User2.find({ name: key });
        filter.exec(function (err, data) {
            if (err) throw err;
            res.render('all2', {
                details: data,
                current: 1,
                pages: 1,
                viewall: true,
                success_msg: req.flash('success_msg')
            })
        })
    }
})

app.get('/autocomplete', (req, res) => {
    var regex = new RegExp(req.query["term"], 'i');
    var filter = User.find({ name: regex }, { "name": 1 })
        .sort({ "updated_at": -1 })
        .sort({ "created_at": -1 })
        .limit(8);
    filter.exec(function (err, data) {
        var result = [];
        // console.log(data)
        if (!err) {
            if (data && data.length && data.length > 0) {
                data.forEach(user => {
                    let obj = {
                        id: user._id,
                        label: user.name
                    };
                    result.push(obj);
                })
            }
        }

        res.jsonp(result);
    })
})
app.get('/autocomplete2', (req, res) => {
    var regex = new RegExp(req.query["term"], 'i');
    var filter = User2.find({ name: regex }, { "name": 1 })
        .sort({ "updated_at": -1 })
        .sort({ "created_at": -1 })
        .limit(8);
    filter.exec(function (err, data) {
        var result = [];
        // console.log(data)
        if (!err) {
            if (data && data.length && data.length > 0) {
                data.forEach(user => {
                    let obj = {
                        id: user._id,
                        label: user.name
                    };
                    result.push(obj);
                })
            }
        }

        res.jsonp(result);
    })
})

app.get('/products/:id', (req, res) => {
    var perPage = 5
    var page = req.params.id || 1
    var s = (perPage * page) - perPage

    User.find({})
        .skip(s)
        .limit(perPage)
        .sort({ _id: -1 })
        .exec(function (err, details) {
            User.countDocuments().exec(function (err, count) {
                if (err) return next(err)
                res.render('all', {
                    details: details,
                    current: page,
                    active: 'Activate',
                    pages: Math.ceil(count / perPage),
                    viewall: false,
                    success_msg: req.flash('success_msg')
                })
            })
        })
})

// app.get("/google/upload",(req,res)=>{
//     res.render("fileupload");
// })


app.post("/google/upload", upload.single('myfile'), (req, res) => {

    (async () => {

        hostedimage = '';
        try {


            //upload a file to the bucket using multer
            filetobeuploded = req.file.path
            let uuid = uuidv4()
            await storage.bucket(bucketName).upload(filetobeuploded, {
                gzip: true,

                metadata: {
                    firebaseStorageDownloadTokens: uuid,
                    cacheControl: 'public, max-age=31536000',
                },

            }).then((data) => {

                let file = data[0];
                console.log("this is url", url("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid))
                // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;
                var obj = {
                    name: req.body.name,
                    price: req.body.price,
                    brand: req.body.brand,
                    image: hostedimage,
                    title: req.body.title,
                    description: req.body.description,

                    // image: { 
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
                    //     contentType: 'image/png'
                    // }  
                }
                // console.log("this is object ",obj);
                User.create(obj, (err, item) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        item.save();
                        req.flash(
                            'success_msg',
                            'Added Successfully'
                        );
                        console.log('product added');
                        res.redirect('/products/1');
                    }
                });
                console.log(obj)


            });

            console.log(`${filetobeuploded} uploaded to ${bucketName}.`);
            //  return res.status(200);


        }
        catch (error) {
            console.log("mine debug=>", error.stack);
            return res.status(500).send(error)
        }

    })();



})

app.post("/google/upload/forajx", upload.single('myfile'), (req, res) => {

    (async () => {

        hostedimage = '';
        try {


            //upload a file to the bucket using multer
            filetobeuploded = req.file.path
            let uuid = uuidv4()
            await storage.bucket(bucketName).upload(filetobeuploded, {
                gzip: true,

                metadata: {
                    firebaseStorageDownloadTokens: uuid,
                    cacheControl: 'public, max-age=31536000',
                },

            }).then((data) => {

                let file = data[0];
                console.log("this is url", url("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid))
                // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;
                var obj = {
                    name: req.body.name,
                    price: req.body.price,
                    brand: req.body.brand,
                    image: hostedimage,
                    title: req.body.title,
                    description: req.body.description,

                    // image: { 
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
                    //     contentType: 'image/png'
                    // }  
                }
                // console.log("this is object ",obj);
                User.create(obj, (err, item) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        item.save();
                        req.flash(
                            'success_msg',
                            'Added Successfully'
                        );
                        console.log('product added');
                        res.redirect('/sec/forajx')
                    }
                });
                console.log(obj)


            });

            console.log(`${filetobeuploded} uploaded to ${bucketName}.`);
            //  return res.status(200);


        }
        catch (error) {
            console.log("mine debug=>", error.stack);
            return res.status(500).send(error)
        }

    })();



})
app.post("/google/upload/forajx/pro2", upload.single('myfile'), (req, res) => {

    (async () => {

        hostedimage = '';
        try {


            //upload a file to the bucket using multer
            filetobeuploded = req.file.path
            let uuid = uuidv4()
            await storage.bucket(bucketName).upload(filetobeuploded, {
                gzip: true,

                metadata: {
                    firebaseStorageDownloadTokens: uuid,
                    cacheControl: 'public, max-age=31536000',
                },

            }).then((data) => {

                let file = data[0];
                console.log("this is url", url("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid))
                // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;
                var obj = {
                    name: req.body.name,
                    price: req.body.price,
                    brand: req.body.brand,
                    image: hostedimage,
                    title: req.body.title,
                    description: req.body.description,

                    // image: { 
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
                    //     contentType: 'image/png'
                    // }  
                }
                // console.log("this is object ",obj);
                User2.create(obj, (err, item) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        item.save();
                        req.flash(
                            'success_msg',
                            'Added Successfully'
                        );
                        console.log('product added');
                        res.redirect('/sec/forajxprdct2')
                    }
                });
                console.log(obj)


            });

            console.log(`${filetobeuploded} uploaded to ${bucketName}.`);
            //  return res.status(200);


        }
        catch (error) {
            console.log("mine debug=>", error.stack);
            return res.status(500).send(error)
        }

    })();



})
//,upload.single('image'), paste on below route

app.post('/create', upload.single('myfile'), (req, res, next) => {


    var obj = {
        name: req.body.name,
        price: req.body.price,
        brand: req.body.brand,
        title: req.body.title,
        des: req.body.des,
        // image: { 
        //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
        //     contentType: 'image/png'
        // }  
    }
    // User.create(obj, (err, item) => { 
    //     console.log("this is item", item)
    //     if (err) { 
    //         console.log(err); 
    //     } 
    //     else { 
    //         //  item.save(); 
    //         //  console.log('product added');
    //         //  res.redirect('/dashbord'); 
    //     } 
    // })
    console.log(obj)
})

app.post('/login', (req, res) => {
    let email = req.body.email;
    let pass = req.body.pass;
    console.log(email);
    console.log(pass);
    let e = "admin@gmail.com";
    let p = "Admin@123456";
    if (email == e) {
        if (pass === p) {
            res.redirect('/dashbord');
        } else {
            res.send("wrong password");
        }
    } else {
        res.send("invalid Email");
    }



})


app.get('/api/alldetails', (req, res) => {

    User.find({}, (err, details) => {
        if (err) {
            console.log(err)
        } else {
            res.status(200).json(details);

            // res.render('all',{details:details})
            // // .json(details)
            // console.log(details)
        }
    })
})

app.post('/api/alldetails/forajax', (req, res) => {

    data = []
    let k=[]
    let totalRecords = 0
    const draw = req.body.draw
    const row = parseInt(req.body.start)
    const rowperpage = parseInt(req.body.length)
    const key = req.body.search
    const order = req.body.order
    const columnname = req.body.columns
    console.log("this is row",row)
   
    
    if(order[0]['dir']=='asc' ){
       
        k.push(1)
     
    }
    else{
       
     k.push(-1)
  
    }
    console.log("this is rowperpage",rowperpage)
    let totalRecordwithFilter = 0

    User.find({}).count()
        .then((it) => {
            totalRecords = it
            console.log("this is c", totalRecords)


        })


    if (key != "" && key.value.length > 0) {
        console.log("This is key", key.value)
        var regex = new RegExp(key.value);
        console.log("regex", regex)
        var filter = User.find({ $or: [ { name: [regex ] }, { brand: [ regex ] } ] })
        filter.exec(function (err, data) {
            console.log("this is search data", data)
        })
      
    }
    else {
        var filter = User.find({});
    } 
         filter
        .skip(row)
        .limit(rowperpage)
        .sort({ _id: k[0] })
        .exec(function (err, details) {
            if (err) {
                console.log(err)
            } else {
                for (let i = 0; i < details.length; i++) {
                    var a = {
                        "name": details[i].name,
                        "price": details[i].price,
                        "brand": details[i].brand,
                        "image": `<img src= '${details[i].image}' height='120' width='120'/>`,
                        "action": details[i].isactive == true ? `<a href="/isactivateforajx/${details[i].id}" class="btn btn-success" onclick="return confirm('Are you sure want to Activate');"  role="button">active</a>` : `<a href="/isactivateforajx/${details[i].id}" class="btn btn-danger" onclick="return confirm('Are you sure want to Deactivate');"  role="button">Inative</a>`,
                        "delete": `<a href="/products/forajx/delete/${details[i].id}" class="btn btn-danger" onclick="return confirm('Are you sure want to Delete');"  role="button">Delete</a>`,
                        "update": `<a href="/forajx/${details[i].id}" class="btn btn-warning" onclick="return confirm('Are you sure want to Update');"  role="button">Edit</a>`
                    }
                    data.push(a);
                }
                //   res.status(200).json(details);
                result = {
                    "draw": draw,
                    "iTotalRecords": totalRecords,
                    "iTotalDisplayRecords": totalRecords,
                    "aaData": data
                }
                console.log('iTotalRecords', result.iTotalRecords)
                res.status(200).json(result);
            }

        })
    // User.find({},(err,details)=>{
    //   if(err){
    //     console.log(err)
    //   }else{
    //     if(searchValue != ''){
    //         console.log("this is search value",searchValue)
    //      }
    //       for( let i = 0; i < details.length; i++){
    //           var a = {
    //               "name": details[i].name,
    //               "price":details[i].price,
    //               "brand": details[i].brand,
    //               "image": `<img src= '${details[i].image}' height='120' width='120'/>`,
    //               "action": details[i].isactive == true ? `<a href="/isactivateforajx/${details[i].id}" class="btn btn-success" onclick="return confirm('Are you sure want to Activate');"  role="button">active</a>`:`<a href="/isactivateforajx/${details[i].id}" class="btn btn-danger" onclick="return confirm('Are you sure want to Deactivate');"  role="button">Inative</a>`,
    //               "delete" : `<a href="/products/forajx/delete/${details[i].id}" class="btn btn-danger" onclick="return confirm('Are you sure want to Delete');"  role="button">Delete</a>`,
    //                 "edit"  :  `<a href="/${details[i].id}" class="btn btn-warning" onclick="return confirm('Are you sure want to Update');"  role="button">Edit</a>`
    //             }  
    //           data.push(a);
    //       }

    //     //   res.status(200).json(details);
    //     result  = {
    //         "draw" :draw,
    //         "iTotalRecords" : 6,
    //          "iTotalDisplayRecords" : 6,
    //          "aaData" : data
    //     }
    //     res.status(200).json(result);

    //     // res.render('all',{details:details})
    //     // // .json(details)
    //     // console.log(details)
    //   }
    // }) 
})
app.post('/api/alldetails/forajaxprdct2', (req, res) => {
    data = []
    let k=[]
    let totalRecords = 0
    const draw = req.body.draw
    const key = req.body.search
    const order = req.body.order
    const row = parseInt(req.body.start)
    const rowperpage = parseInt(req.body.length)
    if(order[0]['dir']=='asc'){
        console.log("ase")
        k.push(1)
       console.log(k[0])
    }
    else{
        console.log("dsc")
     k.push(-1)
     console.log(k)
    }
    console.log("this is order",order[0]['dir'])
    let totalRecordwithFilter = 0

    User2.find({}).count()
        .then((it) => {
            totalRecords = it
            console.log("this is c", totalRecords)


        })

 
    if (key != "" && key.value.length > 0) {
        console.log("This is key", key.value)

        var regex = new RegExp(key.value);
        console.log("regex", regex)
        var filter = User2.find({ $or: [ { name: [regex ] }, { brand: [ regex ] } ] })
        filter.exec(function (err, data) {
            console.log("this is search data", data)
        })
      
    }
    else {
        var filter = User2.find({});
    }
         filter
        .skip(row)
        .limit(rowperpage) 
        .sort({ _id: k[0] })
        .exec(function (err, details) {

            if (err) {
                console.log(err)
            } else {
                for (let i = 0; i < details.length; i++) {
                    var a = {
                        "name": details[i].name,
                        "price": details[i].price,
                        "brand": details[i].brand,
                        "image": `<img src= '${details[i].image}' height='120' width='120'/>`,
                        "action": details[i].isactive == true ? `<a href="/isactivateforajx/pro2/${details[i].id}" class="btn btn-success" onclick="return confirm('Are you sure want to Activate');"  role="button">active</a>` : `<a href="/isactivateforajx/pro2/${details[i].id}" class="btn btn-danger" onclick="return confirm('Are you sure want to Deactivate');"  role="button">Inative</a>`,
                        "delete": `<a href="/products/forajx/prdct2/delete/${details[i].id}" class="btn btn-danger" onclick="return confirm('Are you sure want to Delete');"  role="button">Delete</a>`,
                        "update": `<a href="/forajxpro2/${details[i].id}" class="btn btn-warning" onclick="return confirm('Are you sure want to Update');"  role="button">Edit</a>`
                    }
                    data.push(a);
                }

                
                result = {
                    "draw": draw,
                    "iTotalRecords": totalRecords,
                    "iTotalDisplayRecords": totalRecords,
                    "aaData": data
                }
                console.log('iTotalRecords', result.iTotalRecords)
                res.status(200).json(result);
            }

        })
   

})
app.get('/:id', (req, res) => {
    User.find({ "_id": req.params.id }, (err, details) => {
        if (err) {
            //   console.log(err.stack,"debug");
        } else {
            res.render('edit', { details: details })
            // .json(details)
            console.log(details)
        }
    })
})
// edit route for ajx call
app.get('/forajx/:id', (req, res) => {
    User.find({ "_id": req.params.id }, (err, details) => {
        if (err) {
            //   console.log(err.stack,"debug");
        } else {
            res.render('editforajx', { details: details })
            // .json(details)
            console.log(details)
        }
    })
})

app.get('/forajxpro2/:id', (req, res) => {
    User2.find({ "_id": req.params.id }, (err, details) => {
        if (err) {
            //   console.log(err.stack,"debug");
        } else {
            res.render('editforpro2', { details: details })
            // .json(details)
            console.log(details)
        }
    })
})

app.get('/isactivate/:id', (req, res) => {
    var id = req.params.id;
    User.findById(req.params.id, (err, docs) => {
        if (!err) {
            if (docs.isactive) {
                User.findByIdAndUpdate(id, { isactive: false }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {

                        req.flash(
                            'success_msg',
                            ' Deactivated'
                        );
                        res.redirect('/products/1')
                        console.log('deativted');
                    }
                })
            } else {
                User.findByIdAndUpdate(id, { isactive: true }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {
                        req.flash(
                            'success_msg',
                            ' Activated'
                        );
                        res.redirect('/products/1')
                        console.log('activted');
                    }
                })
            }
            console.log(docs.isactive)
        }
    })

})
app.get('/isactivateforajx/:id', (req, res) => {
    var id = req.params.id;
    User.findById(req.params.id, (err, docs) => {
        if (!err) {
            if (docs.isactive) {
                User.findByIdAndUpdate(id, { isactive: false }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {

                        req.flash(
                            'success_msg',
                            ' Deactivated'
                        );
                        res.redirect('/sec/forajx')
                        console.log('deativted');
                    }
                })
            } else {
                User.findByIdAndUpdate(id, { isactive: true }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {
                        req.flash(
                            'success_msg',
                            ' Activated'
                        );
                        res.redirect('/sec/forajx')
                        console.log('activted');
                    }
                })
            }
            console.log(docs.isactive)
        }
    })

})
app.get('/isactivateforajx/pro2/:id', (req, res) => {
    var id = req.params.id;
    User2.findById(req.params.id, (err, docs) => {
        if (!err) {
            if (docs.isactive) {
                User2.findByIdAndUpdate(id, { isactive: false }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {

                        req.flash(
                            'success_msg',
                            ' Deactivated'
                        );
                        res.redirect('/sec/forajxprdct2')
                        console.log('deativted');
                    }
                })
            } else {
                User2.findByIdAndUpdate(id, { isactive: true }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {
                        req.flash(
                            'success_msg',
                            ' Activated'
                        );
                        res.redirect('/sec/forajxprdct2')
                        console.log('activted');
                    }
                })
            }
            console.log(docs.isactive)
        }
    })

})





// Post request which will handle db of Fav list
app.post("/:id/:list", async (req, res) => {
    // res.send("working");

    try {
        if (req.params.list == '1') {
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
                var DeletedItem = await Favorite.findOneAndDelete({ objId: req.params.id });
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

        }
        else {
            //Pulling out the item form the db
            const item = await User2.findById(req.params.id);
            //Check if it exists in fav item
            const favExists = await Favorite.findOne({ objId: req.params.id });
            console.log(favExists, "favExists");
            //If it  exist in fav db
            if (favExists) {
                console.log("favExists");
                //If it exists in fav db then make the flag false
                const unFavorite = await User2.findByIdAndUpdate(
                    req.params.id,
                    {
                        favorite: false,
                    },
                    { new: true }
                );
                //Delete from favlist
                var DeletedItem = await Favorite.findOneAndDelete({ objId: req.params.id });
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
                const updateFlag = await User2.findByIdAndUpdate(
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

//  cart post route for product 1
app.post("/new/api/for/:id", async (req, res) => {
    // res.send("working");
    try {
        //Pulling out the item form the db
        console.log("prams id", req.params.id);
        const item = await User.findById(req.params.id);
        console.log("item id", item._id);
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

                price: item.price,
                brand: item.brand,
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

//  cart post route for product 1 
app.post("/new/api/for/product2/:id/:list", async (req, res) => {
    // res.send("working");

    try {
        if (req.params.list == '1') {

            console.log("prams id", req.params.id);
            const item = await User.findById(req.params.id);
            console.log("item id", item._id);
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

                    price: item.price,
                    brand: item.brand,
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
        }
        else {
            console.log("prams id", req.params.id);
            const item = await User2.findById(req.params.id);
            console.log("item id", item._id);
            //Check if it exists in Cart item
            const cartExists = await Cart.findOne({ objId: req.params.id });
            console.log(cartExists, "cartExists");
            //If it  exist in Cart db
            if (cartExists) {
                console.log("item in cart Exists");
                //If it exists in cart db then make the flag false
                const increaseQuantity = await User2.findByIdAndUpdate(
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

                    price: item.price,
                    brand: item.brand,
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
        }
        //Pulling out the item form the db

    } catch (error) {
        res.status(400).json({ msg: "something went wrong", err: error });

        console.log(error.stack);
    }
});

///get all cart items
app.get("/new/api/getdetails", async (req, res) => {
    try {
        const cartItems = await Cart.find({});
        res.status(200).json(cartItems);
    } catch (err) {
        res.status(400).json(err);
    }
});
//delete from cart
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
app.get('/new/api/onedata/:id', (req, res) => {
    User.findById(req.params.id)
        .then((data) => {
            res.status(200).json(data)
        }).catch((err) => {
            console.log(err)
            res.status(400).json(err)
        })
})


/// routes for second crousel

app.get('/second/:id', (req, res) => {
    var perPage = 5
    var page = req.params.id || 1
    var s = (perPage * page) - perPage

    User2.find({})
        .skip(s)
        .limit(perPage)
        .sort({ _id: -1 })
        .exec(function (err, details) {
            User2.countDocuments().exec(function (err, count) {
                if (err) return next(err)
                res.render('all2', {
                    details: details,
                    current: page,
                    active: 'Activate',
                    pages: Math.ceil(count / perPage),
                    viewall: false,
                    success_msg: req.flash('success_msg')
                })
            })
        })
})

app.get('/second/delete/:id', (req, res) => {

    User2.findByIdAndDelete(req.params.id, (err, result) => {
        if (err) throw console.log(err)
        else {
            req.flash(
                'success_msg',
                'Product Deleted Successfully'
            );
            res.redirect('/second/1');
            console.log('deleted');
        }
    })
});

app.get('/sec/:id', (req, res) => {
    console.log('edit')
    User2.find({ "_id": req.params.id }, (err, details) => {
        if (err) {
            //   console.log(err.stack,"debug");
        } else {
            res.render('edit2', { details: details })
            // .json(details)
            console.log(details)
        }
    })
})

app.post('/sec/update/2', upload.single('myfile'), (req, res) => {
    if (req.file) {
        (async () => {

            hostedimage = '';
            try {


                //upload a file to the bucket using multer
                filetobeuploded = req.file.path
                console.log("this is file path", req.file.path)
                let uuid = uuidv4()
                await storage.bucket(bucketName).upload(filetobeuploded, {
                    gzip: true,

                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                        cacheControl: 'public, max-age=31536000',
                    },

                }).then((data) => {

                    let file = data[0];

                    // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                    console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                    hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;

                    let name = req.body.name
                    let price = req.body.price
                    let brand = req.body.brand
                    let image = hostedimage
                    let title = req.body.title
                    let description = req.body.description
                    let id = req.body.id;

                    // image: { 
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
                    //     contentType: 'image/png'
                    // }  

                    // console.log("this is object ",obj);
                    User2.findByIdAndUpdate(id, { name: name, price: price, brand: brand, image: image, title: title, description: description },
                        function (err, docs) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                req.flash(
                                    'success_msg',
                                    'Updated Successfully'
                                );
                                res.redirect('/second/1');
                                console.log("Updated User");
                            }
                        });



                });

                //  console.log(`${filetobeuploded} uploaded to ${bucketName}.`);
                //  return res.status(200);


            }
            catch (error) {
                console.log("mine debug=>", error.stack);
                return res.status(500).send(error)
            }

        })();
    }
    else {
        let name = req.body.name
        let price = req.body.price
        let brand = req.body.brand
        let title = req.body.title
        let description = req.body.description
        let id = req.body.id;
        User2.findByIdAndUpdate(id, { name: name, price: price, brand: brand, title: title, description: description },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    req.flash(
                        'success_msg',
                        'Updated Successfully'
                    );
                    res.redirect('/second/1');
                    console.log("Updated User");
                }
            });

    }

})

app.get('/isactivatesecond/:id', (req, res) => {
    var id = req.params.id;
    User2.findById(req.params.id, (err, docs) => {
        if (!err) {
            if (docs.isactive) {
                User2.findByIdAndUpdate(id, { isactive: false }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {

                        req.flash(
                            'success_msg',
                            ' Deactivated'
                        );
                        res.redirect('/second/1')
                        console.log('deativted');
                    }
                })
            }
            else {
                User2.findByIdAndUpdate(id, { isactive: true }, (e, d) => {
                    if (e) {
                        console.log(e)
                    } else {
                        req.flash(
                            'success_msg',
                            'Activated '
                        );
                        res.redirect('/second/1')
                        console.log('activted');
                    }
                })
            }
            console.log(docs.isactive)
        }
    })

})
app.post("/google/up/2", upload.single('myfile'), (req, res) => {

    (async () => {

        hostedimage = '';
        try {


            //upload a file to the bucket using multer
            filetobeuploded = req.file.path
            let uuid = uuidv4()
            await storage.bucket(bucketName).upload(filetobeuploded, {
                gzip: true,

                metadata: {
                    firebaseStorageDownloadTokens: uuid,
                    cacheControl: 'public, max-age=31536000',
                },

            }).then((data) => {

                let file = data[0];
                console.log("this is url", url("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid))
                // return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(req.file.name) + "?alt=media&token=" + uuid);
                console.log("https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
                hostedimage = "https://firebasestorage.googleapis.com/v0/b/" + "fir-crud-restapi-ac1a1.appspot.com" + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;
                var obj = {
                    name: req.body.name,
                    price: req.body.price,
                    brand: req.body.brand,
                    image: hostedimage,
                    title: req.body.title,
                    description: req.body.description,

                    // image: { 
                    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
                    //     contentType: 'image/png'
                    // }  
                }
                // console.log("this is object ",obj);
                User2.create(obj, (err, item) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        item.save();
                        req.flash(
                            'success_msg',
                            'Added Successfully'
                        );
                        console.log('product added');
                        res.redirect('/second/1');
                    }
                });
                console.log(obj)


            });

            console.log(`${filetobeuploded} uploaded to ${bucketName}.`);
            //  return res.status(200);


        }
        catch (error) {
            console.log("mine debug=>", error.stack);
            return res.status(500).send(error)
        }

    })();
})


app.get('/api/user2/alldetails', (req, res) => {

    User2.find({}, (err, details) => {
        if (err) {
            console.log(err)
        } else {
            res.status(200).json(details);
            // res.render('all',{details:details})
            // // .json(details)
            // console.log(details)
        }
    })
})
// app.post("/sd",upload.single('myfile'),(req,res)=>{

//    console.log('right route')



// })

const PORT = process.env.PORT || 7000;
app.listen(PORT, console.log(`server started at port ${PORT}`));
