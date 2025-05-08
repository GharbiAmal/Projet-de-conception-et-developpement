const route = require ('express').Router()

const adminModel = require('../models/admin.model')

route.post('/register',(req,res)=>{
    adminModel.registerAdmin(req.body.username,req.body.email,req.body.password)
    .then((user)=>res.status(200).json({user:user,msg:'added'}))
    .catch((err)=>res.status(400).json({error:err}))

})

route.post('/login',(req,res)=>{
    adminModel.loginAdmin(req.body.email,req.body.password)
    .then((doc)=>res.status(200).json(doc))
    .catch((err)=>res.status(400).json({error:err}))

})



route.get('/getadmin',(req,res,next)=>{
    
    adminModel.admin()
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})


route.get('/getadmin/:id',(req,res,next)=>{
    
    adminModel.getadmin(req.params.id)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})

route.patch('/updateAdmin/:id',(req,res,next)=>{
    adminModel.updateAdmin(req.params.id,req.body.username,req.body.email)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})

route.patch('/updatePassword/:id',(req,res,next)=>{
    adminModel.password(req.params.id,req.body.currentPassword,req.body.newPassword)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})

module.exports=route
