const express=require('express')
const adminRoute =require('./routers/admin.routers')
const feedbackRoute=require('./routers/feedback.route')
const userRoute = require('./routers/user.route')


const app=express()

app.use(express.json()) //c'est le body parser
app.use(express.urlencoded({extended:true})) //data depuis form


//vid 73
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin',"*")
    res.setHeader('Access-Control-Request-Method',"*")
    res.setHeader('Access-Control-Allow-Headers',"*")
    res.setHeader('Access-Control-Allow-Methods',"*")
    res.setHeader('Access-Control-Request-Headers',"*")
    
    next()
})



app.use('/',feedbackRoute)
app.use('/admin',adminRoute)
app.use('/user',userRoute)





app.listen(3000,()=>console.log('server run on port 3000'))