const route = require ('express').Router()

const userModel = require('../models/user.model')

route.post('/register',(req,res)=>{
    userModel.register(req.body.nom,req.body.email,req.body.password,req.body.password2)
    .then((user)=>res.status(200).json({user:user,msg:'added'}))
    .catch((err)=>res.status(400).json({error:err}))

})
route.post('/login',(req,res)=>{
    userModel.login(req.body.email,req.body.password)
    .then((doc)=>res.status(200).json(doc))
    .catch((err)=>res.status(400).json({error:err}))

})

// route.get('/getallparent',(req,res,next)=>{
    
//     parentModel.parent()
//     .then((doc)=>res.status(200).json(doc)) 
//     .catch((err)=>res.status(400).json(err))
//   })

route.get('/getuser/:id',(req,res,next)=>{
    
    userModel.getuser(req.params.id)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})

route.patch('/updateUser/:id',(req,res,next)=>{
    userModel.updateUser(req.params.id,req.body.nom,req.body.email)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})

// route.delete('/deleteParent/:id',(req,res,next)=>{
//     parentModel.deleteParent(req.params.id)
//     .then((doc)=>res.status(200).json(doc)) 
//     .catch((err)=>res.status(400).json(err))
//   })

  route.patch('/updatePassword/:id',(req,res,next)=>{
    userModel.updatepassword(req.params.id,req.body.currentPassword,req.body.newPassword)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})

module.exports=route