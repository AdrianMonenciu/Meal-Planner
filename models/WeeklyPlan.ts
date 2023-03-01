import { Model, Schema } from "mongoose";
import createModel from "./createModel";
import { IFood, FoodModel, foodSchema } from './FoodItem';
import { IMeal, MealModel, mealSchema } from './Meal';

export interface IWeeklyPlan {
  _id: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId,
  year: number,
  weekNr: number,
  diet: string[];
  mondayMeals: Schema.Types.ObjectId[],
  mondaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  tuesdayMeals: Schema.Types.ObjectId[],
  tuesdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  wednesdayMeals: Schema.Types.ObjectId[],
  wednesdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  thursdayMeals: Schema.Types.ObjectId[],
  thursdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  fridayMeals: Schema.Types.ObjectId[],
  fridaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  saturdayMeals: Schema.Types.ObjectId[],
  saturdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  sundayMeals: Schema.Types.ObjectId[],
  sundaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  shoppingList: { foodItem: string, qty: number, qtyOption: string, isPurchased: boolean }[]
}

interface IWeeklyPlanMethods {
  fullName(): string;
}

export type WeeklyPlanModel = Model<IWeeklyPlan, {}, IWeeklyPlanMethods>;

export const weeklyPlanSchema = new Schema<IWeeklyPlan, WeeklyPlanModel, IWeeklyPlanMethods>({
  _id: {type: Schema.Types.ObjectId, required: true, auto: true },
  year: {type: Number, required:true},
  weekNr: {type: Number, required:true},
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  diet: [{type: String, required:true}],
  mondayMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  mondaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  tuesdayMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  tuesdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  wednesdayMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  wednesdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  thursdayMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  thursdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  fridayMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  fridaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  saturdayMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  saturdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  sundayMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  sundaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  shoppingList: [{ foodItem: String, qty: Number, qtyOption: String, isPurchased: Boolean }]
},
{ timestamps: true },);

weeklyPlanSchema.method("nameReturn", function nameReturn() {
  return this.name;
});

createModel<IFood, FoodModel>("FoodItem", foodSchema)
createModel<IMeal, MealModel>("Meal", mealSchema)

export default createModel<IWeeklyPlan, WeeklyPlanModel>("WeeklyPlan", weeklyPlanSchema);