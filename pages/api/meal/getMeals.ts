// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose' //{ Error }
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';
import Meal from '../../../models/Meal';
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
      
    //const { username } = req.body;
    const keys = Object.keys(req.query);
    let mongooseErr
    let meals
    //console.log(keys)

    if (keys.includes('mealName')) {
      const { mealName, limit } = req.query;
      const mealNameString = mealName as string
      const limitNumber = limit as unknown as number

      meals = await Meal.find({name: new RegExp(mealNameString, 'i')}).sort({ createdAt: 'desc' })
      .limit(limitNumber).populate({path: 'foodItems.foodId', model: 'FoodItem'}).exec().catch(err => mongooseErr = err);
      //console.log(meals)
    } 

    if (mongooseErr) {
      res.status(500).json(`Database Error! - ${JSON.stringify(mongooseErr, null, 2)}`) //"Database Error!"
      return
    }

    if(meals === undefined || !meals.length){
      res.status(500).json("No Meals Found!")
      return
    } else {
      //return result;
      return res.status(201).send({results: meals})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}