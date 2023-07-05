// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose' //{ Error }
import { Session, unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';
import FoodItem from '../../../models/FoodItem';
import { ApiError } from 'next/dist/server/api-utils';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(req.method === 'GET'){

    if(!req.query) return res.status(404).json({message: "No form data!"});
    
    const { foodName, limit, username } = req.query;
    const foodNameString = foodName as string
    const limitNumber = limit as unknown as number
    //console.log(req.query)

    let mongooseErr,searchCondition

    const currentUser = await Users.findOne({ username: username })
    //console.log(currentUser)

    if (currentUser.userRole == "admin") {
      searchCondition = {
        $or: [
          {
            privateBool: false,
            name: new RegExp(foodNameString, 'i')
          },
          {
            privateBool: true,
            addedBy: currentUser._id,
            name: new RegExp(foodNameString, 'i')
          }
        ]
      }
    } else {
      searchCondition = {
        privateBool: true,
        addedBy: currentUser._id,
        name: new RegExp(foodNameString, 'i')
      }
    }

    let foodItemsPopulated = await FoodItem.find(searchCondition).sort({ createdAt: 'desc' })
    .limit(limitNumber).exec().catch(err => mongooseErr = err);

    if (mongooseErr) {
      res.status(500).json(`Database Error! - ${JSON.stringify(mongooseErr, null, 2)}`) 
    }

    if(foodItemsPopulated === undefined || !foodItemsPopulated.length){
      res.status(500).json("No Food Item Found!")
    } else {
      return res.status(201).send({results: foodItemsPopulated})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}