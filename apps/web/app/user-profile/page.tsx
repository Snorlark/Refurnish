// Updated user-profile
"use client";
import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, Heart } from 'lucide-react';
import UserProfileSidebar from '../../components/UserProfileSidebar';
import Footer from '../../components/Footer';

const AccountPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Form state for profile
    const [profileData, setProfileData] = useState({
        firstName: 'Chaeyoung',
        lastName: 'Son',
        email: 'discrexha@gmail.com',
        contactNumber: '09969653965',
        address: 'Brgy. 29, Calata City, Cavite, 4109',
        detailedAddress: '2104 Block 23, Dumaloacting St.',
        birthday: '04/23/1999',
        gender: 'female'
    });

    const handleInputChange = (field: string, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveChanges = () => {
        console.log('Saving profile changes:', profileData);
        // Handle save logic here
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

    const renderAccountContent = () => (
    <div className="w-full max-w-[1200px]">
        <div >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                        placeholder="Chaeyoung"
                    />
                </div>

                {/* Last Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                        placeholder="Son"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                        placeholder="discrexha@gmail.com"
                    />
                </div>

                {/* Birthday */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birthday <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={profileData.birthday}
                        onChange={(e) => handleInputChange('birthday', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                        placeholder="04/23/1999"
                    />
                </div>

                {/* Contact Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={profileData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                        placeholder="09969653965"
                    />
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-6">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={profileData.gender === 'female'}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Female</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={profileData.gender === 'male'}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Male</span>
                        </label>
                    </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                        placeholder="Brgy. 29, Calata City, Cavite, 4109"
                    />
                </div>

                {/* Detailed Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={profileData.detailedAddress}
                        onChange={(e) => handleInputChange('detailedAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                        placeholder="2104 Block 23, Dumaloacting St."
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSaveChanges}
                    className="bg-(--color-green) hover:bg-green-800 transition-modern text-white px-8 py-3 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-[12px] md:text-[16px]"
                >
                    Save Changes
                </button>
            </div>
        </div>
    </div>
);


    return (
        <div className="min-h-screen bg-gray-50">
            {renderNavbar()}

            <div className="flex justify-center">
                <div className="flex max-w-7xl w-full">
                    {/* Sidebar - Now using the extracted component */}
                    <UserProfileSidebar
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />

                    {/* Main Content */}
                    <div className="flex-1 pt-20">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="w-full max-w-[1200px]">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">My Profile</h1>
                                    {renderAccountContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AccountPage;