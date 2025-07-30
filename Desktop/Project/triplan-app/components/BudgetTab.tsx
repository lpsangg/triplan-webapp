import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, TrendingUp, PieChart, BarChart3, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AddExpenseForm from "@/components/AddExpenseForm";
import EditExpenseForm from "@/components/EditExpenseForm";
import type { Trip, Expense } from "@/lib/types";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
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
  onUpdateExpense?: (id: number, expense: Omit<Expense, "id">) => void;
  onDeleteExpense?: (id: number) => void;
}

// Dummy AddExpenseForm, cần thay thế bằng import thực tế nếu có
// const AddExpenseForm = (props: any) => null;
// Dummy ExpenseSplitting, cần thay thế bằng import thực tế nếu có
// const ExpenseSplitting = (props: any) => null;

const BudgetTab: React.FC<BudgetTabProps> = ({ 
  trip, 
  budget, 
  expenses, 
  totalExpenses, 
  budgetProgress, 
  onSetBudget, 
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense 
}) => {
  const [newBudget, setNewBudget] = useState(budget > 0 ? budget.toLocaleString("vi-VN") : "");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  // Dữ liệu cho biểu đồ pie chart
  const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Dữ liệu cho biểu đồ bar chart theo ngày
  const expensesByDate = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString("vi-VN");
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(expensesByDate).map(([date, amount]) => ({
    date,
    amount,
  }));

  // Màu sắc cho biểu đồ
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"];

  // Custom tooltip cho pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">
            {payload[0].value.toLocaleString("vi-VN")} VNĐ
          </p>
          <p className="text-sm text-gray-600">
            {((payload[0].value / totalExpenses) * 100).toFixed(1)}% tổng chi tiêu
          </p>
        </div>
      );
    }
    return null;
  };

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
                  <div className="flex-1">
                    <h4 className="font-semibold">{expense.description}</h4>
                    <p className="text-sm text-gray-600">{expense.category}</p>
                    <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-4">
                      <p className="font-semibold text-lg">{expense.amount.toLocaleString("vi-VN")} VNĐ</p>
                    </div>
                    <div className="flex space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Chỉnh sửa khoản chi tiêu</DialogTitle>
                          </DialogHeader>
                          <EditExpenseForm
                            expense={expense}
                            onSubmit={(updatedExpense) => {
                              if (onUpdateExpense) {
                                onUpdateExpense(expense.id, updatedExpense);
                              }
                              setEditingExpense(null);
                            }}
                            onCancel={() => setEditingExpense(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (onDeleteExpense) {
                            onDeleteExpense(expense.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories with Charts */}
      {Object.keys(expensesByCategory).length > 0 && (
        <>
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                <CardTitle>Phân bổ chi tiêu theo danh mục</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          {barChartData.length > 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <CardTitle>Chi tiêu theo ngày</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [value.toLocaleString("vi-VN") + " VNĐ", "Số tiền"]}
                        labelFormatter={(label) => `Ngày: ${label}`}
                      />
                      <Bar dataKey="amount" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Summary */}
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
        </>
      )}

      {/* Add Expense Splitting Section */}
      {/* ExpenseSplitting tripId={trip.id} /> */}
    </div>
  );
};

export default BudgetTab; 