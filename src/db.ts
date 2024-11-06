// db.ts
import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_KEY = process.env.MONGODB_KEY;
const uri = `mongodb+srv://railwayApp:${MONGODB_KEY}@clustergraficaserver.r8xxv.mongodb.net/?retryWrites=true&w=majority&appName=ClusterGraficaServer`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectToDatabase = async (): Promise<Db> => {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");
    return client.db('grafica');  // A base de dados que vamos usar
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Could not connect to the database');
  }
}

export default connectToDatabase;
