const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')
const Joi = require('joi')


const schemaValidation=Joi.object({
    
    nom: Joi.string()
    .min(3)
    .required()
    .messages({
      'any.required': 'The Name field is required',
      'string.empty': 'The Name field cannot be empty',
     'string.min': 'The Name field must contain at least 3 characters'

    }),

      email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'any.required': 'The Email field is required',
        'string.empty': 'The Email field cannot be empty',
        'string.email': 'The Email field must be a valid email address'

      }),
    
      password: Joi.string()
      .required()
    .min(8)
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .messages({
      'any.required': 'The Password field is required',
      'string.empty': 'The Password field cannot be empty',
      'string.min': 'The Password field must contain at least 8 characters',
      'string.pattern.base': 'The Password field must contain at least one letter and one number'
}),
    password2: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.required': 'The Password Confirmation field is required',
      'string.empty': 'The Password Confirmation field cannot be empty',
      'any.only': 'The Password Confirmation field must match the password'
 })
});

const loginschemaValidation=Joi.object({

    email: Joi.string()
    .required()
    .messages({
      'any.required': 'The Email field is required',
      'string.empty': 'The Email field cannot be empty'

    }),
  
    password: Joi.string()
    .required()
  .messages({
    'any.required': 'The Password field is required',
    'string.empty': 'The Password field cannot be empty'

  }),
});
let schemaUser=mongoose.Schema({
    nom:String,
    email:String,
    password:String,  
})

var url ="mongodb://localhost:27017/chatbot"

var User=mongoose.model('user',schemaUser)

exports.register=(nom,email,password,password2)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url).then(()=>{
            return User.findOne({email:email})
        }).then((doc)=>{
            if(doc){
                mongoose.disconnect()
                reject('This email address already exists')
            } else {
                let validation = schemaValidation.validate({nom:nom,email:email,password: password, password2:password2})
                if(validation.error){
                    mongoose.disconnect()
                    reject(validation.error.details[0].message)
                }

               bcrypt.hash(password,10).then((hashedPassword)=>{
                 let user= new User({
                    nom:nom,
                    email:email,
                    password:hashedPassword,
                    password2:password2
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

exports.login=(email,password)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url).then(()=>{


            let validation = loginschemaValidation.validate({email:email,password: password})
                if(validation.error){
                    reject(validation.error.details[0].message)}

            return User.findOne({email:email})
            
        }).then((user)=>{
            if(!user){
               mongoose.disconnect()
               reject('Invalid email address or password')
            } else{
               bcrypt.compare(password,user.password).then((same)=>{
                   if(same){
                    //send token
                   let token = jwt.sign({id:user._id,nom:user.nom,email:user.email,role:'User'},privateKey,{
                            expiresIn:'1h',
                        }) 
                        mongoose.disconnect()
                        resolve({token:token,id:user._id,nom:user.nom,email:user.email,role:'User'})

                   }else{
                      mongoose.disconnect()
                      reject('Invalid email address or password')
                   }
               }).catch((err)=>{
                mongoose.disconnect()
                reject(err)
               })
            }
        })
            
     })
    
}

// exports.parent=()=>{
//     return new Promise((resolve,reject)=>{
//         mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
//             return Parent.find()
         
//          }).then((doc)=>{
                
//            //mongoose.disconnect()
//             resolve(doc)
        
//         }).catch(err=>{
            
//             mongoose.disconnect()
//             reject(err)
//         })
//     })
// }

exports.getuser=(id)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
            return User.findById(id) 
                                        
         }).then((doc)=>{
                
            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}

exports.updateUser=(id,nom,email)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
            return User.updateOne({_id:id},{nom:nom,email:email})  
                                        
         }).then((doc)=>{
                
            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}


exports.updatepassword=(id,currentPassword,newPassword)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{      

            return User.findById(id)


         }).then((user)=>{
            if(!user){
               
               reject('Invalid account')
            } else{
               bcrypt.compare(currentPassword,user.password).then((same)=>{
                   if(same){
                    //send token
                    bcrypt.hash(newPassword,10).then((hashedNewPassword)=>{
                        return User.updateOne({_id:id},{password:hashedNewPassword})
                        })
                        
                        resolve('Password changed successfully')

                   }else{
                      
                      reject('Please verify your old password')
                   }
               }).catch((err)=>{
                mongoose.disconnect()
                reject(err)
               })
            }
        })
    })
}

// exports.deleteParent=(id)=>{
//     return new Promise((resolve,reject)=>{
//         mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
//             return Parent.deleteOne({_id:id})  

//          }).then((doc)=>{
                
//             //mongoose.disconnect()
//             resolve(doc)
        
//         }).catch(err=>{
            
//             mongoose.disconnect()
//             reject(err)
//         })
//     })
// }


// exports.updatepassword=(id,currentPassword,newPassword)=>{
//     return new Promise((resolve,reject)=>{
//         mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{      

//             return Parent.findById(id)


//          }).then((user)=>{
//             if(!user){
               
//                reject('invalid compte')
//             } else{
//                bcrypt.compare(currentPassword,user.password).then((same)=>{
//                    if(same){
//                     //send token
//                     bcrypt.hash(newPassword,10).then((hashedNewPassword)=>{
//                         return Parent.updateOne({_id:id},{password:hashedNewPassword})
//                         })
                        
//                         resolve('mot de passe modifier avec succes')

//                    }else{
                      
//                       reject('verifier votre ancienne mot de passe')
//                    }
//                }).catch((err)=>{
//                 mongoose.disconnect()
//                 reject(err)
//                })
//             }
//         })
//     })
// }