import connectMongo from '../../../database/connectdb';
import Users from '../../../models/user'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import FoodItem from '../../../models/FoodItem';
import mongoose from 'mongoose';
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
      const { name, privateBool, foodMeasureUnit, diet, snack, image } = req.body;
      //console.log(req.body)

      const currentUser = await Users.findOne({ email: session.user.email });

      // check duplicate food name
      const checkExistingFood = await FoodItem.findOne({ name });
      if(checkExistingFood ) { //&& session.user.username != username
        //console.log(checkexisting)
        return res.status(422).json({ message: "Food item Already Exists...!"})
      }

      const newFoodItem = new FoodItem({
        //_id: new mongoose.Types.ObjectId(),
        name: name,
        privateBool: privateBool,
        foodMeasureUnit: foodMeasureUnit,
        diet: diet,
        snack: snack,
        image: image,
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

      // let userPopulated = await Users.findOne({email: currentUser.email}).populate('FoodItem');
      // Users.findOne({email: currentUser.email}).
      //   populate('FoodItem').
      //   exec(function (err, userPopulated1) {
      //     if (err) console.log(err);
      //     userPopulated = userPopulated1
      //     //console.log(userPopulated);
      //     // prints "The author is Ian Fleming"
      //   });
    
      // console.log(newFoodItem)
      // console.log(userPopulated)

      if (errors) {
        console.log(mongooseErr)
        return res.status(404).json({ message: `Error connecting to the database: ${mongooseErr}`, mongooseErr });
      } else {
        //console.log(newFoodItem)
        res.status(201).json({ message: `Food ${newFoodItem.name} created successfuly!`, status : true, data: newFoodItem})
      }


    } else if (req.method === 'PUT'){

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { name, privateBool, foodMeasureUnit, diet, snack, image, id } = req.body;
      //console.log(req.body)

      const currentUser = await Users.findOne({ email: session.user.email });

      // check duplicate food items
      const checkExistingFood = await FoodItem.findOne({ name });
      
      var mongoose = require('mongoose');
      var idObj = mongoose.mongo.ObjectId(id);

      // console.log(checkExistingFood)
      // console.log(idObj)

      if(checkExistingFood && String(checkExistingFood._id) !== String(idObj)) { //&& session.user.username != username
        return res.status(422).json({ message: "Food name Already Exists...!"})
      }

      let errors: boolean = false
      const filter = { _id: id };
      const update = {name, privateBool, foodMeasureUnit, diet, snack, image, addedBy: currentUser._id };

      var err = await FoodItem.findOneAndUpdate(filter, update, {
        new: true
      }).catch(err => {err = err, errors = true}); //, (err, doc) => {errs = err, errors = true});
      
      let updatedFood = await FoodItem.findOne({_id: id})

      //console.log(currentUser.FoodItem)

      if (!errors) {
        if (!currentUser.FoodItem.find(item => String(item) == String(idObj))) {
          currentUser.FoodItem.push(updatedFood._id)
          await currentUser.save().catch(error => {err = error, errors = true});
        } else {
          console.log(`Food id: ${updatedFood._id} already existi for this user.`)
        }
        
      }
      
      if (errors) {
        console.log(err)
        return res.status(404).json({ message: `Error connecting to the database: ${err}`, err });
      } else {
        //console.log(updatedFood)
        res.status(201).json({ message: `Food item ${updatedFood.name} updated successfuly!`, status : true, food: updatedFood})
      }


    } else if (req.method === 'DELETE') {

      if(!req.body) return res.status(404).json({message: "Don't have form data...!"});
      const { name } = req.body;
      //console.log(req.body)

      let errors: boolean = false
      const filter = { name };
      let mongooseErr

      //var mongooseErr = await Users.findOneAndDelete((filter)).catch(err => {mongooseErr = err, errors = true});

      const deletedFood = FoodItem.findOneAndDelete((filter), function (err, docs) {
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