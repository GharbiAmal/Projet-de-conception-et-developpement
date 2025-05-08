const route=require('express').Router()
const feedbackModel=require('../models/feedback.model')
const jwt = require('jsonwebtoken')






route.post('/createfeedback',(req,res,next)=>{
    feedbackModel.postNew(req.body.description,req.body.idUser,req.body.date)
    .then((doc)=>res.status(200).json(doc))  
    .catch((err)=>res.status(400).json(err)) 
})

// route.get('/touservices',(req,res,next)=>{
    
//     serviceModel.getServices()
//     .then((doc)=>res.status(200).json(doc)) 
//     .catch((err)=>res.status(400).json(err))
// })

// route.get('/service/:id',(req,res,next)=>{
    
//     serviceModel.getOneService(req.params.id)
//     .then((doc)=>res.status(200).json(doc)) 
//     .catch((err)=>res.status(400).json(err))
// })

route.get('/onefeedbackbyuser/:id',(req,res,next)=>{
    
    feedbackModel.getFeedbackbyIdUser(req.params.id)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})



route.delete('/deleteFeedback/:id',(req,res,next)=>{
    feedbackModel.deleteOneFeedback(req.params.id)
    .then((doc)=>res.status(200).json(doc)) 
    .catch((err)=>res.status(400).json(err))
})

// route.patch('/updateService/:id',upload.any('image'),(req,res,next)=>{
//     if(filename.length > 0){
//         req.body.image = filename
//     }
//     serviceModel.updateService(req.params.id,req.body.nomService,req.body.nomEtablissement,
//         req.body.gouvernorat,req.body.longitude,req.body.latitude,req.body.adresse,req.body.image,
//         req.body.description,req.body.jourFermeture,req.body.email,req.body.telephone)
//     .then((doc)=>res.status(200).json(doc)) 
//     .catch((err)=>res.status(400).json(err))
// })

// route.get('/getbyiduser/:idUser',(req,res)=>{
//     serviceModel.getOneByIduser(req.params.idUser)
//     .then((doc)=>res.status(200).json(doc)) 
//     .catch((err)=>res.status(400).json(err))
// })


module.exports=route