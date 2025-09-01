"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ShoppingCart, Heart, TrendingUp, Package, ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';
import UserProfileSidebar from "../../components/UserProfileSidebar";
import AddProductModal from "../../components/AddProductModal";
import SellerRegistrationModal from "../../components/SellerRegistrationModal";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Footer = () => (
    <footer className="bg-gray-100 p-8 text-center text-gray-600">
        <div>Footer Content</div>
    </footer>
);

const SellerDashboardPage = () => {
    const navbarRef = useRef<HTMLElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [sellerActiveTab, setSellerActiveTab] = useState('Dashboard');
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [addProductForm, setAddProductForm] = useState({
        productName: '',
        category: '',
        condition: '',
        material: '',
        age: '',
        description: '',
        images: [null, null, null, null] as (File | null)[],
        modeOfTransaction: 'For Sale',
        price: '',
        modeOfDelivery: [] as string[],
        modeOfPayment: [] as string[]
    });

    // Sample data for seller dashboard
    const salesData = {
        totalSales: 6590.00,
        toProcessShipment: 4,
        processedShipment: 50,
        completedOrders: 54,
        totalOrders: 108
    };

    const sampleProducts = Array.from({ length: 13 }, (_, i) => ({
        id: i + 1,
        name: '360° Swivel Wooden Office Chair',
        quantity: 1,
        price: i % 3 === 0 ? 'SWAP' : 750,
        status: ['Unpaid', 'To Ship', 'Shipping', 'Completed'][Math.floor(Math.random() * 4)]
    }));

    const sampleOrders = Array.from({ length: 13 }, (_, i) => ({
        id: i + 1,
        product: '360° Swivel Wooden Office Chair',
        quantity: 1,
        status: ['Unpaid', 'To Ship', 'Shipping', 'Completed'][Math.floor(Math.random() * 4)]
    }));

    const handleAddProductFormChange = (field: keyof typeof addProductForm, value: any) => {
        setAddProductForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCheckboxChange = (field: 'modeOfDelivery' | 'modeOfPayment', value: string, checked: boolean) => {
        setAddProductForm(prev => ({
            ...prev,
            [field]: checked 
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const handleImageUpload = (index: number, file: File | null) => {
        const newImages = [...addProductForm.images];
        newImages[index] = file;
        handleAddProductFormChange('images', newImages);
    };

    const handleSubmitProduct = () => {
        // Handle form submission here
        console.log('Product data:', addProductForm);
        setIsAddProductModalOpen(false);
        // Reset form
        setAddProductForm({
            productName: '',
            category: '',
            condition: '',
            material: '',
            age: '',
            description: '',
            images: [null, null, null, null] as (File | null)[],
            modeOfTransaction: 'For Sale',
            price: '',
            modeOfDelivery: [] as string[],
            modeOfPayment: [] as string[]
        });
    };

    const renderNavbar = () => (
        <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img src="/icon/RF.png" alt="RF Logo" className="h-8 w-auto" />
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                placeholder="Search..."
                            />
                        </div>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Search */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search className="h-5 w-5 text-gray-600" />
                        </button>

                        {/* Cart & Wishlist */}
                        <div className="hidden sm:flex items-center space-x-2">
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                                <ShoppingCart className="h-5 w-5 text-gray-600" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                                <Heart className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="h-6 w-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="md:hidden pb-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                placeholder="Search..."
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );

    const renderSellerNavbar = () => (
        <div className="mb-8">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { name: 'Dashboard', icon: TrendingUp },
                        { name: 'Products', icon: Package },
                        { name: 'Orders', icon: ClipboardList }
                    ].map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.name}
                                onClick={() => setSellerActiveTab(tab.name)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${sellerActiveTab === tab.name
                                        ? 'border-green text-green'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="h-5 w-5 mr-2" />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );

    const renderDashboardStats = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-100 p-6 rounded-2xl">
                <div className="text-2xl font-bold text-green-900">₱ {salesData.totalSales.toLocaleString()}</div>
                <div className="text-green-700 text-sm">Sales</div>
            </div>
            <div className="bg-blue-100 p-6 rounded-2xl">
                <div className="text-3xl font-bold text-blue-900">{salesData.toProcessShipment}</div>
                <div className="text-blue-700 text-sm">To-Process Shipment</div>
            </div>
            <div className="bg-purple-100 p-6 rounded-2xl">
                <div className="text-3xl font-bold text-purple-900">{salesData.processedShipment}</div>
                <div className="text-purple-700 text-sm">Processed Shipment</div>
            </div>
            <div className="bg-orange-100 p-6 rounded-2xl">
                <div className="text-3xl font-bold text-orange-900">{salesData.completedOrders}</div>
                <div className="text-orange-700 text-sm">Completed</div>
            </div>
        </div>
    );

    const renderProductsTable = () => (
        <div className="overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <h3 className="text-lg font-bold text-gray-900">My Products</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none bg-white pr-8 text-left">
                            <option>Sort By</option>
                            <option>Name</option>
                            <option>Price</option>
                            <option>Quantity</option>
                        </select>
                        <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="relative">
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none bg-white pr-8 text-left">
                            <option>Filter By</option>
                            <option>All</option>
                            <option>Available</option>
                            <option>Out of Stock</option>
                        </select>
                        <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <button 
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product(s)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sampleProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {typeof product.price === 'number' ? `₱ ${product.price}` : product.price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button className="text-green-600 hover:text-green-900">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderOrdersTable = () => (
        <div className="overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{salesData.toProcessShipment}</div>
                        <div className="text-sm text-gray-600">To-Process Shipment</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{salesData.processedShipment}</div>
                        <div className="text-sm text-gray-600">Processed Shipment</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{salesData.completedOrders}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{salesData.totalOrders}</div>
                        <div className="text-sm text-gray-600">Total No. of Orders</div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none bg-white pr-8 text-left">
                        <option>Select Overview</option>
                        <option>All Orders</option>
                        <option>Pending</option>
                        <option>Completed</option>
                    </select>
                    <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="relative">
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none bg-white pr-8 text-left">
                            <option>Sort By</option>
                            <option>Name</option>
                            <option>Price</option>
                            <option>Quantity</option>
                        </select>
                        <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product(s)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sampleOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Shipping' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'To Ship' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button className="text-green-600 hover:text-green-900">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Navbar animation (reused from Home)
        useEffect(() => {
          if (!navbarRef.current) return;
      
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: "main",
              start: "top top",
              end: "+=100",
              scrub: 0.5,
              onUpdate: (self) => {
                const progress = self.progress;
                const height = gsap.utils.interpolate(80, 60, progress);
                const marginX = gsap.utils.interpolate(32, 18, progress);
                const marginY = gsap.utils.interpolate(0, 16, progress);
                const paddingX = gsap.utils.interpolate(26, 16, progress);
                
                gsap.set(navbarRef.current, {
                  height: height,
                  marginLeft: marginX,
                  marginRight: marginX,
                  marginTop: marginY,
                  marginBottom: marginY,
                });
                
                const innerContainer = navbarRef.current?.querySelector('.nav-inner');
                if (innerContainer) {
                  gsap.set(innerContainer, {
                    paddingLeft: paddingX,
                    paddingRight: paddingX,
                  });
                }
                
                const logo = navbarRef.current?.querySelector('.nav-logo img');
                if (logo) {
                  const logoScale = gsap.utils.interpolate(1, 0.85, progress);
                  gsap.set(logo, { scale: logoScale });
                }
                
                const navLinks = Array.from(navbarRef.current?.querySelectorAll('.nav-links a') || []);
                navLinks.forEach((link) => {
                  const textScale = gsap.utils.interpolate(1, 0.9, progress);
                  gsap.set(link, { scale: textScale });
                });
                
                const icons = Array.from(navbarRef.current?.querySelectorAll('.nav-icons > div') || []);
                icons.forEach((icon) => {
                  const iconScale = gsap.utils.interpolate(1, 0.9, progress);
                  gsap.set(icon, { scale: iconScale });
                });
              }
            }
          });
      
          return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
          };
        }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* {renderNavbar()} */}
        <nav
            ref={navbarRef}
            className="bg-(--color-white)  backdrop-blur-md rounded-full mx-3 sm:mx-6 md:mx-10 my-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
            style={{ height: 72 }}
            >
            <div className="nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-9 h-full">
                <div className="flex justify-between items-center h-full gap-3">
                <Link href="/landing" className="nav-logo flex items-center flex-shrink-0">
                    <img src="/icon/RF.png" alt="Logo" className="h-6 sm:h-7 w-auto object-cover" />
                </Link>
                <div className="nav-icons flex items-center space-x-3 sm:space-x-4 text-gray-700">
                    <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:text-(--color-olive)">
                    <img src="/icon/heartIcon.png" alt="Wishlist" className="h-4 w-auto" />
                    </button>
                    <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-(--color-olive)">
                    <img src="/icon/cartIcon.png" alt="Cart" className="h-4 w-auto" />
                    </button>
                
                </div>
                </div>
            </div>
        </nav>

            <div className="flex justify-center">
                <div className="flex max-w-7xl w-full">
                    {/* Sidebar */}
                    <UserProfileSidebar
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />

                    {/* Main Content */}
                    <div className="flex-1 pt-20">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="w-full max-w-[1200px]">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Seller Dashboard</h1>

                                    {renderSellerNavbar()}

                                    {sellerActiveTab === 'Dashboard' && (
                                        <div>
                                            {renderDashboardStats()}
                                            <div className="text-center py-8">
                                                <p className="text-gray-600">Additional dashboard content coming soon...</p>
                                            </div>
                                        </div>
                                    )}

                                    {sellerActiveTab === 'Products' && renderProductsTable()}
                                    {sellerActiveTab === 'Orders' && renderOrdersTable()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={() => setIsAddProductModalOpen(false)}
                formData={addProductForm}
                onFormChange={handleAddProductFormChange}
                onCheckboxChange={handleCheckboxChange}
                onImageUpload={handleImageUpload}
                onSubmit={handleSubmitProduct}
            />

            <Footer />
        </div>
    );
};

export default SellerDashboardPage;