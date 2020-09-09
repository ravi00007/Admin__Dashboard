const express =require('express');
const app = express()
const router=express.Router();


router.get('/ro',(req,res)=>{
    res.send('it working');
})