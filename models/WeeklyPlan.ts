import { Model, Schema } from "mongoose";
import createModel from "./createModel";
import { IFood, FoodModel, foodSchema } from './FoodItem';
import { IMeal, MealModel, mealSchema } from './Meal';

export interface IWeeklyPlan {
  _id: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId,
  year: number,
  weekNr: number,
  diet: string[],
  privateAll: boolean;
  mondayMealsBreakfast: Schema.Types.ObjectId[],
  mondayMealsLunch: Schema.Types.ObjectId[],
  mondayMealsDinner: Schema.Types.ObjectId[],
  mondaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  tuesdayMealsBreakfast: Schema.Types.ObjectId[],
  tuesdayMealsLunch: Schema.Types.ObjectId[],
  tuesdayMealsDinner: Schema.Types.ObjectId[],
  tuesdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  wednesdayMealsBreakfast: Schema.Types.ObjectId[],
  wednesdayMealsLunch: Schema.Types.ObjectId[],
  wednesdayMealsDinner: Schema.Types.ObjectId[],
  wednesdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  thursdayMealsBreakfast: Schema.Types.ObjectId[],
  thursdayMealsLunch: Schema.Types.ObjectId[],
  thursdayMealsDinner: Schema.Types.ObjectId[],
  thursdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  fridayMealsBreakfast: Schema.Types.ObjectId[],
  fridayMealsLunch: Schema.Types.ObjectId[],
  fridayMealsDinner: Schema.Types.ObjectId[],
  fridaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  saturdayMealsBreakfast: Schema.Types.ObjectId[],
  saturdayMealsLunch: Schema.Types.ObjectId[],
  saturdayMealsDinner: Schema.Types.ObjectId[],
  saturdaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  sundayMealsBreakfast: Schema.Types.ObjectId[],
  sundayMealsLunch: Schema.Types.ObjectId[],
  sundayMealsDinner: Schema.Types.ObjectId[],
  sundaySnaks: {
    foodId: Schema.Types.ObjectId,
    qty: number
  }[],
  shoppingList: { foodItem: string, qty: number, qtyOption: string, isPurchased: boolean, image: string; }[]
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
  privateAll: {type: Boolean, default: false, required: true},
  mondayMealsBreakfast: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  mondayMealsLunch: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  mondayMealsDinner: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  mondaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  tuesdayMealsBreakfast: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  tuesdayMealsLunch: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  tuesdayMealsDinner: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  tuesdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  wednesdayMealsBreakfast: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  wednesdayMealsLunch: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  wednesdayMealsDinner: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  wednesdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  thursdayMealsBreakfast: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  thursdayMealsLunch: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  thursdayMealsDinner: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  thursdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  fridayMealsBreakfast: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  fridayMealsLunch: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  fridayMealsDinner: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  fridaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  saturdayMealsBreakfast: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  saturdayMealsLunch: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  saturdayMealsDinner: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  saturdaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  sundayMealsBreakfast: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  sundayMealsLunch: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  sundayMealsDinner: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
  sundaySnaks: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
    qty: { type: Number, required: true }
  }],
  shoppingList: [{ foodItem: String, qty: Number, qtyOption: String, isPurchased: Boolean, image: String }]
},
{ timestamps: true },);

weeklyPlanSchema.method("nameReturn", function nameReturn() {
  return this.name;
});

createModel<IFood, FoodModel>("FoodItem", foodSchema)
createModel<IMeal, MealModel>("Meal", mealSchema)

export default createModel<IWeeklyPlan, WeeklyPlanModel>("WeeklyPlan", weeklyPlanSchema);