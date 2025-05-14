"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";
import productService from "@/services/productService";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await productService.getAllProducts({});
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(fetchedProducts.map((product) => product.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = async ({category, search, price}: {category: string; search: string, price?: {gte: number, lte: number}}) => {
    setSelectedCategory(category);
    setSearchQuery(search);

    setLoading(true);
    try {
      const fetchedProducts = await productService.getAllProducts({
        category: category,
        search: search,
        price: price
      });
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      console.error("Error filtering products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      {/* Filters */}
      <ProductFilter
        categories={categories}
        onFilterChange={handleFilterChange}
      />

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
