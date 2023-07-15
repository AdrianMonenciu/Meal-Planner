import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose' 
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if(req.method === 'GET'){

    if(!req.body) return res.status(404).json({message: "No form data!"});
      
    //const { username } = req.body;
    const { username, limit } = req.query;
    const usernameString = username as string
    const limitNumber = limit as unknown as number

    let mongooseErr

    const result = await Users.find({username: new RegExp(usernameString, 'i')}).sort({ createdAt: 'desc' }).limit(limitNumber).exec()
      .catch(err => mongooseErr = err);

    if(result === undefined || !result.length){
      res.status(500).json("No user Found!")
    } else {
      return res.status(201).send({results: result})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}