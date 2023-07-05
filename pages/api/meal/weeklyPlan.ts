import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import WeeklyPlan from '../../../models/WeeklyPlan';

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
      const { values, updatedShoppingList } = req.body;

      const currentUser = await Users.findOne({ email: session.user.email });

      // check duplicate meal name
      const checkExistingWeeklyPlan = await WeeklyPlan.findOne({ owner: currentUser._id, weekNr: values.weekNr, year: values.year });
      if(checkExistingWeeklyPlan ) { 
        return res.status(422).json({ message: "Weekly Plan Already Exists...!"})
      }

      const mongoose = require('mongoose')

      const newWeeklyPlan = new WeeklyPlan({
        year: values.year,
        weekNr: values.weekNr,
        owner: currentUser._id, 
        diet: values.diet,
        privateAll: values.privateAll,
        mondayMealsBreakfast: values.mondayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
        mondayMealsLunch: values.mondayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
        mondayMealsDinner: values.mondayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
        mondaySnaks: values.mondaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        tuesdayMealsBreakfast: values.tuesdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
        tuesdayMealsLunch: values.tuesdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
        tuesdayMealsDinner: values.tuesdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
        tuesdaySnaks: values.tuesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        wednesdayMealsBreakfast: values.wednesdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
        wednesdayMealsLunch: values.wednesdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
        wednesdayMealsDinner: values.wednesdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
        wednesdaySnaks: values.wednesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        thursdayMealsBreakfast: values.thursdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
        thursdayMealsLunch: values.thursdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
        thursdayMealsDinner: values.thursdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
        thursdaySnaks: values.thursdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        fridayMealsBreakfast: values.fridayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
        fridayMealsLunch: values.fridayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
        fridayMealsDinner: values.fridayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
        fridaySnaks: values.fridaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        saturdayMealsBreakfast: values.saturdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
        saturdayMealsLunch: values.saturdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
        saturdayMealsDinner: values.saturdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
        saturdaySnaks: values.saturdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        sundayMealsBreakfast: values.sundayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
        sundayMealsLunch: values.sundayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
        sundayMealsDinner: values.sundayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
        sundaySnaks: values.sundaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
        shoppingList: updatedShoppingList,
      });

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
      .populate("mondayMealsBreakfast").populate("mondayMealsLunch").populate("mondayMealsDinner").populate("mondaySnaks.foodId")
      .populate("tuesdayMealsBreakfast").populate("tuesdayMealsLunch").populate("tuesdayMealsDinner").populate("tuesdaySnaks.foodId")
      .populate("wednesdayMealsBreakfast").populate("wednesdayMealsLunch").populate("wednesdayMealsDinner").populate("wednesdaySnaks.foodId")
      .populate("thursdayMealsBreakfast").populate("thursdayMealsLunch").populate("thursdayMealsDinner").populate("thursdaySnaks.foodId")
      .populate("fridayMealsBreakfast").populate("fridayMealsLunch").populate("fridayMealsDinner").populate("fridaySnaks.foodId")
      .populate("saturdayMealsBreakfast").populate("saturdayMealsLunch").populate("saturdayMealsDinner").populate("saturdaySnaks.foodId")
      .populate("sundayMealsBreakfast").populate("sundayMealsLunch").populate("sundayMealsDinner").populate("sundaySnaks.foodId")
  
      if (errors) {
        console.log(mongooseErr)
        return res.status(404).json({ message: `Error connecting to the database: ${mongooseErr}`, mongooseErr });
      } else {
        console.log(weeklyPlanPopulated)
        res.status(201).json({ message: `Weekly Plan, week nr: ${newWeeklyPlan.weekNr} created successfuly!`, status : true, data: weeklyPlanPopulated})
      }
      
    } else if (req.method === 'PUT'){

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { values } = req.body;
      //console.log(req.body)
      
      var mongoose = require('mongoose');
      let errors: boolean = false
      const filter = { _id: values.id };
      let update

      if (values.mondayMealsBreakfast != undefined) {
        console.log('Update full weekly plan')
        const { updatedShoppingList} = req.body;
        update = {
          diet: values.diet,
          privateAll: values.privateAll,
          mondayMealsBreakfast: values.mondayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
          mondayMealsLunch: values.mondayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
          mondayMealsDinner: values.mondayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
          mondaySnaks: values.mondaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
          tuesdayMealsBreakfast: values.tuesdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
          tuesdayMealsLunch: values.tuesdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
          tuesdayMealsDinner: values.tuesdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
          tuesdaySnaks: values.tuesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
          wednesdayMealsBreakfast: values.wednesdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
          wednesdayMealsLunch: values.wednesdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
          wednesdayMealsDinner: values.wednesdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
          wednesdaySnaks: values.wednesdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
          thursdayMealsBreakfast: values.thursdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
          thursdayMealsLunch: values.thursdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
          thursdayMealsDinner: values.thursdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
          thursdaySnaks: values.thursdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
          fridayMealsBreakfast: values.fridayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
          fridayMealsLunch: values.fridayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
          fridayMealsDinner: values.fridayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
          fridaySnaks: values.fridaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
          saturdayMealsBreakfast: values.saturdayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
          saturdayMealsLunch: values.saturdayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
          saturdayMealsDinner: values.saturdayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
          saturdaySnaks: values.saturdaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
          sundayMealsBreakfast: values.sundayMealsBreakfast.map(({id}) => (mongoose.mongo.ObjectId(id))),
          sundayMealsLunch: values.sundayMealsLunch.map(({id}) => (mongoose.mongo.ObjectId(id))),
          sundayMealsDinner: values.sundayMealsDinner.map(({id}) => (mongoose.mongo.ObjectId(id))),
          sundaySnaks: values.sundaySnaks.map(({id, qty}) => ({foodId: mongoose.mongo.ObjectId(id), qty: qty})),
          shoppingList: updatedShoppingList,
         };
      } else {
        console.log('Update shopping list only')
        update = {
          shoppingList: values.shoppingList,
         };
      }

      var err = await WeeklyPlan.findOneAndUpdate(filter, {$set: update}, {
        new: true
      }).catch(err => {err = err, errors = true}); //, (err, doc) => {errs = err, errors = true});
      
      let updatedWeeklyPlan = await WeeklyPlan.findOne({_id: values.id})
      .populate("mondayMealsBreakfast").populate("mondayMealsLunch").populate("mondayMealsDinner").populate("mondaySnaks.foodId")
      .populate("tuesdayMealsBreakfast").populate("tuesdayMealsLunch").populate("tuesdayMealsDinner").populate("tuesdaySnaks.foodId")
      .populate("wednesdayMealsBreakfast").populate("wednesdayMealsLunch").populate("wednesdayMealsDinner").populate("wednesdaySnaks.foodId")
      .populate("thursdayMealsBreakfast").populate("thursdayMealsLunch").populate("thursdayMealsDinner").populate("thursdaySnaks.foodId")
      .populate("fridayMealsBreakfast").populate("fridayMealsLunch").populate("fridayMealsDinner").populate("fridaySnaks.foodId")
      .populate("saturdayMealsBreakfast").populate("saturdayMealsLunch").populate("saturdayMealsDinner").populate("saturdaySnaks.foodId")
      .populate("sundayMealsBreakfast").populate("sundayMealsLunch").populate("sundayMealsDinner").populate("sundaySnaks.foodId")
    
      
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