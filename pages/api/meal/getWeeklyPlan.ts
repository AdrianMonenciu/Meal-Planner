import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose'; //{ Error }
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';
import WeeklyPlan from '../../../models/WeeklyPlan';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!req.body) return res.status(404).json({ message: 'No form data!' });
    //console.log(req.query)

    const keys = Object.keys(req.query);
    let mongooseErr;
    let weeklyPlans;

    if (keys.includes('weekNr')) {
      const session = await unstable_getServerSession(req, res, authOptions);
      const currentUser = await Users.findOne({ email: session.user.email });

      const { year, weekNr, limit } = req.query;
      const limitNumber = limit as unknown as number;
      const yearNumber = year as unknown as number;
      const weekNrNumber = weekNr as unknown as number;

      weeklyPlans = await WeeklyPlan.find({
        year: yearNumber,
        weekNr: { $lte: weekNrNumber },
        owner: currentUser._id
      })
        .sort({ createdAt: 'desc' })
        .limit(limitNumber)
        .populate([
          {
            path: 'mondayMealsBreakfast mondayMealsLunch mondayMealsDinner mondaySnaks.foodId'
          },
          {
            path: 'tuesdayMealsBreakfast tuesdayMealsLunch tuesdayMealsDinner tuesdaySnaks.foodId'
          },
          {
            path: 'wednesdayMealsBreakfast wednesdayMealsLunch wednesdayMealsDinner wednesdaySnaks.foodId'
          },
          {
            path: 'thursdayMealsBreakfast thursdayMealsLunch thursdayMealsDinner thursdaySnaks.foodId'
          },
          {
            path: 'fridayMealsBreakfast fridayMealsLunch fridayMealsDinner fridaySnaks.foodId'
          },
          {
            path: 'saturdayMealsBreakfast saturdayMealsLunch saturdayMealsDinner saturdaySnaks.foodId'
          },
          {
            path: 'sundayMealsBreakfast sundayMealsLunch sundayMealsDinner sundaySnaks.foodId'
          }
        ])
        .exec()
        .catch(err => {
          mongooseErr = err;
        });
      //console.log(weeklyPlans)
    } else {
      const { weeklyPlanId } = req.query;
      //console.log(weeklyPlanId)

      weeklyPlans = await WeeklyPlan.find({
        _id: weeklyPlanId
      })
        .populate([
          {
            path: 'mondayMealsBreakfast mondayMealsLunch mondayMealsDinner mondaySnaks.foodId'
          },
          {
            path: 'tuesdayMealsBreakfast tuesdayMealsLunch tuesdayMealsDinner tuesdaySnaks.foodId'
          },
          {
            path: 'wednesdayMealsBreakfast wednesdayMealsLunch wednesdayMealsDinner wednesdaySnaks.foodId'
          },
          {
            path: 'thursdayMealsBreakfast thursdayMealsLunch thursdayMealsDinner thursdaySnaks.foodId'
          },
          {
            path: 'fridayMealsBreakfast fridayMealsLunch fridayMealsDinner fridaySnaks.foodId'
          },
          {
            path: 'saturdayMealsBreakfast saturdayMealsLunch saturdayMealsDinner saturdaySnaks.foodId'
          },
          {
            path: 'sundayMealsBreakfast sundayMealsLunch sundayMealsDinner sundaySnaks.foodId'
          }
        ])
        .exec()
        .catch(err => {
          mongooseErr = err;
        });
      //console.log(weeklyPlans)
    }

    if (mongooseErr) {
      res.status(500).json(`Database Error! - ${JSON.stringify(mongooseErr, null, 2)}`);
      return;
    }

    if (weeklyPlans === undefined || !weeklyPlans.length) {
      res.status(500).json('No Weekly Plans Found!');
      return;
    } else {
      return res.status(201).send({ results: weeklyPlans });
    }
  } else {
    res.status(500).json({ message: 'HTTP method not valid only POST Accepted' });
  }
}
