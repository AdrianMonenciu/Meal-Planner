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
        const { username, email, password, dietPreference, public_id } = req.body;
        //console.log(req.body)

        // check duplicate users
        const checkexisting = await Users.findOne({ email });
        if(checkexisting) {
          //console.log(checkexisting)
          return res.status(422).json({ message: "User Already Exists...!"})
          //return
        }

        //hash password
        let errors: boolean = false
        const newUser = new Users({ username, email, password: await hash(password, 12), dietPreference, image: public_id })
        //await newUser.save()
        let err = await newUser.save().catch(err => {err = err, errors = true});

        // const data = Users.create({ username: username, email: email, password : await hash(password, 12), dietPreference: dietPreference}, function(err, data){
        //   if(err) {
        //     // console.log(err)
        //     // return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
        //     errors = true
        //   }
        //   // console.log(data)
        //   // res.status(201).json({ message: `User ${data.username} created successfuly!`, status : true, user: data})
        // })
        if (errors) {
          console.log(err)
          return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
        } else {
          console.log(newUser)
          res.status(201).json({ message: `User ${newUser.username} created successfuly!`, status : true, user: newUser})
        }
    } else{
      res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
    }

}