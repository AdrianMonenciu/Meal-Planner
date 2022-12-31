// import mongoose from 'mongoose';

// const connectMongo = async () => {
//     try {
//         const { connection } = await mongoose.connect(process.env.MONGO_URL);

//         if(connection.readyState == 1){
//             console.log('Conneced to MongoDB')
//             return Promise.resolve(true)
//         }
//     } catch (error) {
//         console.log('Fail to connect MongoDB')
//         console.log(error)
//         return Promise.reject(error)
//     }
// }

// export default connectMongo;

import mongoose from 'mongoose'

mongoose.set('strictQuery', false);

const connectMongo = async () => {
  
  if(mongoose.connections[0].readyState){
    console.log('Already connected.')
    return 
  } else {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL);
    
  if(connection.readyState == 1){
    console.log('Connected to mongodb.')
    return 
  } else {
    console.log('NOT Connected to mongodb.')
    return 
  }
}
}

export default connectMongo;
