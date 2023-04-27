import { Model, Schema } from "mongoose";
import createModel from "./createModel";
import { IMeal, MealModel, mealSchema } from './Meal';
import { IUser, UserModel, userSchema } from './user';

export interface IFood {
  id: number;
  _id: Schema.Types.ObjectId;
  name: string;
  privateBool: boolean;
  foodMeasureUnit: string;
  diet: string[];
  snack: boolean;
  image: string;
  addedBy: Schema.Types.ObjectId;
}

interface IFoodMethods {
  fullName(): string;
}

export type FoodModel = Model<IFood, {}, IFoodMethods>;

export const foodSchema = new Schema<IFood, FoodModel, IFoodMethods>({
  id: {type: Number },
  _id: {type: Schema.Types.ObjectId, required: true, auto: true },
  name: {type: String, required:true},
  privateBool: {type: Boolean, default: false, required: true},
  foodMeasureUnit: {type:String, required:true},
  diet: [{type: String, required:true}],
  snack: {type: Boolean, default: false, required: true},
  image: {type: String, default: 'MealPlanner/suqkcwqrvwoag1july5l'},
  addedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
},
{ timestamps: true },);

foodSchema.method("nameReturn", function nameReturn() {
  return this.name;
});

//createModel<IMeal, MealModel>("Meal", mealSchema)
//createModel<IUser, UserModel>("Users", userSchema)

export default createModel<IFood, FoodModel>("FoodItem", foodSchema);