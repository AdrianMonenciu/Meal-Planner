
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose'
import connectMongo from '../../../database/connectdb';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(mongoose.connections[0].readyState){
    console.log('Already connected.')
    return res.end(JSON.stringify("Already connected to mongodb."))
  } else {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL);
    if(connection.readyState == 1){
      console.log('Connected to mongodb.')
      return res.end(JSON.stringify("Connected to mongodb."))
    }
  }
}