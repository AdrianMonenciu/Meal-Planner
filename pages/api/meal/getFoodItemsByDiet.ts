import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose'
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user';
import FoodItem from '../../../models/FoodItem';

mongoose.set('strictQuery', false);

connectMongo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if(req.method === 'GET'){

    if(!req.body) return res.status(404).json({message: "No form data!"});

    let queryArray = [];
    if (req.query.diets) {
      queryArray = Array.isArray(req.query.diets)
        ? req.query.diets
        : req.query.diets.split(',');
    }

    const isPrivate = req.query.isPrivate === 'true';
    const privateAll = req.query.privateAll === 'true';

    const { username } = req.query;
    const currentUser = await Users.findOne({ username: username })

    let mongooseErr, searchCondition

    if(isPrivate == false) {
      searchCondition = {
        privateBool: false,
        diet: { $all: queryArray }
      }
    } else if (!privateAll) {
      //console.log("Private with diets")
      searchCondition = {
        $or: [
          {
            privateBool: false,
            diet: { $all: queryArray }
          },
          {
            privateBool: true,
            diet: { $all: queryArray },
            addedBy: currentUser._id
          }
        ]
      }
    } else {
      //console.log("Private all")
      searchCondition = {
        $or: [
          {
            privateBool: false,
            diet: { $all: queryArray }
          },
          {
            privateBool: true,
            addedBy: currentUser._id
          }
        ]
      }
    }

    let foodItems = await FoodItem.find(searchCondition).sort({ createdAt: 'desc' }).exec().catch(err => mongooseErr = err);

    if (mongooseErr) {
      res.status(500).json(`Database Error! - ${JSON.stringify(mongooseErr, null, 2)}`) 
    }

    if(foodItems === undefined || !foodItems.length){
      console.log("foodItems undefined")
      res.status(500).json("No Food Item Found!")
    } else {
      //console.log(foodItems)
      return res.status(201).send(foodItems)
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}