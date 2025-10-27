"use client";
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Menu, TrendingUp, Package, ClipboardList, Plus, Edit, Trash2, X, Eye, ChevronLeft, ChevronRight, DollarSign, Users, ShoppingCart, BarChart3, PieChart, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UserProfileSidebar from "../../components/UserProfileSidebar";
import Footer from '../../components/Footer';
import NavbarMenu from "../../components/Navbar-Menu";
import AddProductModal from "../../components/AddProductModal";
import SellerTrackOrders from "../../components/SellerTrackOrders";
import { DashboardStatsSkeleton, ProductsTableSkeleton, ChartSkeleton } from "../../components/SkeletonLoader";
// import SellerRegistrationModal from "../../components/SellerRegistrationModal";
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';

type SellerDashboardProps = {
    embedded?: boolean;
};

const SellerDashboardPage: React.FC<SellerDashboardProps> = ({ embedded = false }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [sellerActiveTab, setSellerActiveTab] = useState('Dashboard');
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [hasProductChanges, setHasProductChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultModalData, setResultModalData] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [sortBy, setSortBy] = useState('name');
    const [filterBy, setFilterBy] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [shopName, setShopName] = useState('');
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasEverLoaded, setHasEverLoaded] = useState(false);
    const hasLoadedInSession = useRef(false);
    const itemsPerPage = 7;

    // Initialize lastRefresh on client side only to prevent hydration mismatch
    useEffect(() => {
        setLastRefresh(new Date());
    }, []);
    
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
        quantity: 1,
        modeOfDelivery: '',
        modeOfPayment: [] as string[],
        location: '',
        swapWantedCategory: '',
        swapWantedDescription: '',
    });

    // Seller registration removed on seller dashboard

    // Real-time dashboard data will be calculated from sellerProducts

    // Real products fetched per seller
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const { token, user } = useAuth();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    

    // WebSocket handlers - wrapped in useCallback to prevent infinite re-renders
    const handleProductStatusUpdate = useCallback((data: any) => {
        console.log('Product status update received:', data);
        
        // Update the specific product in the local state
        setSellerProducts(prev => prev.map(product => 
            (product._id || product.id) === data.productId 
                ? { ...product, status: data.status }
                : product
        ));

        // Show notification
        setResultModalData({
            type: 'success',
            message: data.message
        });
        setShowResultModal(true);
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            setShowResultModal(false);
        }, 5000);
    }, []);

    const handleProductSoldUpdate = useCallback((data: any) => {
        console.log('Product sold update received:', data);
        
        // Update the specific product in the local state
        setSellerProducts(prev => prev.map(product => 
            (product._id || product.id) === data.productId 
                ? { ...product, status: 'sold' }
                : product
        ));

        // Show notification
        setResultModalData({
            type: 'success',
            message: `🎉 Your product "${data.productName}" has been sold!`
        });
        setShowResultModal(true);
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            setShowResultModal(false);
        }, 5000);
    }, []);

    // WebSocket connection
    const { isConnected } = useWebSocket({
        userId: user?.id,
        onProductStatusUpdate: handleProductStatusUpdate,
        onProductSoldUpdate: handleProductSoldUpdate
    });

    // Refresh data function
    const refreshSellerData = useCallback(async () => {
        if (!token || !user?.id) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const all = await res.json().catch(() => []);
            if (Array.isArray(all)) {
                const mine = all.filter((p: any) => (p.owner?._id || p.owner) === user.id);
                setSellerProducts(mine);
                setLastRefresh(new Date());
                // Always set data as loaded when refresh completes
                setIsDataLoaded(true);
            }
        } catch (error) {
            console.error('Error refreshing seller data:', error);
        }
    }, [token, user?.id, API_BASE_URL]);

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshSellerData();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [refreshSellerData]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                if (!token || !user?.id) return;
                
                // Only reset loading state on very first load in this session
                if (!hasLoadedInSession.current) {
                    setIsDataLoaded(false);
                }
                
                // Fetch shop name from seller profile
                let shopName = user.firstName || 'My';
                try {
                    const sellerRes = await fetch(`${API_BASE_URL}/api/seller/me`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    });
                    if (sellerRes.ok) {
                        const sellerData = await sellerRes.json();
                        shopName = sellerData.shopName || user.firstName || 'My';
                        setShopName(shopName);
                    }
                } catch {
                    setShopName(shopName);
                }
                
                // Fetch products
                const res = await fetch(`${API_BASE_URL}/api/products`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });
                const all = await res.json().catch(() => []);
                if (!Array.isArray(all)) return;
                const mine = all.filter((p: any) => (p.owner?._id || p.owner) === user.id);
                setSellerProducts(mine);
                // Initialize empty orders array - will be populated when actual orders API is implemented
                setDerivedOrders([]);
                // Mark data as loaded and initial load as complete
                setIsDataLoaded(true);
                setIsInitialLoad(false);
                setHasEverLoaded(true);
                hasLoadedInSession.current = true;
            } catch {
                // no-op
            }
        };
        load();
        return () => controller.abort();
    }, [API_BASE_URL, token, user?.id]);

    // Auto-refresh data when switching to orders tab
    useEffect(() => {
        if (sellerActiveTab === 'Orders' && token && user?.id) {
            const refreshData = async () => {
                try {
                    // Refresh products (which affects order calculations)
                    const res = await fetch(`${API_BASE_URL}/api/products`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const all = await res.json().catch(() => []);
                    if (Array.isArray(all)) {
                        const mine = all.filter((p: any) => (p.owner?._id || p.owner) === user.id);
                        setSellerProducts(mine);
                        // Keep orders empty until actual orders API is implemented
                        setDerivedOrders([]);
                        // Don't reset isDataLoaded - just update the data silently
                    }
                } catch (e) {
                    console.error('Failed to refresh orders data:', e);
                }
            };
            refreshData();
        }
    }, [sellerActiveTab, token, user?.id, API_BASE_URL]);

    const [derivedOrders, setDerivedOrders] = useState<any[]>([]);


    // Sorting, filtering, and pagination functions
    const getFilteredAndSortedProducts = () => {
        let filtered = [...sellerProducts];
        
        // Apply filter
        if (filterBy === 'available') {
            filtered = filtered.filter(p => p.quantity > 0);
        } else if (filterBy === 'out_of_stock') {
            filtered = filtered.filter(p => p.quantity <= 0);
        }
        
        // Apply sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'price':
                    return (a.price || 0) - (b.price || 0);
                case 'quantity':
                    return (a.quantity || 0) - (b.quantity || 0);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
        
        return filtered;
    };

    const getPaginatedProducts = () => {
        const filtered = getFilteredAndSortedProducts();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            products: filtered.slice(startIndex, endIndex),
            totalPages: Math.ceil(filtered.length / itemsPerPage),
            totalItems: filtered.length
        };
    };

    // Modal handlers
    const handleViewDetails = (product: any) => {
        setSelectedProduct(product);
        setIsProductDetailsModalOpen(true);
    };

    const handleDeleteClick = (productId: string) => {
        setProductToDelete(productId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        
        try {
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/products/${productToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (!res.ok) throw new Error('Failed to delete product');
            
            // Remove from local state
            setSellerProducts(prev => prev.filter(p => (p._id || p.id) !== productToDelete));
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (e) {
            console.error('Error deleting product:', e);
            alert('Failed to delete product');
        }
    };

    // Add Product Modal handlers
    const handleAddProductFormChange = (field: keyof typeof addProductForm, value: any) => {
        setAddProductForm(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Check for changes when editing
        if (isEditing && editingProduct) {
            const hasChanges = checkForChanges({ ...addProductForm, [field]: value }, editingProduct);
            setHasProductChanges(hasChanges);
        }
    };

    const checkForChanges = (formData: typeof addProductForm, originalProduct: any) => {
        const images = formData.images.filter(Boolean);
        return (
            formData.productName !== (originalProduct.title || '') ||
            formData.category !== (originalProduct.category || '') ||
            formData.condition !== (originalProduct.condition || '') ||
            formData.material !== (originalProduct.material || '') ||
            formData.age !== (originalProduct.age ? `${originalProduct.age.value} ${originalProduct.age.unit}` : '') ||
            formData.description !== (originalProduct.description || '') ||
            formData.location !== (originalProduct.location || '') ||
            formData.modeOfTransaction !== (originalProduct.listedAs === 'swap' ? 'For Swap' : originalProduct.listedAs === 'both' ? 'Both' : 'For Sale') ||
            formData.price !== (originalProduct.price ? originalProduct.price.toString() : '') ||
            formData.quantity !== (originalProduct.quantity || 1) ||
            formData.modeOfDelivery !== (originalProduct.courier || '') ||
            JSON.stringify(formData.modeOfPayment) !== JSON.stringify(originalProduct.mode_of_payment ? [originalProduct.mode_of_payment] : []) ||
            formData.swapWantedCategory !== (originalProduct.swapWantedCategory || '') ||
            formData.swapWantedDescription !== (originalProduct.swapWantedDescription || '') ||
            images.length > 0 // Check if new images were uploaded
        );
    };

    const handleAddProductCheckboxChange = (field: 'modeOfPayment', value: string, checked: boolean) => {
        setAddProductForm(prev => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const handleAddProductRadioChange = (field: 'modeOfDelivery', value: string) => {
        setAddProductForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = (index: number, file: File | null) => {
        const newImages = [...addProductForm.images];
        newImages[index] = file;
        handleAddProductFormChange('images', newImages);
    };

    const handleSubmitProduct = async () => {
        try {
            if (!token) return;
            setIsLoading(true);
            
            // Client-side guard to prevent empty submissions
            const requiredFilled = (addProductForm.productName && addProductForm.category && addProductForm.condition && addProductForm.material && addProductForm.age && addProductForm.description && addProductForm.location);
            const images = addProductForm.images.filter(Boolean);
            const hasDelivery = (addProductForm.modeOfDelivery || '').trim().length > 0;
            const hasPayment = (addProductForm.modeOfPayment || []).length > 0;
            const isSwap = addProductForm.modeOfTransaction === 'For Swap';
            const isBoth = addProductForm.modeOfTransaction === 'Both';
            const priceValid = isSwap || (!!addProductForm.price && !isNaN(Number(addProductForm.price)) && Number(addProductForm.price) > 0);
            
            // Swap-specific validation
            const swapWantedCategoryFilled = (addProductForm.swapWantedCategory || '').trim().length > 0;
            const swapWantedDescriptionFilled = (addProductForm.swapWantedDescription || '').trim().length > 0;
            
            // Conditional validation based on transaction type
            let validationPassed = requiredFilled && priceValid;
            
            if (isSwap) {
                // For swap: only need swap wanted details, no delivery/payment required
                validationPassed = validationPassed && swapWantedCategoryFilled && swapWantedDescriptionFilled;
            } else if (isBoth) {
                // For both: need delivery, payment, AND swap wanted details
                validationPassed = validationPassed && hasDelivery && hasPayment && swapWantedCategoryFilled && swapWantedDescriptionFilled;
            } else {
                // For sale: need delivery and payment, no swap details
                validationPassed = validationPassed && hasDelivery && hasPayment;
            }
            
            // Debug logging
            console.log('Form validation debug:', {
                requiredFilled,
                hasDelivery,
                hasPayment,
                priceValid,
                isSwap,
                isBoth,
                swapWantedCategoryFilled,
                swapWantedDescriptionFilled,
                validationPassed,
                modeOfTransaction: addProductForm.modeOfTransaction,
                modeOfDelivery: addProductForm.modeOfDelivery,
                modeOfPayment: addProductForm.modeOfPayment,
                swapWantedCategory: addProductForm.swapWantedCategory,
                swapWantedDescription: addProductForm.swapWantedDescription,
                price: addProductForm.price
            });
            
            if (!validationPassed) {
                console.warn('Form invalid. Preventing submission.', {
                    requiredFilled,
                    hasDelivery,
                    hasPayment,
                    priceValid,
                    isSwap,
                    isBoth,
                    swapWantedCategoryFilled,
                    swapWantedDescriptionFilled,
                    validationPassed
                });
                setIsLoading(false);
                return;
            }
            
            if (!isEditing && images.length < 2) {
                console.warn('At least 2 images required for new products');
                setIsLoading(false);
                return;
            }

            if (isEditing && editingProduct) {
                // Check if any changes were made
                const hasChanges = 
                    addProductForm.productName !== (editingProduct.title || '') ||
                    addProductForm.category !== (editingProduct.category || '') ||
                    addProductForm.condition !== (editingProduct.condition || '') ||
                    addProductForm.material !== (editingProduct.material || '') ||
                    addProductForm.age !== (editingProduct.age ? `${editingProduct.age.value} ${editingProduct.age.unit}` : '') ||
                    addProductForm.description !== (editingProduct.description || '') ||
                    addProductForm.location !== (editingProduct.location || '') ||
                    addProductForm.modeOfTransaction !== (editingProduct.listedAs === 'swap' ? 'For Swap' : editingProduct.listedAs === 'both' ? 'Both' : 'For Sale') ||
                    addProductForm.price !== (editingProduct.price ? editingProduct.price.toString() : '') ||
                    addProductForm.quantity !== (editingProduct.quantity || 1) ||
                    addProductForm.modeOfDelivery !== (editingProduct.courier || '') ||
                    JSON.stringify(addProductForm.modeOfPayment) !== JSON.stringify(editingProduct.mode_of_payment ? [editingProduct.mode_of_payment] : []) ||
                    addProductForm.swapWantedCategory !== (editingProduct.swapWantedCategory || '') ||
                    addProductForm.swapWantedDescription !== (editingProduct.swapWantedDescription || '') ||
                    images.length > 0; // Check if new images were uploaded

                if (!hasChanges) {
                    console.log('No changes detected, skipping update');
                    setIsLoading(false);
                    setIsAddProductModalOpen(false);
                    setIsEditing(false);
                    setEditingProduct(null);
                    return;
                }

                // Handle image uploads for editing
                let uploadedImages: string[] = [];
                
                // If new images were uploaded, upload them
                if (images.length > 0) {
                    console.log('Uploading new images for product update:', images.length);
                    
                    // Validate images before upload
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    
                    for (const imageFile of images) {
                        if (imageFile) {
                            if (!allowedTypes.includes(imageFile.type)) {
                                throw new Error(`Invalid file type: ${imageFile.name}. Only JPEG, PNG, and WebP images are allowed.`);
                            }
                            if (imageFile.size > maxSize) {
                                throw new Error(`File too large: ${imageFile.name}. Maximum size is 5MB.`);
                            }
                            
                            // Upload image
                            const imageFormData = new FormData();
                            imageFormData.append('image', imageFile);
                            
                            try {
                                const uploadRes = await fetch(`${API_BASE_URL}/api/products/upload-image`, {
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${token}` },
                                    body: imageFormData,
                                });
                                
                                if (uploadRes.ok) {
                                    const uploadData = await uploadRes.json();
                                    uploadedImages.push(uploadData.secure_url);
                                    console.log('Image uploaded successfully:', uploadData.secure_url);
                                } else {
                                    throw new Error(`Failed to upload image: ${imageFile.name}`);
                                }
                            } catch (uploadError) {
                                console.error('Error uploading image:', uploadError);
                                throw new Error(`Failed to upload image: ${imageFile.name}`);
                            }
                        }
                    }
                }

                // Update existing product
                const updateData = {
                    title: addProductForm.productName,
                    description: addProductForm.description,
                    price: addProductForm.modeOfTransaction === 'For Swap' ? null : Number(addProductForm.price),
                    quantity: Number(addProductForm.quantity),
                    condition: addProductForm.condition,
                    category: addProductForm.category,
                    location: addProductForm.location || '',
                    material: (() => {
                        const materialLower = (addProductForm.material || '').toLowerCase();
                        return materialLower.includes('wood') ? 'wood' : materialLower.includes('steel') ? 'steel' : 'plastic';
                    })(),
                    ageValue: (() => {
                        const [ageRawValue='0'] = (addProductForm.age || '').split(/\s+/);
                        return Number(ageRawValue.replace(/[^0-9]/g, '') || '0');
                    })(),
                    ageUnit: (() => {
                        const [, ageRawUnit='months'] = (addProductForm.age || '').split(/\s+/);
                        const unitLower = ageRawUnit.toLowerCase();
                        return unitLower.startsWith('year') ? 'years' : unitLower.startsWith('month') ? 'months' : 'days';
                    })(),
                    listedAs: addProductForm.modeOfTransaction === 'For Swap' ? 'swap' : (addProductForm.modeOfTransaction === 'Both' ? 'both' : 'sale'),
                    mode_of_payment: (() => {
                        const payLower = (addProductForm.modeOfPayment[0] || 'cash').toLowerCase();
                        return payLower.includes('gcash') || payLower.includes('maya') ? 'gcash/maya' : payLower.includes('bank') ? 'bank' : 'cash';
                    })(),
                    courier: (() => {
                        const courierRaw = addProductForm.modeOfDelivery || 'J&T Express';
                        return /lalamove/i.test(courierRaw) ? 'Lalamove' : /lbc/i.test(courierRaw) ? 'LBC Express' : 'J&T Express';
                    })(),
                    status: 'for_approval', // Revert to for_approval when editing
                    swapWantedCategory: addProductForm.swapWantedCategory || '',
                    swapWantedDescription: addProductForm.swapWantedDescription || '',
                    // Include new images if any were uploaded
                    ...(uploadedImages.length > 0 && { images: uploadedImages }),
                };

                const res = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id || editingProduct.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateData),
                });

                const data = await res.json().catch(()=>({}));
                if (!res.ok) throw new Error(data?.error || 'Failed to update product');
                
                console.log('Update response:', data);
                console.log('Product status from response:', data.product?.status);
                console.log('Requires reapproval:', data.requiresReapproval);
                console.log('Response keys:', Object.keys(data));
                
                // Update the product in the local state
                setSellerProducts(prev => prev.map(p => 
                    (p._id || p.id) === (editingProduct._id || editingProduct.id) 
                        ? { 
                            ...p, 
                            ...updateData, 
                            // Update images if new ones were uploaded
                            ...(uploadedImages.length > 0 && { images: uploadedImages }),
                            status: data.product?.status || 'for_approval',
                            updatedAt: new Date().toISOString()
                          }
                        : p
                ));

                // Show notification if re-approval is required
                if (data.requiresReapproval) {
                    setResultModalData({
                        type: 'success',
                        message: 'Product updated successfully! It has been sent back for re-approval and will appear in your pending products.'
                    });
                    setShowResultModal(true);
                }
                
                // Force refresh products to ensure status is updated
                await refreshSellerData();
                
        setIsAddProductModalOpen(false);
                setIsEditing(false);
                setEditingProduct(null);
            } else {
                // Create new product - upload multiple images
                const uploadedImages: string[] = [];
                
                // Validate images before upload
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                const maxSize = 5 * 1024 * 1024; // 5MB
                
                for (const imageFile of images) {
                    if (imageFile) {
                        if (!allowedTypes.includes(imageFile.type)) {
                            throw new Error(`Invalid file type: ${imageFile.name}. Only JPEG, PNG, and WebP images are allowed.`);
                        }
                        if (imageFile.size > maxSize) {
                            throw new Error(`File too large: ${imageFile.name}. Maximum size is 5MB.`);
                        }
                    }
                }
                
                // Upload each image to Cloudinary
                for (const imageFile of images) {
                    if (imageFile) {
                        const imageFormData = new FormData();
                        imageFormData.append('image', imageFile);
                        
                        try {
                            const uploadRes = await fetch(`${API_BASE_URL}/api/products/upload-image`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${token}` },
                                body: imageFormData,
                            });
                            
                            if (uploadRes.ok) {
                                const uploadData = await uploadRes.json();
                                uploadedImages.push(uploadData.secure_url);
                                console.log('Image uploaded successfully:', uploadData.secure_url);
                            } else {
                                const errorData = await uploadRes.json().catch(() => ({}));
                                console.error('Image upload failed:', uploadRes.status, errorData);
                                throw new Error(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
                            }
                        } catch (error) {
                            console.error('Error uploading image:', error);
                            throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    }
                }
                
                if (uploadedImages.length === 0) {
                    throw new Error('No images were uploaded successfully. Please check your image files and try again.');
                }

                // Create product with all uploaded images
                const productData = {
                    title: addProductForm.productName,
                    description: addProductForm.description,
                    price: addProductForm.modeOfTransaction === 'For Swap' ? null : Number(addProductForm.price),
                    quantity: Number(addProductForm.quantity),
                    condition: addProductForm.condition,
                    category: addProductForm.category,
                    location: addProductForm.location || '',
                    status: 'for_approval',
                    material: (() => {
                        const materialLower = (addProductForm.material || '').toLowerCase();
                        return materialLower.includes('wood') ? 'wood' : materialLower.includes('steel') ? 'steel' : 'plastic';
                    })(),
                    ageValue: (() => {
                        const [ageRawValue='0'] = (addProductForm.age || '').split(/\s+/);
                        return Number(ageRawValue.replace(/[^0-9]/g, '') || '0');
                    })(),
                    ageUnit: (() => {
                        const [, ageRawUnit='months'] = (addProductForm.age || '').split(/\s+/);
                        const unitLower = ageRawUnit.toLowerCase();
                        return unitLower.startsWith('year') ? 'years' : unitLower.startsWith('month') ? 'months' : 'days';
                    })(),
                    listedAs: addProductForm.modeOfTransaction === 'For Swap' ? 'swap' : (addProductForm.modeOfTransaction === 'Both' ? 'both' : 'sale'),
                    mode_of_payment: (() => {
                        const payLower = (addProductForm.modeOfPayment[0] || 'cash').toLowerCase();
                        return payLower.includes('gcash') || payLower.includes('maya') ? 'gcash/maya' : payLower.includes('bank') ? 'bank' : 'cash';
                    })(),
                    courier: (() => {
                        const courierRaw = addProductForm.modeOfDelivery || 'J&T Express';
                        return /lalamove/i.test(courierRaw) ? 'Lalamove' : /lbc/i.test(courierRaw) ? 'LBC Express' : 'J&T Express';
                    })(),
                    images: uploadedImages,
                    swapWantedCategory: addProductForm.swapWantedCategory || '',
                    swapWantedDescription: addProductForm.swapWantedDescription || '',
                };

                const res = await fetch(`${API_BASE_URL}/api/products/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(productData),
                });
                
                const data = await res.json().catch(()=>({}));
                if (!res.ok) throw new Error(data?.error || 'Failed to create product');
                
                // refresh products
                setSellerProducts(prev => [data.product, ...prev]);
                setIsAddProductModalOpen(false);
                
                // Show success modal
                setResultModalData({
                    type: 'success',
                    message: isEditing ? 'Product updated successfully!' : 'Product uploaded successfully!'
                });
                setShowResultModal(true);
            }

            // reset form
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
                quantity: 1,
            modeOfDelivery: '',
                modeOfPayment: [] as string[],
                location: '',
                swapWantedCategory: '',
                swapWantedDescription: '',
            });
        } catch (e) {
            console.error('Error submitting product:', e);
            setIsAddProductModalOpen(false);
            
            // Show error modal
            setResultModalData({
                type: 'error',
                message: 'Failed to submit product. Please try again.'
            });
            setShowResultModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Seller registration handlers removed


    const handleWishlistClick = () => {
        // Add wishlist functionality here
        console.log('Wishlist clicked');
    };

    const handleCartClick = () => {
        // Add cart functionality here
        console.log('Cart clicked');
    };

    const renderSellerNavbar = () => (
        <div>
            <nav className="flex space-x-8 border-b border-gray-200">
                    {[
                        { name: 'Dashboard', icon: TrendingUp },
                        { name: 'Products', icon: Package },
                        { name: 'Orders', icon: ClipboardList },
                        { name: 'Track Orders', icon: BarChart3 }
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
    );

    // Memoize dashboard stats calculation to prevent re-calculation on every render
    const dashboardStats = useMemo(() => {
        // Calculate real-time metrics from seller's products
        const totalSales = sellerProducts
            .filter((p: any) => p.listedAs === 'sale' && typeof p.price === 'number')
            .reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.quantity || 1)), 0);
        
        // Product status breakdown
        const approvedProducts = sellerProducts.filter(p => p.status === 'listed').length;
        const pendingProducts = sellerProducts.filter(p => p.status === 'for_approval').length;
        const rejectedProducts = sellerProducts.filter(p => p.status === 'rejected').length;
        const soldProducts = sellerProducts.filter(p => p.status === 'sold').length;
        const totalProducts = sellerProducts.length;
        
        // Sales metrics
        const totalSoldValue = sellerProducts
            .filter((p: any) => p.status === 'sold' && typeof p.price === 'number')
            .reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.quantity || 1)), 0);
        
        // Category breakdown
        const categoryCounts = sellerProducts.reduce((acc: any, product: any) => {
            const category = product.category || 'Other';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        
        const topCategory = Object.entries(categoryCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];
        
        // Recent activity (products added in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentProducts = sellerProducts.filter(p => {
            const productDate = new Date(p.createdAt || p.updatedAt);
            return productDate >= sevenDaysAgo;
        }).length;
        
        // Average product price
        const productsWithPrice = sellerProducts.filter(p => typeof p.price === 'number' && p.price > 0);
        const averagePrice = productsWithPrice.length > 0 
            ? productsWithPrice.reduce((sum, p) => sum + p.price, 0) / productsWithPrice.length 
            : 0;

        return {
            totalSales,
            approvedProducts,
            pendingProducts,
            rejectedProducts,
            soldProducts,
            totalProducts,
            totalSoldValue,
            categoryCounts,
            topCategory,
            recentProducts,
            averagePrice
        };
    }, [sellerProducts]);

    const renderDashboardStats = () => {
        // Don't render if data is still loading
        if (!isDataLoaded) {
            return null;
        }

        const {
            totalSales,
            approvedProducts,
            pendingProducts,
            rejectedProducts,
            soldProducts,
            totalProducts,
            totalSoldValue,
            categoryCounts,
            topCategory,
            recentProducts,
            averagePrice
        } = dashboardStats;
        
        // Generate sample data for charts (in real app, this would come from API)
        const salesData = [
            { month: 'Jan', sales: 0, products: 0 },
            { month: 'Feb', sales: 0, products: 0 },
            { month: 'Mar', sales: 0, products: 0 },
            { month: 'Apr', sales: 0, products: 0 },
            { month: 'May', sales: 0, products: 0 },
            { month: 'Jun', sales: 0, products: 0 },
            { month: 'Jul', sales: 0, products: 0 },
            { month: 'Aug', sales: 0, products: 0 },
            { month: 'Sep', sales: 0, products: 0 },
            { month: 'Oct', sales: 0, products: 0 },
            { month: 'Nov', sales: 0, products: 0 },
            { month: 'Dec', sales: 0, products: 0 },
        ];

        // Update current month with actual data
        const currentMonth = new Date().getMonth();
        salesData[currentMonth].sales = totalSoldValue;
        salesData[currentMonth].products = totalProducts;

        // Category data for pie chart
        const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value as number / totalProducts) * 100)
        }));

        const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

        // Status data for donut chart
        const statusData = [
            { name: 'Approved', value: approvedProducts, color: '#10B981' },
            { name: 'Pending', value: pendingProducts, color: '#F59E0B' },
            { name: 'Rejected', value: rejectedProducts, color: '#EF4444' },
            { name: 'Sold', value: soldProducts, color: '#3B82F6' },
        ];
        
        return (
        <div className="space-y-8">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between">
            <div>
                            <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-900 transition-all duration-300">₱{totalSoldValue.toLocaleString()}</p>
                            <p className="text-green-600 text-xs mt-1">From {soldProducts} sales</p>
                            </div>
                        <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between">
                            <div>
                            <p className="text-blue-600 text-sm font-medium">Inventory Value</p>
                            <p className="text-3xl font-bold text-blue-900 transition-all duration-300">₱{totalSales.toLocaleString()}</p>
                            <p className="text-blue-600 text-xs mt-1">{totalProducts} products</p>
                            </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                            </div>
                    
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between">
                            <div>
                            <p className="text-purple-600 text-sm font-medium">Avg. Price</p>
                            <p className="text-3xl font-bold text-purple-900 transition-all duration-300">₱{averagePrice.toLocaleString()}</p>
                            <p className="text-purple-600 text-xs mt-1">Per product</p>
                            </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                            </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between">
                            <div>
                            <p className="text-orange-600 text-sm font-medium">Conversion Rate</p>
                            <p className="text-3xl font-bold text-orange-900 transition-all duration-300">
                                {totalProducts > 0 ? Math.round((soldProducts / totalProducts) * 100) : 0}%
                            </p>
                            <p className="text-orange-600 text-xs mt-1">Sales success</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>
                
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Trend Chart */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
                        <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Monthly</span>
                            </div>
                            </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="#10B981" 
                                    fill="#10B981" 
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                    
                {/* Product Status Distribution */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Product Status</h3>
                        <div className="flex items-center space-x-2">
                            <PieChart className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Distribution</span>
                            </div>
                            </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }} 
                                />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Category Performance & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Performance */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
                        <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Top Categories</span>
                    </div>
                    </div>
                    <div className="space-y-4">
                        {categoryData.slice(0, 5).map((category, index) => (
                            <div key={category.name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full transition-all duration-300" 
                                            style={{ 
                                                width: `${category.percentage}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        ></div>
                    </div>
                                    <span className="text-sm text-gray-600 w-8 text-right">{category.value as number}</span>
                                    <span className="text-sm text-gray-500 w-10 text-right">({category.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                        <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Overview</span>
                            </div>
                        </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                    </div>
            <div>
                                    <p className="text-sm font-medium text-green-800">Live Products</p>
                                    <p className="text-2xl font-bold text-green-900">{approvedProducts}</p>
                            </div>
                        </div>
                    </div>
                    
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                        </div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
                                    <p className="text-2xl font-bold text-yellow-900">{pendingProducts}</p>
                    </div>
                </div>
            </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                                </div>
                <div>
                                    <p className="text-sm font-medium text-blue-800">Sold This Month</p>
                                    <p className="text-2xl font-bold text-blue-900">{soldProducts}</p>
                                        </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                                        <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-purple-600" />
                                            </div>
                                <div>
                                    <p className="text-sm font-medium text-purple-800">Added This Week</p>
                                    <p className="text-2xl font-bold text-purple-900">{recentProducts}</p>
                                        </div>
                                    </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const handleEditProduct = (product: any) => {
        // Set editing state
        setEditingProduct(product);
        setIsEditing(true);
        setHasProductChanges(false); // Reset changes state
        
        // Set form data to product values for editing
        setAddProductForm({
            productName: product.title || '',
            category: product.category || '',
            condition: product.condition || '',
            material: product.material || '',
            age: product.age ? `${product.age.value} ${product.age.unit}` : '',
            description: product.description || '',
            images: [null, null, null, null] as (File | null)[], // New images will be handled separately
            modeOfTransaction: product.listedAs === 'swap' ? 'For Swap' : product.listedAs === 'both' ? 'Both' : 'For Sale',
            price: product.price ? product.price.toString() : '',
            quantity: product.quantity || 1,
            modeOfDelivery: product.courier || '',
            modeOfPayment: product.mode_of_payment ? [product.mode_of_payment] : [],
            location: product.location || '',
            swapWantedCategory: product.swapWantedCategory || '',
            swapWantedDescription: product.swapWantedDescription || '',
        });
        
        // Reset image preview when starting to edit
        setSelectedImagePreview(null);
        
        setIsAddProductModalOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (!res.ok) throw new Error('Failed to delete product');
            
            // Remove from local state
            setSellerProducts(prev => prev.filter(p => (p._id || p.id) !== productId));
        } catch (e) {
            console.error('Error deleting product:', e);
            alert('Failed to delete product');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { color: string; text: string } } = {
            'for_approval': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Approval' },
            'listed': { color: 'bg-green-100 text-green-800', text: 'Approved' },
            'for_sale': { color: 'bg-blue-100 text-blue-800', text: 'For Sale' },
            'for_swap': { color: 'bg-purple-100 text-purple-800', text: 'For Swap' },
            'both': { color: 'bg-indigo-100 text-indigo-800', text: 'Both' },
            'sold': { color: 'bg-gray-100 text-gray-800', text: 'Sold' },
        };
        const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                {statusInfo.text}
            </span>
        );
    };

    const renderProductsTable = () => {
        const { products, totalPages, totalItems } = getPaginatedProducts();
        
        return (
        <div className="overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <h3 className="text-lg font-bold text-gray-900">My Products ({totalItems})</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none bg-white pr-8 text-left"
                        >
                            <option value="name">Sort By Name</option>
                            <option value="price">Sort By Price</option>
                            <option value="quantity">Sort By Quantity</option>
                            <option value="category">Sort By Category</option>
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
                        <select 
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none bg-white pr-8 text-left"
                        >
                            <option value="all">All Products</option>
                            <option value="available">Available</option>
                            <option value="out_of_stock">Out of Stock</option>
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
                        className="flex items-center px-4 py-2 bg-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
                        <p className="text-gray-500 mb-6">Start building your inventory by adding your first product.</p>
                        <button
                            onClick={() => setIsAddProductModalOpen(true)}
                            className="flex items-center px-6 py-3 bg-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Your First Product
                        </button>
                    </div>
                </div>
            ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product, idx) => {
                                const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                                return (
                                <tr key={product._id || product.id || `row-${idx}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{rowNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex flex-col">
                                            <div className="font-medium">{product.title}</div>
                                            <div className="text-xs text-gray-500">ID: {product._id?.slice(-8) || product.id?.slice(-8) || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity || 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.listedAs === 'swap' ? (
                                            <span className="text-purple-600 font-medium">SWAP</span>
                                        ) : product.listedAs === 'both' ? (
                                            <div className="flex flex-col">
                                                <span className="text-green-600">₱ {product.price || 0}</span>
                                                <span className="text-purple-600 text-xs">+ SWAP</span>
                                            </div>
                                        ) : (
                                            <span className="text-green-600">₱ {product.price || 0}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(product.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button 
                                            className="text-blue-600 hover:text-blue-900 cursor-pointer" 
                                            onClick={() => handleViewDetails(product)}
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button 
                                            className="text-green-600 hover:text-green-900 cursor-pointer" 
                                            onClick={() => handleEditProduct(product)}
                                            title="Edit Product"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button 
                                            className="text-red-600 hover:text-red-900 cursor-pointer" 
                                            onClick={() => handleDeleteClick(product._id || product.id)}
                                            title="Delete Product"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                                <span className="font-medium">{totalItems}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            page === currentPage
                                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    };

    const renderOrdersTable = () => {
        const hasOrders = derivedOrders.length > 0;
        
        return (
        <div className="overflow-hidden">
            {/* Orders Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                    {[
                        { label: 'To-Process Shipment', value: hasOrders ? derivedOrders.filter(o=>o.status==='To Ship').length : 0 },
                        { label: 'Processed Shipment', value: hasOrders ? derivedOrders.filter(o=>o.status==='Shipping').length : 0 },
                        { label: 'Completed', value: hasOrders ? derivedOrders.filter(o=>o.status==='Completed').length : 0 },
                        { label: 'Total No. of Orders', value: derivedOrders.length },
                    ].map((m) => (
                        <div key={m.label} className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
                            <div className="text-sm text-gray-600">{m.label}</div>
                    </div>
                    ))}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {hasOrders ? (
                                derivedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₱{order.total?.toLocaleString()}</td>
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
                                        <button className="text-green-600 hover:text-green-900" title="Update Status">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center space-y-4">
                                            <Package className="h-12 w-12 text-gray-400" />
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">No Orders Yet</h3>
                                                <p className="text-gray-500 mt-1">
                                                    Orders will appear here when customers purchase your products.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
    };

    return (
        <>

         {/* Sidebar */}
            {!embedded && (
            <UserProfileSidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            )}
        {/* NAVBAR */}
            {!embedded && (
            <NavbarMenu 
                onWishlistClick={handleWishlistClick}
                onCartClick={handleCartClick}
            />
            )}

            {/* Mobile hamburger to toggle profile sidebar */}
            {!embedded && (<button
                aria-label="Open profile menu"
                className="md:hidden fixed top-16 left-4 z-40 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm active:scale-95"
                onClick={() => setIsMobileMenuOpen(true)}
            >
                <Menu className="w-5 h-5 text-gray-700" />
            </button>)}

            <div className={`min-h-screen bg-gray-50 ${embedded ? '' : ''}`}>
                <div className={`${embedded ? 'p-0' : 'ml-0 md:ml-[300px]'}`}>    
                    {/* Sticky Header */}
                    <div className="sticky top-16 z-40 bg-white">
                        <div className="px-4 sm:px-6 lg:px-8 py-4">
                            <div className="w-full max-w-[1200px] mx-auto">
                                <div className="flex items-center justify-between mb-4">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{shopName}'s Dashboard</h1>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-sm text-gray-500">
                                            Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Loading...'}
                                            </div>
                                            <button
                                                onClick={refreshSellerData}
                                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                            >
                                                Refresh Data
                                            </button>
                                        </div>
                                    </div>
                                    {renderSellerNavbar()}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-4 sm:p-6 lg:p-8 pt-20">
                        <div className="w-full max-w-[1200px] mx-auto">

                                    {sellerActiveTab === 'Dashboard' && (
                                        <div>
                                            {!isDataLoaded && !hasLoadedInSession.current ? (
                                                <div className="space-y-8">
                                                    <DashboardStatsSkeleton />
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                        <ChartSkeleton />
                                                        <ChartSkeleton />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                            {renderDashboardStats()}
                                            <div className="text-center py-8">
                                                <p className="text-gray-600">Additional dashboard content coming soon...</p>
                                            </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {sellerActiveTab === 'Products' && (
                                        !isDataLoaded && !hasLoadedInSession.current ? (
                                            <ProductsTableSkeleton />
                                        ) : (
                                            renderProductsTable()
                                        )
                                    )}
                                    {sellerActiveTab === 'Orders' && (
                                        !isDataLoaded && !hasLoadedInSession.current ? (
                                            <ProductsTableSkeleton />
                                        ) : (
                                            renderOrdersTable()
                                        )
                                    )}
                                    {sellerActiveTab === 'Track Orders' && (
                                        <SellerTrackOrders />
                                    )}
                                
                        </div>
                    </div>
            {!embedded && <Footer />}
                </div>
            </div>

            {/* Add Product Modal */}
            <AddProductModal
                key={isAddProductModalOpen ? 'open' : 'closed'}
                isOpen={isAddProductModalOpen}
                onClose={() => {
                    setIsAddProductModalOpen(false);
                    setIsEditing(false);
                    setEditingProduct(null);
                    setHasProductChanges(false);
                }}
                formData={addProductForm}
                onFormChange={handleAddProductFormChange}
                onCheckboxChange={handleAddProductCheckboxChange}
                onRadioChange={handleAddProductRadioChange}
                onImageUpload={handleImageUpload}
                onSubmit={handleSubmitProduct}
                isEditing={isEditing}
                isLoading={isLoading}
                existingImages={editingProduct?.images || []}
                hasChanges={hasProductChanges}
                onSuccess={() => {
                    // Refresh products after successful submission
                    const refreshProducts = async () => {
                        try {
                            const res = await fetch(`${API_BASE_URL}/api/products`, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            const all = await res.json().catch(() => []);
                            if (Array.isArray(all)) {
                                const mine = all.filter((p: any) => (p.owner?._id || p.owner) === user?.id);
                                setSellerProducts(mine);
                            }
                        } catch (e) {
                            console.error('Failed to refresh products:', e);
                        }
                    };
                    refreshProducts();
                }}
            />

            {/* Product Details Modal */}
            {isProductDetailsModalOpen && selectedProduct && (
                <div key={`details-${selectedProduct._id || selectedProduct.id}`} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-blue-50 px-8 py-6 flex justify-between items-center border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Package className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                                    <p className="text-sm text-gray-500">Complete product information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsProductDetailsModalOpen(false)}
                                className="p-3 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                            >
                                <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Product Images Section */}
                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                        Product Images
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedProduct.images.map((image: string, idx: number) => (
                                            <div key={idx} className="group relative overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                                 onClick={() => setSelectedImagePreview(image)}>
                                                <img
                                                    src={image}
                                                    alt={`Product ${idx + 1}`}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Eye className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="px-8 py-6">
                                {/* Basic Information */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Product Name</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1">{selectedProduct.title}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Category</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1">{selectedProduct.category}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Condition</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1">{selectedProduct.condition}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Material</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1 capitalize">{selectedProduct.material}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Age</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1">
                                                {selectedProduct.age ? `${selectedProduct.age.value} ${selectedProduct.age.unit}` : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Quantity</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1">{selectedProduct.quantity || 1}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1">{selectedProduct.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & Transaction */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                        {selectedProduct.listedAs === 'swap' ? 'Swap Details' : 'Pricing & Transaction'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                            <label className="text-sm font-semibold text-green-700 uppercase tracking-wide">Mode of Transaction</label>
                                            <div className="mt-2">
                                                {selectedProduct.listedAs === 'swap' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                        For Swap
                                                    </span>
                                                ) : selectedProduct.listedAs === 'both' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                                        Both Sale & Swap
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                        For Sale
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {selectedProduct.listedAs !== 'swap' && (
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                                <label className="text-sm font-semibold text-green-700 uppercase tracking-wide">Price</label>
                                                <p className="text-2xl font-bold text-green-800 mt-1">₱ {selectedProduct.price || 0}</p>
                                            </div>
                                        )}
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                            <label className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Status</label>
                                            <div className="mt-2">
                                                {getStatusBadge(selectedProduct.status)}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                                {selectedProduct.listedAs === 'swap' ? 'Preferred Delivery Method' : 'Delivery Options'}
                                            </label>
                                            <p className="text-lg font-medium text-gray-900 mt-1">{selectedProduct.courier || 'N/A'}</p>
                                        </div>
                                        {selectedProduct.listedAs !== 'swap' && (
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Payment Options</label>
                                            <p className="text-lg font-medium text-gray-900 mt-1 capitalize">{selectedProduct.mode_of_payment || 'N/A'}</p>
                                        </div>
                                        )}
                                    </div>
                                </div>

                                {/* Swap Details - Only show for swap or both products */}
                                {(selectedProduct.listedAs === 'swap' || selectedProduct.listedAs === 'both') && (
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            Swap Preferences
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                                <label className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Wanted Category</label>
                                                <p className="text-lg font-medium text-purple-800 mt-1">{selectedProduct.swapWantedCategory || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                                <label className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Swap Description</label>
                                                <p className="text-lg font-medium text-purple-800 mt-1">{selectedProduct.swapWantedDescription || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                                        Description
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <p className="text-gray-900 leading-relaxed text-lg">{selectedProduct.description}</p>
                                    </div>
                                </div>

                                {/* Product ID */}
                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Product ID</label>
                                            <p className="text-lg font-mono text-gray-700 mt-1">
                                                {selectedProduct._id?.slice(-12) || selectedProduct.id?.slice(-12) || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Created</label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setIsProductDetailsModalOpen(false)}
                                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div key={`delete-${productToDelete}`} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete this product? This action cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setProductToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImagePreview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                     onClick={() => setSelectedImagePreview(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={selectedImagePreview}
                            alt="Product preview"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setSelectedImagePreview(null)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showResultModal && resultModalData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                        <div className="mb-6">
                            {resultModalData.type === 'success' ? (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-2 ${
                            resultModalData.type === 'success' ? 'text-green-900' : 'text-red-900'
                        }`}>
                            {resultModalData.type === 'success' ? 'Success!' : 'Error!'}
                        </h3>
                        
                        <p className={`text-gray-700 mb-6 ${
                            resultModalData.type === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}>
                            {resultModalData.message}
                        </p>
                        
                        {resultModalData.type === 'success' && (
                            <p className="text-sm text-gray-600 mb-6">
                                Your product has been submitted for approval. Please wait for admin review.
                            </p>
                        )}
                        
                        <button
                            onClick={() => setShowResultModal(false)}
                            className={`w-full px-6 py-3 rounded-xl font-medium transition-colors ${
                                resultModalData.type === 'success' 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            {resultModalData.type === 'success' ? 'Got it!' : 'Try Again'}
                        </button>
                    </div>
                </div>
            )}

            {/* Seller Registration Modal removed for embedded seller dashboard */}


        </>

    );
};

export default SellerDashboardPage;