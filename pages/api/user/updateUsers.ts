import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    connectMongo()
    
    const session = await unstable_getServerSession(req, res, authOptions)
    //console.log(session)

    // only post method is accepted
    if(req.method === 'PUT'){
      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { username, userRole } = req.body;

      let errors: boolean = false
      const filter = { username };
      const update = { userRole };

      let err = await Users.findOneAndUpdate(filter, update, {
        new: true
      }).catch(err => {err = err, errors = true}); 

      let updatedUser = await Users.findOne({username})

      if (errors) {
        console.log(err)
        return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
      } else {
        res.status(201).json({ message: `User ${updatedUser.username} updated successfuly to role: ${updatedUser.userRole}!`, status : true, user: updatedUser})
      }

    } else if (req.method === 'DELETE') {

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { username} = req.body;

      let errors: boolean = false
      const filter = { username };
      let mongooseErr

      const deletedUser = Users.findOneAndDelete((filter), function (err, docs) {
        if (err){
          console.log(err)
          mongooseErr = err
          errors = true
        }
     })   

      if (errors) {
        console.log(mongooseErr)
        return res.status(404).json({ message: `Error connecting to the database: ${mongooseErr}`, mongooseErr });
      } else {
        //console.log(updatedUser)
        res.status(201).json({ message: `User ${username} deleted successfuly!`, status : true,})
      }
    } else{
      res.status(500).json({ message: "HTTP method not valid only PUT Accepted"})
    }
  }