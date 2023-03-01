import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import WeeklyPlan from '../../../models/WeeklyPlan';
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
      const { values } = req.body;
      //console.log(values)

      const currentUser = await Users.findOne({ email: session.user.email });

      // check duplicate meal name
      const checkExistingWeeklyPlan = await WeeklyPlan.findOne({ owner: currentUser._id, weekNr: values.weekNr, year: values.year });
      if(checkExistingWeeklyPlan ) { //&& session.user.username != username
        //console.log(checkexisting)
        return res.status(422).json({ message: "Weekly Plan Already Exists...!"})
      }

      const mongoose = require('mongoose')
      //const foodItemsWithId = foodItems.map(({foodId, qty}) => ({foodId: mongoose.mongo.ObjectId(foodId), qty: qty}))

      const newWeeklyPlan = new WeeklyPlan({
        //_id: new mongoose.Types.ObjectId(),
        year: values.year,
        weekNr: values.weekNr,
        owner: currentUser._id, 
        diet: values.diet,
        mondayMeals: values.mondayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        mondaySnaks: values.mondaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        tuesdayMeals: values.tuesdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        tuesdaySnaks: values.tuesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        wednesdayMeals: values.wednesdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        wednesdaySnaks: values.wednesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        thursdayMeals: values.thursdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        thursdaySnaks: values.thursdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        fridayMeals: values.fridayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        fridaySnaks: values.fridaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        saturdayMeals: values.saturdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        saturdaySnaks: values.saturdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        sundayMeals: values.sundayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        sundaySnaks: values.sundaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        shoppingList: values.shoppingList,
      });

      //console.log(newWeeklyPlan)

      var errors: boolean = false
      var mongooseErr

      newWeeklyPlan.save(function (err) {
        if (err) {
          console.log(err)
          mongooseErr = err
          errors = true
        } 
      });

      if (!errors) {
        currentUser.WeeklyPlan.push(newWeeklyPlan._id)
        mongooseErr = await currentUser.save().catch(err => {mongooseErr = err, errors = true});
      }

      let userPopulated = await Users.findOne({email: currentUser.email}).populate("WeeklyPlan");  

      let weeklyPlanPopulated = await WeeklyPlan.findOne({owner: currentUser._id, weekNr: values.weekNr, year: values.year})
      .populate("mondayMeals").populate("mondaySnaks.foodId")
      .populate("tuesdayMeals").populate("tuesdaySnaks.foodId")
      .populate("wednesdayMeals").populate("wednesdaySnaks.foodId")
      .populate("thursdayMeals").populate("thursdaySnaks.foodId")
      .populate("fridayMeals").populate("fridaySnaks.foodId")
      .populate("saturdayMeals").populate("saturdaySnaks.foodId")
      .populate("sundayMeals").populate("sundaySnaks.foodId")
    
      //console.log(weeklyPlanPopulated)
      // console.log(currentUser)
      //console.log(userPopulated)

      if (errors) {
        console.log(mongooseErr)
        return res.status(404).json({ message: `Error connecting to the database: ${mongooseErr}`, mongooseErr });
      } else {
        res.status(201).json({ message: `Weekly Plan, week nr: ${newWeeklyPlan.weekNr} created successfuly!`, status : true, data: weeklyPlanPopulated})
      }


    } else if (req.method === 'PUT'){

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { values } = req.body;
      //console.log(req.body)
      
      var mongoose = require('mongoose');
      let errors: boolean = false
      const filter = { _id: values.id };

      const update = {
        diet: values.diet,
        mondayMeals: values.mondayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        mondaySnaks: values.mondaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        tuesdayMeals: values.tuesdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        tuesdaySnaks: values.tuesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        wednesdayMeals: values.wednesdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        wednesdaySnaks: values.wednesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        thursdayMeals: values.thursdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        thursdaySnaks: values.thursdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        fridayMeals: values.fridayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        fridaySnaks: values.fridaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        saturdayMeals: values.saturdayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        saturdaySnaks: values.saturdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        sundayMeals: values.sundayMeals.map(({id}) => (mongoose.mongo.ObjectId(id))),
        sundaySnaks: values.sundaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        shoppingList: values.shoppingList,
       };

      var err = await WeeklyPlan.findOneAndUpdate(filter, {$set: update}, {
        new: true
      }).catch(err => {err = err, errors = true}); //, (err, doc) => {errs = err, errors = true});
      
      let updatedWeeklyPlan = await WeeklyPlan.findOne({_id: values.id})
      .populate("mondayMeals").populate("mondaySnaks.foodId")
      .populate("tuesdayMeals").populate("tuesdaySnaks.foodId")
      .populate("wednesdayMeals").populate("wednesdaySnaks.foodId")
      .populate("thursdayMeals").populate("thursdaySnaks.foodId")
      .populate("fridayMeals").populate("fridaySnaks.foodId")
      .populate("saturdayMeals").populate("saturdaySnaks.foodId")
      .populate("sundayMeals").populate("sundaySnaks.foodId")

      
      if (errors) {
        console.log(err)
        return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
      } else {
        //console.log(updatedFood)
        res.status(201).json({ message: `Weekly Plan ${updatedWeeklyPlan.weekNr} updated successfuly!`, status : true, weeklyPlan: updatedWeeklyPlan})
      }

    }else {
      res.status(500).json({ message: "HTTP method not valid only PUT Accepted"})
    }

}