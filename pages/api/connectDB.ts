// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose'
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectMongo from '../../database/connectdb';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    //const mongoose = require('mongoose')
    //mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true })
    //const db = mongoose.connection
    //db.on('error', error => console.error(error))
    //db.once('open', () => console.log('Connected to Mongoose'))

    //const session = await unstable_getServerSession(req, res, authOptions)
  //console.log("Session in API: " + JSON.stringify(session, null, 2))
  //res.send(JSON.stringify(session, null, 2))

    if(mongoose.connections[0].readyState){
      console.log('Already connected.')
      //return res.json("Already connected to mongodb.")
      return res.end(JSON.stringify("Already connected to mongodb."))
    } else {
      const { connection } = await mongoose.connect(process.env.DATABASE_URL);
      // mongoose.connect(process.env.DATABASE_URL, {}, err => {
      //   if(err) //throw err;
      //     //return res.status(404).json({ error: "Coult not connect to mongodb!"});
      //     return res.send(JSON.stringify("Coult not connect to mongodb!"))
      //   console.log('Connected to mongodb.')
      //   //return res.status(201).json("Connected to mongodb.")
      //   return res.end(JSON.stringify("Connected to mongodb."))
      // })
      if(connection.readyState == 1){
        console.log('Connected to mongodb.')
        return res.end(JSON.stringify("Connected to mongodb."))
    }
    }
    

}