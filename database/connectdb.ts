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

import mongoose, { ConnectOptions } from 'mongoose';

mongoose.set('strictQuery', false);

interface MyConnectOptions extends ConnectOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

const connectMongo = async () => {
  
  if(mongoose.connections[0].readyState){
    console.log('Already connected.')
    return 
  } else {
    const options: MyConnectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    const { connection } = await mongoose.connect(process.env.DATABASE_URL, options);
    
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


// if(mongoose.connections[0].readyState){
//   console.log('Already connected.')
//   return 
// } else {
//   const { connection } = await mongoose.connect(process.env.DATABASE_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
  
// if(connection.readyState == 1){
//   console.log('Connected to mongodb.')
//   return 
// } else {
//   console.log('NOT Connected to mongodb.')
//   return 
// }