import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose'
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';
import Meal from '../../../models/Meal';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if(req.method === 'GET'){

    if(!req.body) return res.status(404).json({message: "No form data!"});
 
    const { username } = req.query;
    const currentUser = await Users.findOne({ username: username })
    let searchCondition
      
    const keys = Object.keys(req.query);
    let mongooseErr
    let meals

    if (keys.includes('mealName')) {
      const { mealName, limit } = req.query;
      const mealNameString = mealName as string
      const limitNumber = limit as unknown as number

      if (currentUser.userRole == "admin") {
        searchCondition = {
          $or: [
            {
              privateBool: false,
              name: new RegExp(mealNameString, 'i')
            },
            {
              privateBool: true,
              owner: currentUser._id,
              name: new RegExp(mealNameString, 'i')
            }
          ]
        }
      } else {
        searchCondition = {
          privateBool: true,
          owner: currentUser._id,
          name: new RegExp(mealNameString, 'i')
        }
      }

      meals = await Meal.find(searchCondition).sort({ createdAt: 'desc' }).limit(limitNumber)
      .populate({path: 'foodItems.foodId', model: 'FoodItem'}).exec().catch(err => mongooseErr = err);
      //console.log(meals)
    } else {
      let queryArray = [];
      if (req.query.diets) {
        queryArray = Array.isArray(req.query.diets)
          ? req.query.diets
          : req.query.diets.split(',');
      }

      const privateAll = req.query.privateAll === 'true';
      let searchCondition

      if (!privateAll) {
        searchCondition = {
          $or: [
            {
              privateBool: false,
              diet: { $all: queryArray }
            },
            {
              privateBool: true,
              privateAllFoods: false,
              diet: { $all: queryArray },
              owner: currentUser._id
            }
          ]
        }
      } else {
        searchCondition = {
          $or: [
            {
              privateBool: false,
              diet: { $all: queryArray }
            },
            {
              privateBool: true,
              owner: currentUser._id
            }
          ]
        }
      }

      meals = await Meal.find(searchCondition)
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
      return res.status(201).send({results: meals})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}