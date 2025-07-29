import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Expense } from "@/lib/types";

interface AddExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id">) => void;
}

const categories = ["Ăn uống", "Đi lại", "Vé tham quan", "Mua sắm", "Chỗ ở", "Giải trí", "Khác"];

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number.parseFloat(amount),
      category,
      description,
      date,
    });
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expense-amount">Số tiền (VNĐ)</Label>
        <Input
          id="expense-amount"
          type="number"
          placeholder="100000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-category">Danh mục</Label>
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
        <Label htmlFor="expense-description">Mô tả</Label>
        <Input
          id="expense-description"
          placeholder="VD: Ăn trưa tại nhà hàng ABC"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-date">Ngày</Label>
        <Input id="expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <Button type="submit" className="w-full">
        Thêm chi tiêu
      </Button>
    </form>
  );
};

export default AddExpenseForm; 