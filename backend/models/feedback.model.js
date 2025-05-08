const mongoose=require('mongoose')
const Joi = require('joi')

const schemaValidation=Joi.object({
    description: Joi.string().min(8).required().messages({
     'any.required': 'The Description field is required',
     'string.empty': 'The Description field cannot be empty',
     'string.min': 'The Description field must contain at least 8 characters'

      })
    });

    const schemaValidUpdate=Joi.object({
      description: Joi.string().min(8).required().messages({
        'any.required': 'The Description field is required',
        'string.empty': 'The Description field cannot be empty',
        'string.min': 'The Description field must contain at least 8 characters'
})

        });


var url='mongodb://localhost:27017/chatbot'
let schemaFeedback=mongoose.Schema({
    description:String,

    idUser:String,

    date:{  type: Date, default: Date.now},
    
})

var Feedback=mongoose.model('feedback',schemaFeedback)

exports.testConnect=()=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
            mongoose.disconnect()
             resolve('connected !')
         
         }).catch((err)=>{reject(err)})
    })
}


//post feedback
exports.postNew=(description,idUser,date)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url).then(()=>{ 

          let validation = schemaValidation.validate({description:description})
          if(validation.error){
            mongoose.disconnect()
            reject(validation.error.details[0].message)
          }
   
    
    let feed=new Feedback({
        description:description,
        
        idUser:idUser,
        
        date:date,
        
    })

    feed.save().then((docs)=>{
        mongoose.disconnect()
        resolve(docs)
    
    }).catch((err)=>{
        
        mongoose.disconnect()
        reject(err)
    })

   

            })
        
    })

}

//get service
// exports.getServices=()=>{
//     return new Promise((resolve,reject)=>{
//         mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
//             return Service.find()
         
//          }).then((doc)=>{
                
//            //mongoose.disconnect()
//             resolve(doc)
        
//         }).catch(err=>{
            
//             mongoose.disconnect()
//             reject(err)
//         })
//     })
// }

// exports.getOneService=(id)=>{
//     return new Promise((resolve,reject)=>{
//         mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
//             return Service.findById(id) 
                                        
//          }).then((doc)=>{
                
//             //mongoose.disconnect()
//             resolve(doc)
        
//         }).catch(err=>{
            
//             mongoose.disconnect()
//             reject(err)
//         })
//     })
// }

//afficher service by idUser
exports.getFeedbackbyIdUser=(id)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url).then(()=>{         
            
            return Feedback.find({idUser:id}) 
                                        
         }).then((doc)=>{
                
            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}


//delete service

exports.deleteOneFeedback=(id)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
            return Feedback.deleteOne({_id:id})  

         }).then((doc)=>{
                
            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}



// // update service


// exports.updateService = (id, nomService, nomEtablissement, gouvernorat, longitude, latitude, adresse, image, description, jourFermeture, email, telephone) => {
//     return new Promise((resolve, reject) => {
//       mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
//         // Vérification si l'email et le nom d'établissement ont été modifiés
//         return Service.findById(id).select('email nomEtablissement');
//       }).then((service) => {
//         const isEmailModified = email !== service.email;
//         const isNomEtablissementModified = nomEtablissement !== service.nomEtablissement;
  
//         if (isEmailModified) {
//           // Vérification si un autre service utilise déjà cet email
//           return Service.findOne({ email: email });
//         } else if (isNomEtablissementModified) {
//           // Vérification si un autre service utilise déjà ce nom d'établissement
//           return Service.findOne({ nomEtablissement: nomEtablissement });
//         } else {
//           return Promise.resolve(null);
//         }
//       }).then((existingService) => {
//         if (existingService) {
//           mongoose.disconnect();
//           if (existingService.email === email) {
//             reject('Un autre service utilise déjà cet email');
//           } else if (existingService.nomEtablissement === nomEtablissement) {
//             reject('Un autre service utilise déjà ce nom d\'établissement');
//           }
//         } else {
//           let validation = schemaValidUpdate.validate({
//             nomService: nomService,
//             nomEtablissement: nomEtablissement,
//             gouvernorat: gouvernorat,
//             longitude: longitude,
//             latitude: latitude,
//             adresse: adresse,
//             description: description,
//             jourFermeture: jourFermeture,
//             email: email,
//             telephone: telephone
//           });
  
//           if (validation.error) {
//             mongoose.disconnect();
//             reject(validation.error.details[0].message);
//           }
  
//           return Service.updateOne({ _id: id }, {
//             nomService: nomService,
//             nomEtablissement: nomEtablissement,
//             gouvernorat: gouvernorat,
//             longitude: longitude,
//             latitude: latitude,
//             adresse: adresse,
//             image: image,
//             description: description,
//             jourFermeture: jourFermeture,
//             email: email,
//             telephone: telephone
//           });
//         }
//       }).then((doc) => {
//         filename = '';
//         resolve(doc);
//       }).catch((err) => {
//         mongoose.disconnect();
//         reject(err);
//       });
//     });
//   }











// update service

/*exports.updateService=(id,nomService,nomEtablissement,gouvernorat,longitude,latitude,adresse,image,description,jourFermeture,email,telephone)=>{
    return new Promise((resolve,reject)=>{

        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{         
            
            let validation = schemaValidation.validate({nomService:nomService,nomEtablissement:nomEtablissement,gouvernorat:gouvernorat,
                longitude:longitude,latitude:latitude,adresse:adresse,description:description,
                jourFermeture:jourFermeture,email:email,telephone:telephone})

            if(validation.error){
                mongoose.disconnect()
                reject(validation.error.details[0].message)
            }

            return Service.updateOne({_id:id},{nomService:nomService, nomEtablissement:nomEtablissement,gouvernorat:gouvernorat,longitude:longitude,latitude:latitude,adresse:adresse,image:image,description:description,jourFermeture:jourFermeture,email:email,telephone:telephone})  
                                        
         }).then((doc)=>{
            filename ='';
            //mongoose.disconnect()
            resolve(doc)
        
        }).catch(err=>{
            
            mongoose.disconnect()
            reject(err)
        })
    })
}*/

