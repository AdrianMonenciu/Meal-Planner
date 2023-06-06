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

    const session = await unstable_getServerSession(req, res, authOptions)
    //console.log(session)
    const currentUser = await Users.findOne({ email: session.user.email })
      
    //const { username } = req.body;
    const keys = Object.keys(req.query);
    let mongooseErr
    let meals
    //console.log(keys)

    if (keys.includes('mealName')) {
      const { mealName, limit } = req.query;
      const mealNameString = mealName as string
      const limitNumber = limit as unknown as number

      let searchCondition = {
        $or: [
          {
            privateBool: false,
            name: new RegExp(mealNameString, 'i')
          },
          {
            privateBool: true,
            addedBy: currentUser._id,
            name: new RegExp(mealNameString, 'i')
          }
        ]
      }

      meals = await Meal.find(searchCondition).sort({ createdAt: 'desc' })
      .populate({path: 'foodItems.foodId', model: 'FoodItem'}).exec().catch(err => mongooseErr = err);
      //console.log(meals)
    } else {
      let queryArray = [];
      if (req.query.diets) {
        queryArray = Array.isArray(req.query.diets)
          ? req.query.diets
          : req.query.diets.split(',');
      }

      meals = await Meal.find({diet: {"$in": queryArray}})
      .populate({path: 'foodItems.foodId', model: 'FoodItem'}).exec().catch(err => mongooseErr = err);
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