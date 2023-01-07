// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose'
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';

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


  const result = await Users.find({})

  //await Users.find().where('stars').gt(1000).byName('mongoose');

  if(!result){
      //throw new Error("No user Found with Email Please Sign Up...!")
      return res.end(JSON.stringify("No user Found"))
  }

  //return result;
  return res.send(JSON.stringify(result))
}