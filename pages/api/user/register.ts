import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
  connectMongo()
    
  // only post method is accepted
  if(req.method === 'POST'){

    if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
    const { username, email, password, noDiet, dietPreference, public_id } = req.body;
    //console.log(req.body)

    // check duplicate email
    const checkExistingEmail = await Users.findOne({ email });
    if(checkExistingEmail) {
      return res.status(422).json({ message: "Email Already Exists...!"})
    }

    // check duplicate usersname
    const checkExistingUsername = await Users.findOne({ username });
    if(checkExistingUsername) {
      return res.status(422).json({ message: "Username Already Exists...!"})
    }

    //hash password
    let errors: boolean = false
    const newUser = new Users({ username, email, password: await hash(password, 12), noDiet, dietPreference, image: public_id })
 
    let err = await newUser.save().catch(err => {err = err, errors = true});

    if (errors) {
      return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
    } else {
      res.status(201).json({ message: `User ${newUser.username} created successfuly!`, status : true, user: newUser})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}