const express = require('express')
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'shivak@fhfhal'


//ROUTE 1: Creating a user using POST with /api/auth doesn't require authentication

router.post('/createuser',[
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password').isLength({ min: 5 }),
],
async (req,res)=>{
    
    //returns errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check whether user exists already
    try{
   
   
    let user = await User.findOne({email: req.body.email })
    if(user){
        return res.status(400).json({error: "Sorry user with following email already exists!"})
    }
    const salt = await bcrypt.genSalt(10);
   const secPass= await bcrypt.hash(req.body.password,salt) 
 //Create a new user
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })
      const data = {
        user:{
            id:user.id
        }
      }
      const authToken = jwt.sign(data,JWT_SECRET);
      //console.log(authToken);

    //res.json(user);
    res.json({authToken});
}catch(error){
    console.error(error.message);   
    res.status(500).send("Internal Error Occoured")    
}
    
})
//ROUTE 2: Authenticate a user
router.post('/login',[
    
    body('email','Enter a valid email').isEmail(),
    body('password','Password can not be empty').exists(),

],
async (req,res)=>{
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email,password} = req.body;
    try {
        let user = await User.findOne({email})
        if(!user){
            success=false
            return res.status(400).json({error:"Please try to login with correct credentials"})
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            success=false
           return res.status(400).json({success,error:"Please try to login with correct credentials"})
        }
        const data = {
            user:{
                id:user.id
            }
          }
          const authToken = jwt.sign(data,JWT_SECRET);
          success = true;
          res.json({success , authToken})
    } catch (error) {
        console.error(error.message);   
        res.status(500).send("Internal error occour") 
    }
})
// ROUTE 3: GET details about  loggedin user using POST "api/auth/getuser" login required
router.post('/getuser',fetchuser,     //fetchuser will act as a middleware to fetch the data of the user
async (req,res)=>{
try {
     userId = req.user.id;
    const user =await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message);   
    res.status(500).send("Internal error occour")
}
})



module.exports = router