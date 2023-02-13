// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose' //{ Error }
import { unstable_getServerSession } from 'next-auth';
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

    if(!req.body) return res.status(404).json({message: "No form data!"});

    let queryArray = [];
    if (req.query.diets) {
      queryArray = Array.isArray(req.query.diets)
        ? req.query.diets
        : req.query.diets.split(',');
    }

    //console.log(queryArray)
    //res.status(200).json({ queryArray })

      
  //   //const { username } = req.body;
  //   const { foodName, limit } = req.query;
  //   const foodNameString = foodName as string
  //   const limitNumber = limit as unknown as number

    let mongooseErr

    // const result = await Users.find({username: new RegExp(foodNameString, 'i')}).sort({ createdAt: 'desc' }).limit(limitNumber).exec()
    // .catch(err => {throw new Error(err)});

    let foodItems = await FoodItem.find({diet: {"$in": queryArray}}).sort({ createdAt: 'desc' })
    .exec().catch(err => mongooseErr = err);
    // .populate('addedBy')
  //   searchOptions.name = new RegExp(req.query.name, 'i')

    if (mongooseErr) {
      res.status(500).json(`Database Error! - ${JSON.stringify(mongooseErr, null, 2)}`) //"Database Error!"
    }

    if(foodItems === undefined || !foodItems.length){
      res.status(500).json("No Food Item Found!")
    } else {
      return res.status(201).send(foodItems)
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}