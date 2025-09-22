// src/components/forms/NutritionForm.tsx
import React, { useState } from "react";
import type { Meal, FoodItem, MealType } from "../../pages/Nutrition";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface NutritionFormProps {
  meal?: Meal | null;
  foodItems: FoodItem[];
  onAddFoodItem: (item: Omit<FoodItem, "id">) => void;
  onSubmit: (meal: Omit<Meal, "id">) => void;
  onCancel: () => void;
}

const NutritionForm: React.FC<NutritionFormProps> = ({
  meal,
  foodItems,
  onAddFoodItem,
  onSubmit,
  onCancel,
}) => {
  const [mealType, setMealType] = useState<MealType>(meal?.type || "breakfast");
  const [date, setDate] = useState(
    meal?.date || new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(meal?.notes || "");
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>(
    meal?.items || []
  );
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [newFood, setNewFood] = useState<Omit<FoodItem, "id">>({
    name: "",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    amount: 100,
    unit: "g",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: mealType,
      date,
      items: selectedItems,
      notes,
    });
  };

  const handleAddFood = () => {
    onAddFoodItem(newFood);
    setSelectedItems([
      ...selectedItems,
      { ...newFood, id: `temp-${Date.now()}` },
    ]);
    setNewFood({
      name: "",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      amount: 100,
      unit: "g",
    });
    setShowFoodForm(false);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {meal ? "Edit Meal" : "Add New Meal"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Type
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Food Items</h3>
            <button
              type="button"
              onClick={() => setShowFoodForm(!showFoodForm)}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              {showFoodForm ? "Hide Form" : "+ Add Custom Food"}
            </button>
          </div>

          {showFoodForm && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="font-medium mb-2">Add New Food Item</h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newFood.name}
                    onChange={(e) =>
                      setNewFood({ ...newFood, name: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Amount
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newFood.amount}
                      onChange={(e) =>
                        setNewFood({
                          ...newFood,
                          amount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-3/4 px-2 py-1 text-sm border border-gray-300 rounded-l-md"
                    />
                    <select
                      value={newFood.unit}
                      onChange={(e) =>
                        setNewFood({ ...newFood, unit: e.target.value })
                      }
                      className="w-1/4 px-1 py-1 text-sm border border-gray-300 rounded-r-md"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="portion">portion</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={newFood.calories}
                    onChange={(e) =>
                      setNewFood({
                        ...newFood,
                        calories: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={newFood.protein}
                    onChange={(e) =>
                      setNewFood({
                        ...newFood,
                        protein: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={newFood.fat}
                    onChange={(e) =>
                      setNewFood({
                        ...newFood,
                        fat: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={newFood.carbs}
                    onChange={(e) =>
                      setNewFood({
                        ...newFood,
                        carbs: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddFood}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
              >
                Add Food
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {foodItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.calories} kcal | P: {item.protein}g | F: {item.fat}g |
                    C: {item.carbs}g
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !selectedItems.some((selected) => selected.id === item.id)
                    ) {
                      setSelectedItems([...selectedItems, item]);
                    }
                  }}
                  disabled={selectedItems.some(
                    (selected) => selected.id === item.id
                  )}
                  className={`px-2 py-1 text-xs rounded-md ${
                    selectedItems.some((selected) => selected.id === item.id)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-primary-100 text-primary-800 hover:bg-primary-200"
                  }`}
                >
                  {selectedItems.some((selected) => selected.id === item.id)
                    ? "Added"
                    : "Add"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Selected Items</h4>
          {selectedItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No items selected</p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({item.amount}
                      {item.unit}) - {item.calories} kcal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {meal ? "Update Meal" : "Add Meal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NutritionForm;
