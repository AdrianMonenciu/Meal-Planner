import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    connectMongo()
    

    // try {
    //   connectMongo();
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).json({ message: 'Internal server error' });
    // }

    // only post method is accepted
    if(req.method === 'POST'){

        if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
        const { test } = req.body;
        //console.log(req.body)

        

        // //hash password
        // let errors: boolean = false
        // const newUser = new Users({ username, email, password: await hash(password, 12), dietPreference, image: public_id })
 
        // //console.log(newUser)
        // let err = await newUser.save().catch(err => {err = err, errors = true});

        // const MyModel = mongoose.model('MyModel', mySchema);
        // MyModel.updateMany({}, { $set: { newVariable: '' } }, (err, res) => {
        //   console.log(res);
        // });

        let updatedUsers, errorsComp
        let errors: boolean = false 

        Users.updateMany({}, { $set: { noDiet: false } }, (err, res) => {
          if (err) {
            errors = true;
            errorsComp = err;
            console.log(err)
          } else {
            console.log(res);
            updatedUsers = res;
          }
          
        })


        if (errors) {
          console.log(errorsComp)
          return res.status(404).json({ message: `Error connecting to the database: ${errorsComp}`, errorsComp });
        } else {
          console.log(updatedUsers)
          res.status(201).json({ message: `Users updated successfuly!`, status : true, user: updatedUsers})
        }
    } else{
      res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
    }

}