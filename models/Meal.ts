import { Model, Schema } from "mongoose";
import createModel from "./createModel";
import { IFood, FoodModel, foodSchema } from './FoodItem';
import { IUser, UserModel, userSchema } from './user';

export interface IMeal {
  _id: Schema.Types.ObjectId;
  name: string;
  diet: string[];
  foodItems: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[]
  owner: Schema.Types.ObjectId;
}

interface IMealMethods {
  fullName(): string;
}

export type MealModel = Model<IMeal, {}, IMealMethods>;

export const mealSchema = new Schema<IMeal, MealModel, IMealMethods>({
  _id: {type: Schema.Types.ObjectId, required: true, auto: true },
  name: {type: String, required:true},
  diet: [{type: String, required:true}],
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
//createModel<IUser, UserModel>("Users", userSchema)

export default createModel<IMeal, MealModel>("Meal", mealSchema);