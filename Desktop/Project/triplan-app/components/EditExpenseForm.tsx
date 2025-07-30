import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Expense } from "@/lib/types";

interface EditExpenseFormProps {
  expense: Expense;
  onSubmit: (expense: Omit<Expense, "id">) => void;
  onCancel: () => void;
}

const categories = ["Ăn uống", "Đi lại", "Vé tham quan", "Mua sắm", "Chỗ ở", "Giải trí", "Khác"];

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({ expense, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState(expense.amount.toLocaleString("vi-VN"));
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [date, setDate] = useState(expense.date);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    setAmount(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFormattedNumber(amount);
    onSubmit({
      amount: numericAmount,
      category,
      description,
      date,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-expense-amount">Số tiền (VNĐ)</Label>
        <Input
          id="edit-expense-amount"
          type="text"
          placeholder="100.000"
          value={amount}
          onChange={handleAmountChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-expense-category">Danh mục</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-expense-description">Mô tả</Label>
        <Input
          id="edit-expense-description"
          placeholder="VD: Ăn trưa tại nhà hàng ABC"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-expense-date">Ngày</Label>
        <Input 
          id="edit-expense-date" 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />
      </div>

      <div className="flex space-x-2">
        <Button type="submit" className="flex-1">
          Cập nhật
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  );
};

export default EditExpenseForm; 