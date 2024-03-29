import { Model, Schema } from "mongoose";
import createModel from "./createModel";
import { IFood, FoodModel, foodSchema } from './FoodItem';

export interface IMeal {
  _id: Schema.Types.ObjectId;
  name: string;
  diet: string[];
  foodItems: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[]
  owner: Schema.Types.ObjectId;
  privateBool: boolean;
  privateAllFoods: boolean;
  image: string;
}

interface IMealMethods {
  fullName(): string;
}

export type MealModel = Model<IMeal, {}, IMealMethods>;

export const mealSchema = new Schema<IMeal, MealModel, IMealMethods>({
  _id: {type: Schema.Types.ObjectId, required: true, auto: true },
  name: {type: String, required:true},
  diet: [{type: String, required:true}],
  privateBool: {type: Boolean, default: false, required: true},
  privateAllFoods: {type: Boolean, default: false, required: true},
  image: {type: String, default: 'MealPlanner/suqkcwqrvwoag1july5l'},
  foodItems: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: Number
  }],
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
},
{ timestamps: true },);

mealSchema.method("nameReturn", function nameReturn() {
  return this.name;
});

createModel<IFood, FoodModel>("FoodItem", foodSchema)

export default createModel<IMeal, MealModel>("Meal", mealSchema);