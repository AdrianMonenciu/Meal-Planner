import { Model, Schema } from "mongoose";
import createModel from "./createModel";

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

type MealModel = Model<IMeal, {}, IMealMethods>;

const mealSchema = new Schema<IMeal, MealModel, IMealMethods>({
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

export default createModel<IMeal, MealModel>("Meal", mealSchema);