// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose' //{ Error }
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';
import WeeklyPlan from '../../../models/WeeklyPlan';
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
    //console.log(req.query)
  
    const keys = Object.keys(req.query)
    let mongooseErr
    let weeklyPlans

    if (keys.includes('weekNr')) {
      const session = await unstable_getServerSession(req, res, authOptions)
      const currentUser = await Users.findOne({ email: session.user.email });

      const { year, weekNr, limit } = req.query;
      const limitNumber = limit as unknown as number
      const yearNumber = year as unknown as number
      const weekNrNumber = weekNr as unknown as number
      //console.log(yearNumber + ' ' + weekNr + ' ' + limitNumber)

      weeklyPlans = await WeeklyPlan.find({year: yearNumber, weekNr: { $lte: weekNrNumber }, owner: currentUser._id}).sort({ createdAt: 'desc' }).limit(limitNumber)
      .populate("mondayMeals").populate("mondaySnaks.foodId")
      .populate("tuesdayMeals").populate("tuesdaySnaks.foodId")
      .populate("wednesdayMeals").populate("wednesdaySnaks.foodId")
      .populate("thursdayMeals").populate("thursdaySnaks.foodId")
      .populate("fridayMeals").populate("fridaySnaks.foodId")
      .populate("saturdayMeals").populate("saturdaySnaks.foodId")
      .populate("sundayMeals").populate("sundaySnaks.foodId")
      .exec().catch(err => mongooseErr = err);
      //console.log(weeklyPlans)
    } else {
      const { weeklyPlanId } = req.query;
      //console.log(weeklyPlanId)

      weeklyPlans = await WeeklyPlan.find({_id: weeklyPlanId})
      .populate("mondayMeals").populate("mondaySnaks.foodId")
      .populate("tuesdayMeals").populate("tuesdaySnaks.foodId")
      .populate("wednesdayMeals").populate("wednesdaySnaks.foodId")
      .populate("thursdayMeals").populate("thursdaySnaks.foodId")
      .populate("fridayMeals").populate("fridaySnaks.foodId")
      .populate("saturdayMeals").populate("saturdaySnaks.foodId")
      .populate("sundayMeals").populate("sundaySnaks.foodId")
      .exec().catch(err => mongooseErr = err);
      //console.log(weeklyPlans)
    }


    // if (keys.includes('mealName')) {
    //   const { mealName, limit } = req.query;
    //   const mealNameString = mealName as string
    //   const limitNumber = limit as unknown as number

    //   weeklyPlans = await Meal.find({name: new RegExp(mealNameString, 'i')}).sort({ createdAt: 'desc' })
    //   .populate({path: 'foodItems.foodId', model: 'FoodItem'}).exec().catch(err => mongooseErr = err);
    //   //console.log(meals)
    // } else {
    //   let queryArray = [];
    //   if (req.query.diets) {
    //     queryArray = Array.isArray(req.query.diets)
    //       ? req.query.diets
    //       : req.query.diets.split(',');
    //   }
    //   weeklyPlans = await Meal.find({diet: {"$in": queryArray}})
    //   .populate({path: 'foodItems.foodId', model: 'FoodItem'}).exec().catch(err => mongooseErr = err);
    //   //console.log(meals)
    // }

    if (mongooseErr) {
      res.status(500).json(`Database Error! - ${JSON.stringify(mongooseErr, null, 2)}`) //"Database Error!"
      return
    }

    if(weeklyPlans === undefined || !weeklyPlans.length){
      res.status(500).json("No Weekly Plans Found!")
      return
    } else {
      //return result;
      return res.status(201).send({results: weeklyPlans})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}