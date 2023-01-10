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
    if(req.method === 'PUT'){

        if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
        const { username, email, password, dietPreference, public_id } = req.body;
        //console.log(req.body)


        //hash password
        let errors: boolean = false
        const filter = { email };
        const update = {username, email, password: await hash(password, 12), dietPreference, image: public_id };

        let err = await Users.findOneAndUpdate(filter, update, {
          new: true
        }).catch(err => {err = err, errors = true}); //, (err, doc) => {errs = err, errors = true});
        //const newUser = new Users({ username, email, password: await hash(password, 12), dietPreference, image: public_id })
        //await newUser.save()
        //let err = await newUser.save().catch(err => {err = err, errors = true});

        let updatedUser = await Users.findOne({email})

        if (errors) {
          console.log(err)
          return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
        } else {
          console.log(updatedUser)
          res.status(201).json({ message: `User ${updatedUser.username} updated successfuly!`, status : true, user: updatedUser})
        }
    } else{
      res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
    }

}