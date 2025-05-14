"use client"
import { useEffect, useState } from "react";
import Link  from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import productService from "@/services/productService";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const fetchedProducts = await productService.getAllProducts({});
        setFeaturedProducts(fetchedProducts.slice(0, 3));
        
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-escrow-blue to-escrow-teal rounded-2xl overflow-hidden mb-16 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Secure Transactions with Escrow Protection
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Buy and sell with confidence knowing your transactions are protected by our secure escrow service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-escrow-blue hover:bg-gray-100">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute right-0 bottom-0 w-1/3 h-full bg-white/10 transform -skew-x-12 translate-x-1/3 hidden lg:block"></div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Our Escrow Service Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our secure platform protects both buyers and sellers by holding funds in escrow until the terms of the transaction are met.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 escrow-card">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-escrow-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Buyer Deposits Funds</h3>
            <p className="text-gray-600">
              The buyer places funds in our secure escrow account to start the transaction.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 escrow-card">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-escrow-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Seller Ships Item</h3>
            <p className="text-gray-600">
              The seller ships the product knowing the payment is secured in escrow.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 escrow-card">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-escrow-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Funds Released</h3>
            <p className="text-gray-600">
              Upon buyer approval, funds are released to the seller, completing the transaction.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <Button asChild className="bg-escrow-blue hover:bg-escrow-teal">
            <Link href="/how-it-works">Learn More About Escrow</Link>
          </Button>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check out our top-rated products with secure escrow protection.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-escrow-blue text-escrow-blue hover:bg-escrow-blue hover:text-white">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50 rounded-xl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Thousands of users trust our platform for secure transactions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-escrow-blue font-medium">MK</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Maria K.</h4>
                  <p className="text-sm text-gray-500">Buyer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The escrow service gave me peace of mind when purchasing expensive electronics online. I knew my money was safe until I received exactly what I ordered."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-escrow-blue font-medium">JT</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">James T.</h4>
                  <p className="text-sm text-gray-500">Seller</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As a seller, this platform has helped me build trust with my customers. The escrow system protects both parties, making transactions smooth and secure."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-escrow-blue font-medium">AL</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Alex L.</h4>
                  <p className="text-sm text-gray-500">Buyer & Seller</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The dispute resolution feature saved me when I received an item that didn't match the description. The process was fair and efficient."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
