
"use client"
import { useState, useEffect } from "react";
import { Product } from "@/types";

export default function useProductFilter(products: Product[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  
  // Get unique categories
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  
  useEffect(() => {
    // Filter products based on search, category, and price range
    const filtered = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = 
        !selectedCategory || 
        selectedCategory === "All" || 
        product.category === selectedCategory;
        
      const matchesPrice = 
        product.price >= priceRange[0] && 
        product.price <= priceRange[1];
        
      return matchesSearch && matchesCategory && matchesPrice;
    });
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange]);
  
  const handleFilterChange = (filters: {
    searchTerm: string;
    category: string;
    priceRange: [number, number];
  }) => {
    setSearchTerm(filters.searchTerm);
    setSelectedCategory(filters.category);
    setPriceRange(filters.priceRange);
  };
  
  return {
    filteredProducts,
    categories,
    handleFilterChange,
    searchTerm,
    selectedCategory,
    priceRange
  };
}
