const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')
const Joi = require('joi')



const schemaValidation=Joi.object({

      email: Joi.string()
      .required()
      .messages({
        'any.required': 'Le champ Email est requis',
        'string.empty': 'Le champ Email ne peut pas être vide',
      }),
    
      password: Joi.string()
      .required()
    .messages({
      'any.required': 'Le champ Mot de passe est requis',
      'string.empty': 'Le champ Mot de passe ne peut pas être vide',
    }),
});


let schemaAdmin=mongoose.Schema({
    username:String,
    email:String,
    password:String,
})

var url ="mongodb://localhost:27017/autism"

var Admin=mongoose.model('admin',schemaAdmin)


exports.registerAdmin=(username,email,password)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url).then(()=>{
            return Admin.findOne({email:email})
        }).then((doc)=>{
            if(doc){
                mongoose.disconnect()
                reject('this email is exist')
            } else {
               bcrypt.hash(password,10).then((hashedPassword)=>{
                 let user= new Admin({
                    username:username,
                    email:email,
                    password:hashedPassword,
                 })
                 user.save().then((doc)=>{
                    mongoose.disconnect()
                    resolve(user)
                 }).catch((err)=>{
                    mongoose.disconnect()
                    reject(err)
                 })
               }).catch((err)=>{
                mongoose.disconnect()
                reject(err)

            })
            }
        })
    })
}
var privateKey="this is my secret key bnbnbnbnb"

exports.loginAdmin=(email,password)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url).then(()=>{
            let validation = schemaValidation.validate({email:email,password: password})
                if(validation.error){
                    reject(validation.error.details[0].message)}
            return Admin.findOne({email:email})
            
        }).then((user)=>{
            if(!user){
               mongoose.disconnect()
               reject('adresse e-mail ou mot de passe invalide')
            } else{
               bcrypt.compare(password,user.password).then((same)=>{
                   if(same){
                    //send token
                   let token = jwt.sign({id:user._id,username:user.username},privateKey,{
                            expiresIn:'1h',
                        }) 
                        mongoose.disconnect()
                        resolve({token:token,role:'Admin',username:user.username})

                   }else{
                      mongoose.disconnect()
                      reject('adresse e-mail ou mot de passe invalide')
                   }
               }).catch((err)=>{
                mongoose.disconnect()
                reject(err)
               })
            }
        })
            
     })
    
}


exports.admin=()=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
            return Admin.find()
         
         }).then((doc)=>{
                
           //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}


exports.getadmin=(id)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
            return Admin.findById(id) 
                                        
         }).then((doc)=>{
                
            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}


exports.updateAdmin=(id,username,email)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
            return Admin.updateOne({_id:id},{username:username,email:email})  
                                        
         }).then((doc)=>{
                
            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}



/*exports.password=(id,currentPassword, newPassword)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{      

           // const user = Admin.findById(id);
            //const currentPasswordMatch =  bcrypt.compare(currentPassword, Admin.findById(id).password);
            if(bcrypt.compareSync(currentPassword, Admin.findById(id).password)){
            bcrypt.hash(newPassword,10).then((hashedNewPassword)=>{
                return Admin.updateOne({_id:id},{password:hashedNewPassword})
                })
                //const hashedNewPassword = bcrypt.hash(newPassword, 10);
                //return Admin.updateOne({_id:id},{password:hashedNewPassword}) 
            
            
            }              
         }).then((doc)=>{

            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}*/


exports.password=(id,currentPassword, newPassword)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{      

            return Admin.findById(id)


         }).then((user)=>{
            if(!user){
               
               reject('invalid admin')
            } else{
               bcrypt.compare(currentPassword,user.password).then((same)=>{
                   if(same){
                    //send token
                    bcrypt.hash(newPassword,10).then((hashedNewPassword)=>{
                        return Admin.updateOne({_id:id},{password:hashedNewPassword})
                        })
                        
                        resolve('mot de passe modifier avec succes')

                   }else{
                      
                      reject('verifier votre ancienne mot de passe')
                   }
               }).catch((err)=>{
                mongoose.disconnect()
                reject(err)
               })
            }
        })
    })
}