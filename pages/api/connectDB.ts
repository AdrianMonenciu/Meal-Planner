// import connectMongo from '../../../database/conn';
// import Users from '../../../model/Schema'
import { hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from "next"
import mongoose from 'mongoose'

export default async function handler() {
    //const mongoose = require('mongoose')
    //mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true })
    //const db = mongoose.connection
    //db.on('error', error => console.error(error))
    //db.once('open', () => console.log('Connected to Mongoose'))

    if(mongoose.connections[0].readyState){
        console.log('Already connected.')
        return;
      }
    
      mongoose.connect(process.env.DATABASE_URL, {}, err => {
        if(err) throw err;
        console.log('Connected to mongodb.')
      })
    

}