import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import Meal from '../../../models/Meal';
//import mongoose from 'mongoose';
import { string } from 'yup';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    connectMongo()
    
    const session = await unstable_getServerSession(req, res, authOptions)
    //console.log(session)


    // only post method is accepted
    if(req.method === 'POST'){

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { name, foodItems, diet } = req.body;
      //console.log(req.body)

      const currentUser = await Users.findOne({ email: session.user.email });

      // check duplicate meal name
      const checkExistingMeal = await Meal.findOne({ name });
      if(checkExistingMeal ) { //&& session.user.username != username
        //console.log(checkexisting)
        return res.status(422).json({ message: "Meal Already Exists...!"})
      }

      const mongoose = require('mongoose')
      const foodItemsWithId = foodItems.map(({foodId, qty}) => ({foodId: mongoose.mongo.ObjectId(foodId), qty: qty}))

      const newMeal = new Meal({
        //_id: new mongoose.Types.ObjectId(),
        name: name,
        foodItems: foodItemsWithId,
        diet: diet,
        owner: currentUser._id    // assign the _id from the person
      });

      //console.log(newMeal)

      var errors: boolean = false
      var mongooseErr

      newMeal.save(function (err) {
        if (err) {
          console.log(err)
          mongooseErr = err
          errors = true
        } 
      });

      if (!errors) {
        currentUser.Meal.push(newMeal._id)
        mongooseErr = await currentUser.save().catch(err => {mongooseErr = err, errors = true});
      }

      //let userPopulated = await Users.findOne({email: currentUser.email}).populate("Meal");  

      let mealPopulated = await Meal.findOne({name: newMeal.name}).populate("foodItems.foodId");
    
      // console.log(mealPopulated)
      // console.log(currentUser)
      // console.log(userPopulated)

      if (errors) {
        console.log(mongooseErr)
        return res.status(404).json({ message: `Error connecting to the database: ${mongooseErr}`, mongooseErr });
      } else {
        res.status(201).json({ message: `Meal: ${newMeal.name} created successfuly!`, status : true, data: mealPopulated})
      }


    } else if (req.method === 'PUT'){

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { name, foodItems, diet, id } = req.body;
      //console.log(req.body)

      const currentUser = await Users.findOne({ email: session.user.email });

      // check duplicate meal name
      const checkExistingMeal = await Meal.findOne({ name });
      
      var mongoose = require('mongoose');
      var idObj = mongoose.mongo.ObjectId(id);

      // console.log(checkExistingFood)
      // console.log(idObj)

      if(checkExistingMeal && String(checkExistingMeal._id) !== String(idObj)) { 
        return res.status(422).json({ message: "Meal Already Exists...!"})
      }

      let errors: boolean = false
      const filter = { _id: id };

      const foodItemsWithId = foodItems.map(({foodId, qty}) => ({foodId: mongoose.mongo.ObjectId(foodId), qty: qty}))

      const update = {name, foodItems: foodItemsWithId, diet, owner: currentUser._id };

      var err = await Meal.findOneAndUpdate(filter, update, {
        new: true
      }).catch(err => {err = err, errors = true}); //, (err, doc) => {errs = err, errors = true});
      
      let updatedMeal = await Meal.findOne({_id: id})

      let mealPopulated = await Meal.findOne({name: updatedMeal.name}).populate("foodItems.foodId");

      if (!errors) {
        currentUser.Meal.push(updatedMeal._id)
        await currentUser.save().catch(error => {err = error, errors = true});
      }
      
      if (errors) {
        console.log(err)
        return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
      } else {
        //console.log(updatedFood)
        res.status(201).json({ message: `Food item ${updatedMeal.name} updated successfuly!`, status : true, meal: mealPopulated})
      }


    } else if (req.method === 'DELETE') {

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { name } = req.body;
      //console.log(req.body)

      let errors: boolean = false
      const filter = { name };
      let mongooseErr

      //var mongooseErr = await Users.findOneAndDelete((filter)).catch(err => {mongooseErr = err, errors = true});

      const deletedMeal = Meal.findOneAndDelete((filter), function (err, docs) {
        if (err){
          console.log(err)
          mongooseErr = err
          errors = true
          //ow err
        }
     })    //.catch(function(err){ console.log(err)});

      if (errors) {
        console.log(mongooseErr)
        return res.status(404).json({ message: `Error connecting to the database: ${mongooseErr}`, mongooseErr });
      } else {
        //console.log(updatedUser)
        res.status(201).json({ message: `Food ${name} deleted successfuly!`, status : true,})
      }

    }else {
      res.status(500).json({ message: "HTTP method not valid only PUT Accepted"})
    }

}