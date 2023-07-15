import connectMongo from '../../../database/connectdb';
import FoodItem from '../../../models/FoodItem';
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
  connectMongo()

  // only post method is accepted
  if(req.method === 'POST'){

    if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
    const { test } = req.body;
    //console.log(req.body)

    let updatedFoodItems, errorsComp
    let errors: boolean = false 

    FoodItem.updateMany({}, { $set: { privateBool: false, snack: false, image: 'MealPlanner/suqkcwqrvwoag1july5l' } }, (err, res) => {
      if (err) {
        errors = true;
        errorsComp = err;
        console.log(err)
      } else {
        console.log(res);
        updatedFoodItems = res;
      }
          
    })

    if (errors) {
      console.log(errorsComp)
      return res.status(404).json({ message: `Error connecting to the database: ${errorsComp}`, errorsComp });
    } else {
      console.log(updatedFoodItems)
      res.status(201).json({ message: `Users updated successfuly!`, status : true, foodItems: updatedFoodItems})
    }
  } else{
    res.status(500).json({ message: "HTTP method not valid only POST Accepted"})
  }
}