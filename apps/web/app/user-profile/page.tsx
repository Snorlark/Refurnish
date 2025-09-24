"use client";
import React, { useState } from 'react';
import UserProfileSidebar from '../../components/UserProfileSidebar';
import NavbarMenu from '../../components/Navbar-Menu';
import Link from "next/link";
import Footer from '../../components/Footer';

const AccountPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // Handlers for navbar actions
    const handleWishlistClick = () => {
        // Add wishlist functionality here
        console.log('Wishlist clicked');
    };

    const handleCartClick = () => {
        // Add cart functionality here
        console.log('Cart clicked');
    };

    const handleInputChange = (field: string, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveChanges = () => {
        console.log('Saving profile changes:', profileData);
        // Handle save logic here
    }; 1

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
        <>
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
                                    <h1 className="text-2xl sm:text-3xl font-bold text-(--color-olive) mb-6 sm:mb-8">My Profile</h1>
                                    {renderAccountContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                    
            <Footer />
                </div>
                
            </div>
            
        </>
    );
};

export default AccountPage;