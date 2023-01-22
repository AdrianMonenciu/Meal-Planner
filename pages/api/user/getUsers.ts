// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose' //{ Error }
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';
import { ApiError } from 'next/dist/server/api-utils';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

//   const testObject = new testModel({ 
//     first_name: "Tom", 
//     last_name: "Jerry" 
// });
// // The intellisense will detect the fullName Method
// const name = testObject.fullName();
// await testObject.save();


//const findTest = await testModel.find({});
  if(req.method === 'GET'){

    if(!req.body) return res.status(404).json({message: "No form data!"});
      
    //const { username } = req.body;
    const { username, limit } = req.query;
    const usernameString = username as string
    const limitNumber = limit as unknown as number

    const result = await Users.find({username: new RegExp(usernameString, 'i')}).sort({ createdAt: 'desc' }).limit(limitNumber).exec()
    .catch(err => {throw new Error(err)});
    //.find().sort({ createdAt: 'desc' }).limit(10).exec()    new RegExp(req.query.name, 'i'
  //   searchOptions.name = new RegExp(req.query.name, 'i')
  // }
  //await Users.find().where('stars').gt(1000).byName('mongoose');



    if(result === undefined || !result.length){
      //throw new (JSON.stringify({ errors: "No user Found!", status: false }))
      //throw new Error("Password doesn't match")
      res.status(500).json("No user Found!")
      //return res.end(JSON.stringify("No user Found"))
    } else {
      //return result;
      return res.status(201).send({results: result})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}