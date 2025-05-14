
"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type ProductFilterProps = {
  categories: string[];
  onFilterChange: (filters: {
    searchTerm?: string;
    category: string;
    price?: {
      gte: number;
      lte: number;
    };
  }) => void;
};

export default function ProductFilter({ categories, onFilterChange }: ProductFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ searchTerm: value, category: selectedCategory });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onFilterChange({ searchTerm, category: value });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = parseInt(e.target.value) || 0;
    const newRange: [number, number] = [min, priceRange[1]];
    setPriceRange(newRange);
    onFilterChange({ searchTerm, category: selectedCategory, price: {gte: newRange[0], lte: newRange[1]} });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = parseInt(e.target.value) || 0;
    const newRange: [number, number] = [priceRange[0], max];
    setPriceRange(newRange);
    console.log("newRange", newRange)
    onFilterChange({ searchTerm, category: selectedCategory, price: {gte: newRange[0], lte: newRange[1]} });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange([0, 2000]);
    onFilterChange({ searchTerm: "", category: "", price: {gte: 0, lte: 2000} });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            Search Products
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name or description..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <Label htmlFor="category" className="text-sm font-medium mb-2 block">
            Category
          </Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={handleMinPriceChange}
              min="0"
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={handleMaxPriceChange}
              min="0"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
