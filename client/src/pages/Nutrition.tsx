// src/pages/Nutrition.tsx
import React, { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isToday,
  isSameDay,
  parseISO,
} from "date-fns";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import NutritionForm from "../components/forms/NutritionForm";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type NutritionGoal = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  amount: number;
  unit: string; // 'g', 'ml', 'portion'
}

export interface Meal {
  id: string;
  type: MealType;
  date: string; // ISO date string
  items: FoodItem[];
  notes?: string;
}

const Nutrition: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [dailyGoals, setDailyGoals] = useState<NutritionGoal>({
    calories: 2000,
    protein: 150,
    fat: 70,
    carbs: 200,
  });

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedMeals = localStorage.getItem("nutrition-meals");
      const savedFoodItems = localStorage.getItem("nutrition-food-items");
      const savedGoals = localStorage.getItem("nutrition-goals");

      if (savedMeals) setMeals(JSON.parse(savedMeals));
      if (savedFoodItems) setFoodItems(JSON.parse(savedFoodItems));
      if (savedGoals) setDailyGoals(JSON.parse(savedGoals));

      setLoading(false);
    } catch (err) {
      setError("Failed to load nutrition data");
      setLoading(false);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("nutrition-meals", JSON.stringify(meals));
    localStorage.setItem("nutrition-food-items", JSON.stringify(foodItems));
    localStorage.setItem("nutrition-goals", JSON.stringify(dailyGoals));
  }, [meals, foodItems, dailyGoals]);

  const handleCreateMeal = (meal: Omit<Meal, "id">) => {
    const newMeal: Meal = {
      ...meal,
      id: `meal-${Date.now()}`,
    };
    setMeals([...meals, newMeal]);
    setShowForm(false);
  };

  const handleUpdateMeal = (updatedMeal: Meal) => {
    setMeals(meals.map((m) => (m.id === updatedMeal.id ? updatedMeal : m)));
    setEditingMeal(null);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  const handleAddFoodItem = (item: Omit<FoodItem, "id">) => {
    const newItem: FoodItem = {
      ...item,
      id: `food-${Date.now()}`,
    };
    setFoodItems([...foodItems, newItem]);
  };

  const toggleDayExpansion = (date: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const prevWeek = () => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const nextWeek = () => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // Generate week days for the tracker
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const day = addDays(startOfWeek(currentWeek), index);
    const dateStr = format(day, "yyyy-MM-dd");
    return {
      date: day,
      dateStr,
      dayName: format(day, "EEE"),
      dateNum: format(day, "d"),
      isToday: isToday(day),
      meals: meals.filter((meal) => isSameDay(parseISO(meal.date), day)),
    };
  });

  // Calculate totals for a day
  const calculateDayTotals = (dayMeals: Meal[]) => {
    return dayMeals.reduce(
      (acc, meal) => {
        const mealTotals = meal.items.reduce(
          (mealAcc, item) => {
            return {
              calories: mealAcc.calories + item.calories,
              protein: mealAcc.protein + item.protein,
              fat: mealAcc.fat + item.fat,
              carbs: mealAcc.carbs + item.carbs,
            };
          },
          { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        return {
          calories: acc.calories + mealTotals.calories,
          protein: acc.protein + mealTotals.protein,
          fat: acc.fat + mealTotals.fat,
          carbs: acc.carbs + mealTotals.carbs,
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    return Math.min(100, (current / goal) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracker</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Week Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={prevWeek}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold">
          {format(startOfWeek(currentWeek), "MMM d")} -{" "}
          {format(addDays(startOfWeek(currentWeek), 6), "MMM d, yyyy")}
        </h2>

        <button
          onClick={nextWeek}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Goals Editor */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Daily Nutrition Goals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calories
            </label>
            <input
              type="number"
              value={dailyGoals.calories}
              onChange={(e) =>
                setDailyGoals({
                  ...dailyGoals,
                  calories: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              value={dailyGoals.protein}
              onChange={(e) =>
                setDailyGoals({
                  ...dailyGoals,
                  protein: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fat (g)
            </label>
            <input
              type="number"
              value={dailyGoals.fat}
              onChange={(e) =>
                setDailyGoals({
                  ...dailyGoals,
                  fat: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carbs (g)
            </label>
            <input
              type="number"
              value={dailyGoals.carbs}
              onChange={(e) =>
                setDailyGoals({
                  ...dailyGoals,
                  carbs: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Week View */}
      <div className="space-y-4">
        {weekDays.map((day) => {
          const dayTotals = calculateDayTotals(day.meals);
          const isExpanded = expandedDays[day.dateStr] || false;

          return (
            <div
              key={day.dateStr}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className={`p-4 flex justify-between items-center cursor-pointer ${
                  day.isToday ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => toggleDayExpansion(day.dateStr)}
              >
                <div>
                  <h3 className="font-medium">
                    {day.dayName}, {day.dateNum}{" "}
                    {day.isToday && (
                      <span className="text-blue-600 ml-2">Today</span>
                    )}
                  </h3>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span>
                      <span className="font-medium">{dayTotals.calories}</span>{" "}
                      / {dailyGoals.calories} kcal
                    </span>
                    <span>
                      <span className="font-medium">{dayTotals.protein}g</span>{" "}
                      protein
                    </span>
                    <span>
                      <span className="font-medium">{dayTotals.fat}g</span> fat
                    </span>
                    <span>
                      <span className="font-medium">{dayTotals.carbs}g</span>{" "}
                      carbs
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                  {/* Progress Bars */}
                  <div className="mb-4 space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Calories</span>
                        <span>
                          {dayTotals.calories} / {dailyGoals.calories}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dayTotals.calories > dailyGoals.calories
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${calculateProgress(
                              dayTotals.calories,
                              dailyGoals.calories
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Protein</span>
                        <span>
                          {dayTotals.protein}g / {dailyGoals.protein}g
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${calculateProgress(
                              dayTotals.protein,
                              dailyGoals.protein
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fat</span>
                        <span>
                          {dayTotals.fat}g / {dailyGoals.fat}g
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-yellow-500"
                          style={{
                            width: `${calculateProgress(
                              dayTotals.fat,
                              dailyGoals.fat
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Carbs</span>
                        <span>
                          {dayTotals.carbs}g / {dailyGoals.carbs}g
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{
                            width: `${calculateProgress(
                              dayTotals.carbs,
                              dailyGoals.carbs
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Meals List */}
                  <div className="space-y-4">
                    {day.meals.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No meals recorded for this day
                      </p>
                    ) : (
                      day.meals.map((meal) => (
                        <div key={meal.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium capitalize">
                              {meal.type}
                            </h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingMeal(meal)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {meal.notes && (
                            <p className="text-sm text-gray-600 mb-2">
                              {meal.notes}
                            </p>
                          )}

                          <div className="space-y-2">
                            {meal.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.name} ({item.amount}
                                  {item.unit})
                                </span>
                                <span className="text-gray-600">
                                  {item.calories} kcal | P: {item.protein}g | F:{" "}
                                  {item.fat}g | C: {item.carbs}g
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-2 pt-2 border-t text-sm font-medium">
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span>
                                {meal.items.reduce(
                                  (sum, item) => sum + item.calories,
                                  0
                                )}{" "}
                                kcal | P:{" "}
                                {meal.items.reduce(
                                  (sum, item) => sum + item.protein,
                                  0
                                )}
                                g | F:{" "}
                                {meal.items.reduce(
                                  (sum, item) => sum + item.fat,
                                  0
                                )}
                                g | C:{" "}
                                {meal.items.reduce(
                                  (sum, item) => sum + item.carbs,
                                  0
                                )}
                                g
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {meals.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No meals recorded yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start tracking your nutrition by adding your first meal
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Meal
          </button>
        </div>
      )}

      {/* Meal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <NutritionForm
              meal={editingMeal}
              foodItems={foodItems}
              onAddFoodItem={handleAddFoodItem}
              onSubmit={
                editingMeal
                  ? (meal) => {
                      if (!editingMeal) return;
                      handleUpdateMeal({ ...meal, id: editingMeal.id });
                    }
                  : handleCreateMeal
              }
              onCancel={() => {
                setShowForm(false);
                setEditingMeal(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
