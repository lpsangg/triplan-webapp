import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AddExpenseForm from "@/components/AddExpenseForm";
import type { Trip, Expense } from "@/lib/types";
// import ExpenseSplitting from "./expense-splitting"; // Nếu cần
// import AddExpenseForm từ trip-detail nếu cần tách riêng

interface BudgetTabProps {
  trip: Trip;
  budget: number;
  expenses: Expense[];
  totalExpenses: number;
  budgetProgress: number;
  onSetBudget: (budget: number) => void;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

// Dummy AddExpenseForm, cần thay thế bằng import thực tế nếu có
// const AddExpenseForm = (props: any) => null;
// Dummy ExpenseSplitting, cần thay thế bằng import thực tế nếu có
// const ExpenseSplitting = (props: any) => null;

const BudgetTab: React.FC<BudgetTabProps> = ({ trip, budget, expenses, totalExpenses, budgetProgress, onSetBudget, onAddExpense }) => {
  const [newBudget, setNewBudget] = useState(budget > 0 ? budget.toLocaleString("vi-VN") : "");

  // Hàm format số với dấu chấm phân cách hàng nghìn
  const formatNumber = (value: string) => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^\d]/g, "");
    if (numericValue === "") return "";
    
    // Chuyển thành số và format với dấu chấm
    const number = parseInt(numericValue, 10);
    return number.toLocaleString("vi-VN");
  };

  // Hàm chuyển đổi từ format có dấu chấm về số
  const parseFormattedNumber = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    setNewBudget(formattedValue);
  };

  const handleSetBudget = () => {
    const numericValue = parseFormattedNumber(newBudget);
    onSetBudget(numericValue);
    // Cập nhật lại state với giá trị đã format
    setNewBudget(numericValue > 0 ? numericValue.toLocaleString("vi-VN") : "");
  };

  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan ngân sách</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="budget">Ngân sách dự kiến (VNĐ)</Label>
              <Input
                id="budget"
                type="text"
                value={newBudget}
                onChange={handleBudgetChange}
                placeholder="Nhập ngân sách (VD: 3.000.000)"
              />
            </div>
            <Button onClick={handleSetBudget}>Cập nhật</Button>
          </div>

          {budget > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Đã chi: {totalExpenses.toLocaleString("vi-VN")} VNĐ</span>
                <span>Ngân sách: {budget.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <Progress value={budgetProgress} className="w-full" />
              <div className="text-sm text-gray-600">
                Còn lại: {(budget - totalExpenses).toLocaleString("vi-VN")} VNĐ
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chi tiêu</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm chi tiêu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm khoản chi tiêu</DialogTitle>
                </DialogHeader>
                <AddExpenseForm onSubmit={onAddExpense} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có khoản chi tiêu nào</p>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{expense.description}</h4>
                    <p className="text-sm text-gray-600">{expense.category}</p>
                    <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{expense.amount.toLocaleString("vi-VN")} VNĐ</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories */}
      {Object.keys(expensesByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <span className="text-lg">{amount.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Splitting Section */}
      {/* ExpenseSplitting tripId={trip.id} /> */}
    </div>
  );
};

export default BudgetTab; 