import mongoose, { ConnectOptions } from 'mongoose';

mongoose.set('strictQuery', false);

interface MyConnectOptions extends ConnectOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

const connectMongo = async () => {
  let connectionMongo
  
  if(mongoose.connections[0].readyState){
    console.log('Already connected.')
    return 
  } else {
    const options: MyConnectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    try {
      const { connection } = await mongoose.connect(process.env.DATABASE_URL, options);
      connectionMongo = connection
    } catch (error) {
      console.error(error);
    }
    
  if(connectionMongo.readyState == 1){
    console.log('Connected to mongodb.')
    return 
  } else {
    console.log('NOT Connected to mongodb.')
    return 
  }
}
}

export default connectMongo;