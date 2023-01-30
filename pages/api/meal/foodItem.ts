import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import FoodItem from '../../../models/FoodItem';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    connectMongo()
    
    const session = await unstable_getServerSession(req, res, authOptions)
    //console.log(session)


    // try {
    //   connectMongo();
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).json({ message: 'Internal server error' });
    // }

    // only post method is accepted
    if(req.method === 'POST'){

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { name, foodMeasureUnit, diet } = req.body;
      //console.log(req.body)

      const currentUser = await Users.findOne({ email: session.user.email });

      const newFoodItem = new FoodItem({
        //_id: new mongoose.Types.ObjectId(),
        name: name,
        foodMeasureUnit: foodMeasureUnit,
        diet: diet,
        addedBy: currentUser._id    // assign the _id from the person
      });

      

      let errors: boolean = false
      //const filter = { username };
      let mongooseErr

      newFoodItem.save(function (err) {
        if (err) {
          console.log(err)
          mongooseErr = err
          errors = true
        } 
      });

      if (!errors) {
        currentUser.FoodItem.push(newFoodItem._id)
        mongooseErr = await currentUser.save().catch(err => {mongooseErr = err, errors = true});
        // currentUser.save(function (err) {
        //   if (err) {
        //     console.log(err)
        //     mongooseErr = err
        //     errors = true
        //   }
        // })
      }

      let userPopulated = await Users.findOne({email: currentUser.email}).populate('FoodItem');
      // Users.findOne({email: currentUser.email}).
      //   populate('FoodItem').
      //   exec(function (err, userPopulated1) {
      //     if (err) console.log(err);
      //     userPopulated = userPopulated1
      //     //console.log(userPopulated);
      //     // prints "The author is Ian Fleming"
      //   });
    
      console.log(newFoodItem)
      console.log(userPopulated)

      if (errors) {
        console.log(mongooseErr)
        return res.status(404).json({ message: `Error connecting to the database: ${mongooseErr}`, mongooseErr });
      } else {
        //console.log(updatedUser)
        res.status(201).json({ message: `Food ${newFoodItem.name} created successfuly!`, status : true, data: newFoodItem})
      }
    } else{
      res.status(500).json({ message: "HTTP method not valid only PUT Accepted"})
    }

}