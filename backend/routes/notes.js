const express = require('express')
const router = express.Router()
const Note = require('../models/Note')
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
//Route 1 Get all the notes using get
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {
        
   
    const notes = await Note.find({user:req.user.id})  
    res.json(notes)
} catch (error) {
    console.error(error.message);   
    res.status(500).send("Internal Error Occoured")  
}
})
//Route 2 Add a new notes using POST
router.post('/addnote',fetchuser,
[
    body('title','Enter a valid title').isLength({ min: 3 }),
    body('description','It must be atleast 5 characters').isLength({ min: 5 }),
],async (req,res)=>{
    try {

    const {title,description,tag,} = req.body; //this is called destructuring
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note =  new Note({
       title,description,tag, user:req.user.id
    })
    const savedNote = await note.save()
    res.json(savedNote)
            
} catch (error) {
    console.error(error.message);   
    res.status(500).send("Internal Error Occoured")  
}
})
//Update an existing node Login Required using POST  routing it to /api/auth/updatenote

    


router.put('/updatenote/:id',fetchuser,async (req,res)=>{
    const {title,description,tag} = req.body;
    //Create a newNote object
    try {
    const newNote = {};
    if(title){newNote.title = title}
    if(description){newNote.description = description}
    if(tag){newNote.tag = tag}
    //Find the notes to be updated and update it
    let note = await Note.findById(req.params.id)
    if(!note){return res.status(404).send("Not Found")}
    if(note.user.toString()!== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Note.findByIdAndUpdate(req.params.id,{$set: newNote},{new:true}) //note will be updated
    res.json({note});
} catch (error) {
    console.error(error.message);   
    res.status(500).send("Internal Error Occoured") 
}
})
//Deleting a note
router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
    
    try {
        
    
    //Find the notes to be updated and update it
    let note = await Note.findById(req.params.id)
    if(!note){return res.status(404).send("Not Found")}
    //Allow deletion only if user owns this note
    if(note.user.toString()!== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Note.findByIdAndDelete(req.params.id) //note will be deleted
    res.json({"Success":"Note has been deleted",note:note});
} catch (error) {
    console.error(error.message);   
    res.status(500).send("Internal Error Occoured") 
}
})
module.exports = router