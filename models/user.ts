import { Model, Schema } from "mongoose";
import createModel from "./createModel";

export interface IUser {
  id: number;
  _id: Schema.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  image: string;
  dietPreference: string;
  userRole?: string
  WeeklyPlan: Schema.Types.ObjectId[];
  FoodItem: Schema.Types.ObjectId[];
  Meal: Schema.Types.ObjectId[];
  ShoppingList: Schema.Types.ObjectId[];
}

interface IUserMethods {
  fullName(): string;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  id: {type: Number },
  _id: {type: Schema.Types.ObjectId, required: true, auto: true },
  username: {type: String, default: 'guest', required:true},
  email: {type: String, required:true },
  password: {type: String, required:true},
  image: {type: String, default: 'MealPlanner/suqkcwqrvwoag1july5l'},
  dietPreference: {type:String, required:true},
  userRole: {type: String, default: 'user', required:true },
  WeeklyPlan: [{ type: Schema.Types.ObjectId, ref: 'WeeklyPlan' }],
  FoodItem: [{ type: Schema.Types.ObjectId, ref: 'FoodItem' }],
  Meal: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  ShoppingList: [{ type: Schema.Types.ObjectId, ref: 'ShoppingList' }]
},
{ timestamps: true },);

userSchema.method("fullName", function fullName() {
  return this.username + " " + this.email;
});

export default createModel<IUser, UserModel>("Users", userSchema);