"use client";
import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, Heart, TrendingUp, Package, ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';
import UserProfileSidebar from "../../components/UserProfileSidebar";
import Footer from '../../components/Footer';
import NavbarMenu from "../../components/Navbar-Menu";
import AddProductModal from "../../components/AddProductModal";
import SellerRegistrationModal from "../../components/SellerRegistrationModal";

const SellerDashboardPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [sellerActiveTab, setSellerActiveTab] = useState('Dashboard');
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isSellerRegistrationModalOpen, setIsSellerRegistrationModalOpen] = useState(false);
    
    // Add Product Modal state
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

    // Seller Registration Modal state
    const [sellerRegistrationForm, setSellerRegistrationForm] = useState({
        shopName: '',
        address: '',
        detailedAddress: '',
        contactNumber: '',
        governmentId1Front: null as File | null,
        governmentId1Back: null as File | null,
        governmentId2Front: null as File | null,
        governmentId2Back: null as File | null,
        transactionOptions: [] as string[],
        termsAccepted: false
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

    // Add Product Modal handlers
    const handleAddProductFormChange = (field: keyof typeof addProductForm, value: any) => {
        setAddProductForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddProductCheckboxChange = (field: 'modeOfDelivery' | 'modeOfPayment', value: string, checked: boolean) => {
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

    // Seller Registration Modal handlers
    const handleSellerRegistrationFormChange = (field: keyof typeof sellerRegistrationForm, value: any) => {
        setSellerRegistrationForm(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleSellerRegistrationCheckboxChange = (field: 'transactionOptions', value: string, checked: boolean) => {
        setSellerRegistrationForm(prev => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const handleSellerRegistrationFileUpload = (field: keyof typeof sellerRegistrationForm, file: File | null) => {
        setSellerRegistrationForm(prev => ({
            ...prev,
            [field]: file
        }));
    };

    const handleSubmitSellerRegistration = () => {
        // Handle seller registration submission here
        console.log('Seller registration data:', sellerRegistrationForm);
        setIsSellerRegistrationModalOpen(false);
        // Reset form
        setSellerRegistrationForm({
            shopName: '',
            address: '',
            detailedAddress: '',
            contactNumber: '',
            governmentId1Front: null,
            governmentId1Back: null,
            governmentId2Front: null,
            governmentId2Back: null,
            transactionOptions: [],
            termsAccepted: false
        });
    };


    const handleWishlistClick = () => {
        // Add wishlist functionality here
        console.log('Wishlist clicked');
    };

    const handleCartClick = () => {
        // Add cart functionality here
        console.log('Cart clicked');
    };

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

    return (
        <>

         {/* Sidebar */}
            <UserProfileSidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
        {/* NAVBAR */}
            <NavbarMenu 
                onWishlistClick={handleWishlistClick}
                onCartClick={handleCartClick}
            />

            <div className="flex min-h-screen bg-gray-50">
                <div className="flex-1 ml-80 p-8 overflow-y-auto">    
                    {/* Main Content */}
                    <div className="flex-1 pt-20">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="w-full max-w-[1200px]">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Seller Dashboard</h1>
                                    <button
                                        onClick={() => setIsSellerRegistrationModalOpen(true)}
                                        className="flex items-center px-4 py-2 bg-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Seller Registration
                                    </button>

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
            <Footer />
                </div>
            </div>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={() => setIsAddProductModalOpen(false)}
                formData={addProductForm}
                onFormChange={handleAddProductFormChange}
                onCheckboxChange={handleAddProductCheckboxChange}
                onImageUpload={handleImageUpload}
                onSubmit={handleSubmitProduct}
            />

            {/* Seller Registration Modal */}
            <SellerRegistrationModal
                isOpen={isSellerRegistrationModalOpen}
                onClose={() => setIsSellerRegistrationModalOpen(false)}
                formData={sellerRegistrationForm}
                onFormChange={handleSellerRegistrationFormChange}
                onCheckboxChange={handleSellerRegistrationCheckboxChange}
                onFileUpload={handleSellerRegistrationFileUpload}
                onSubmit={handleSubmitSellerRegistration}
            />


        </>

    );
};

export default SellerDashboardPage;