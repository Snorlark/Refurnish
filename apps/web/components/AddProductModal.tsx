import React, { useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';

interface AddProductFormData {
  productName: string;
  category: string;
  condition: string;
  material: string;
  age: string;
  description: string;
  images: (File | null)[];
  modeOfTransaction: string;
  price: string;
  quantity: number;
  modeOfDelivery: string;
  modeOfPayment: string[];
  location?: string;
  swapWantedCategory?: string;
  swapWantedDescription?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: AddProductFormData;
  onFormChange: (field: keyof AddProductFormData, value: any) => void;
  onCheckboxChange: (field: 'modeOfPayment', value: string, checked: boolean) => void;
  onRadioChange: (field: 'modeOfDelivery', value: string) => void;
  onImageUpload: (index: number, file: File | null) => void;
  onSubmit: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  onSuccess?: () => void;
  existingImages?: string[]; // Add existing images for edit mode
  hasChanges?: boolean; // Add hasChanges prop
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onCheckboxChange,
  onRadioChange,
  onImageUpload,
  onSubmit,
  isEditing = false,
  isLoading = false,
  onSuccess,
  existingImages = [],
  hasChanges = true,
}) => {
  if (!isOpen) return null;

  const isSwap = formData.modeOfTransaction === 'For Swap';
  const isBoth = formData.modeOfTransaction === 'Both';
  const hasImage = (formData.images || []).some(Boolean);
  const hasDelivery = (formData.modeOfDelivery || '').trim().length > 0;
  const hasPayment = (formData.modeOfPayment || []).length > 0;
  const swapWantedCategoryFilled = (formData.swapWantedCategory || '').trim().length > 0;
  const swapWantedDescriptionFilled = (formData.swapWantedDescription || '').trim().length > 0;
  const requiredFilled = Boolean(
    (formData.productName || '').trim() &&
    (formData.category || '').trim() &&
    (formData.condition || '').trim() &&
    (formData.material || '').trim() &&
    (formData.age || '').trim() &&
    (formData.description || '').trim() &&
    (formData.location || '').trim()
  );
  const priceValid = isSwap || (!!formData.price && !isNaN(Number(formData.price)) && Number(formData.price) > 0);
  const quantityValid = (formData.quantity || 0) > 0;
  const hasMinimumImages = (formData.images || []).filter(Boolean).length >= 2;
  // Conditional validation based on transaction type
  let canSubmit = requiredFilled && quantityValid && priceValid && (isEditing || (hasImage && hasMinimumImages));
  
  if (isSwap) {
    // For swap: need delivery method and swap wanted details, no payment required
    canSubmit = canSubmit && hasDelivery && swapWantedCategoryFilled && swapWantedDescriptionFilled;
  } else if (isBoth) {
    // For both: need delivery, payment, AND swap wanted details
    canSubmit = canSubmit && hasDelivery && hasPayment && swapWantedCategoryFilled && swapWantedDescriptionFilled;
  } else {
    // For sale: need delivery and payment, no swap details
    canSubmit = canSubmit && hasDelivery && hasPayment;
  }

  // For editing mode, check if there are actual changes
  const canSubmitWithChanges = isEditing ? hasChanges : true;

  // Debug logging for AddProductModal validation
  console.log('AddProductModal validation debug:', {
    requiredFilled,
    quantityValid,
    hasDelivery,
    hasPayment,
    swapWantedCategoryFilled,
    swapWantedDescriptionFilled,
    priceValid,
    hasImage,
    hasMinimumImages,
    isEditing,
    isSwap,
    isBoth,
    canSubmit,
    modeOfDelivery: formData.modeOfDelivery,
    modeOfPayment: formData.modeOfPayment,
    swapWantedCategory: formData.swapWantedCategory,
    swapWantedDescription: formData.swapWantedDescription,
    validationNote: isSwap ? 'Swap-only: delivery + swap required, no payment' : isBoth ? 'Both: delivery/payment + swap required' : 'Sale-only: delivery/payment required'
  });
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Image previews for uploaded files and existing images
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null]);
  useEffect(() => {
    const urls = (formData.images || []).map((f) => (f ? URL.createObjectURL(f) : null));
    
    // For editing mode, show existing images if no new images uploaded
    if (isEditing && existingImages.length > 0) {
      const combinedPreviews = [...urls];
      existingImages.forEach((img, index) => {
        if (index < 4 && !combinedPreviews[index]) {
          combinedPreviews[index] = img;
        }
      });
      setImagePreviews(combinedPreviews);
    } else {
    setImagePreviews(urls);
    }
    
    return () => {
      urls.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [formData.images, isEditing, existingImages]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'} <br />
            {isEditing && !hasChanges && (
              <span className="text-sm text-yellow-600 mt-2 font-light">
                No changes detected. Make changes to enable the update button.
              </span>
            )}
          </h2>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>


        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => onFormChange("productName", e.target.value)}
                  placeholder='e.g. Sofa, Chair, Table, etc.'
                  className={`w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-green focus:border-green bg-gray-50 ${(formData.productName||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                />
                {triedSubmit && !(formData.productName||'').trim() && (<div className="text-xs text-red-600 mt-1">Product name is required.</div>)}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => onFormChange("category", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-green focus:border-green bg-gray-50 ${(formData.category||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                >
                  <option value="">Select category</option>
                  {[
                    'CHAIRS',
                    'TABLES',
                    'SOFA',
                    'CABINET',
                    'DECOR',
                    'MIRROR',
                    'LAMP',
                    'VANITY',
                    'SHELVES',
                  ].map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
                {triedSubmit && !(formData.category||'').trim() && (<div className="text-xs text-red-600 mt-1">Category is required.</div>)}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => onFormChange("condition", e.target.value)}
                  placeholder='e.g. New, Used, Refurbished, etc.'
                  className={`w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-green focus:border-green bg-gray-50 ${(formData.condition||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                />
                {triedSubmit && !(formData.condition||'').trim() && (<div className="text-xs text-red-600 mt-1">Condition is required.</div>)}
              </div>

              {/* Material + Age + Quantity */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => onFormChange("material", e.target.value)}
                    placeholder='e.g. Wood, Metal, Plastic, etc.'   
                    className={`w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-green focus:border-green bg-gray-50 ${(formData.material||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                  />
                  {triedSubmit && !(formData.material||'').trim() && (<div className="text-xs text-red-600 mt-1">Material is required.</div>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => onFormChange("age", e.target.value)}
                    placeholder='e.g. 1 year, 2 years, etc.'  
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green text-gray-800 focus:border-green bg-gray-50 ${(formData.age||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                  />
                  {triedSubmit && !(formData.age||'').trim() && (<div className="text-xs text-red-600 mt-1">Age is required.</div>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity || 1}
                    onChange={(e) => onFormChange("quantity", parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green text-gray-800 focus:border-green bg-gray-50 ${(formData.quantity || 0) > 0 ? 'border-gray-300' : 'border-red-300'}`}
                  />
                  {triedSubmit && !((formData.quantity || 0) > 0) && (<div className="text-xs text-red-600 mt-1">Quantity must be at least 1.</div>)}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => onFormChange("description", e.target.value)}
                  rows={4}
                  placeholder='Describe your product in detail.'
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green text-gray-800 focus:border-green bg-gray-50 ${(formData.description||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                />
                {triedSubmit && !(formData.description||'').trim() && (<div className="text-xs text-red-600 mt-1">Description is required.</div>)}
              </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => onFormChange("location", e.target.value)}
                placeholder='e.g. Quezon City, Makati City, etc.'
                className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green text-gray-800 focus:border-green bg-gray-50 ${(formData.location||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
              />
              {triedSubmit && !(formData.location||'').trim() && (<div className="text-xs text-red-600 mt-1">Location is required.</div>)}
            </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {isEditing ? 'Upload new images to replace existing ones (optional).' : 'Upload different angles of the furniture (at least 2 images).'}
                </p>

                {triedSubmit && !isEditing && !hasMinimumImages && (
                  <div className="text-xs text-red-600 mb-2">At least 2 images are required.</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-xs text-gray-600 font-medium">
                        IMAGE {index + 1} :
                      </div>
                      <div className="relative border border-gray-300 rounded-xl bg-gray-50 h-32 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition overflow-hidden">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              onImageUpload(index, files[0]);
                            }
                          }}
                        />
                        {imagePreviews[index] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imagePreviews[index] as string} alt={`preview-${index}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">
                              1:1 OR 3:4
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode of Transaction + Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode of Transaction <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { label: 'For Sale', value: 'For Sale' },
                      { label: 'For Swap', value: 'For Swap' },
                      { label: 'Both', value: 'Both' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center">
                        <input
                          type="radio"
                          name="modeOfTransaction"
                          value={opt.value}
                          checked={formData.modeOfTransaction === opt.value}
                          onChange={(e) => onFormChange("modeOfTransaction", e.target.value)}
                          className="mr-2 text-green focus:ring-green"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => onFormChange("price", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green text-gray-800 focus:border-green bg-gray-50"
                    placeholder={
                      formData.modeOfTransaction === "For Swap"
                        ? "SWAP"
                        : "₱ 0.00"
                    }
                    disabled={formData.modeOfTransaction === "For Swap"}
                  />
                  {(!isSwap && (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0)) && (
                    <div className="text-xs text-red-600 mt-1">Enter a valid price greater than 0.</div>
                  )}
                </div>
              </div>

              {/* Mode of Delivery - Show for all product types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Delivery Method <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {["J&T Express", "LBC Express", "Lalamove", "GoGo Xpress", "GrabExpress"].map(
                    (option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="modeOfDelivery"
                          value={option}
                          checked={formData.modeOfDelivery === option}
                          onChange={(e) => onRadioChange("modeOfDelivery", e.target.value)}
                          className="mr-2 text-green focus:ring-green"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    )
                  )}
                </div>
                {!hasDelivery && (
                  <div className="text-xs text-red-600 mt-1">Please select a delivery method.</div>
                )}
                {isSwap && (
                  <div className="text-xs text-gray-500 mt-1">
                    This will be shown to potential swappers to know your preferred delivery method.
                  </div>
                )}
              </div>

              {/* Mode of Payment - Only show for sale or both */}
              {(!isSwap || isBoth) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Payment <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {["Gcash/Maya", "Cash on Delivery"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.modeOfPayment.includes(option)}
                        onChange={(e) =>
                          onCheckboxChange(
                            "modeOfPayment",
                            option,
                            e.target.checked
                          )
                        }
                        className="mr-2 text-green focus:ring-green rounded"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {(!isSwap && (formData.modeOfPayment || []).length === 0) && (
                  <div className="text-xs text-red-600 mt-1">Select at least one payment method.</div>
                )}
              </div>
              )}

              {/* Swap wanted details (For Swap or Both) */}
              {(isSwap || isBoth) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What category are you willing to swap with? <span className="text-red-500">*</span></label>
                    <select
                      value={formData.swapWantedCategory || ''}
                      onChange={(e)=> onFormChange('swapWantedCategory', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-green focus:border-green bg-gray-50 ${(formData.swapWantedCategory||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                    >
                      <option value="">Select category</option>
                      {['CHAIRS','TABLES','SOFA','CABINET','DECOR','MIRROR','LAMP','VANITY','SHELVES'].map((label)=>(
                        <option key={label} value={label}>{label}</option>
                      ))}
                    </select>
                    {triedSubmit && !(formData.swapWantedCategory||'').trim() && (<div className="text-xs text-red-600 mt-1">Swap category is required.</div>)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Describe what you want to swap for <span className="text-red-500">*</span></label>
                    <textarea
                      value={formData.swapWantedDescription || ''}
                      onChange={(e)=> onFormChange('swapWantedDescription', e.target.value)}
                      rows={3}
                      placeholder="Describe acceptable swap items, conditions, or preferences."
                      className={`w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-green focus:border-green bg-gray-50 ${(formData.swapWantedDescription||'').trim() ? 'border-gray-300' : 'border-red-300'}`}
                    />
                    {triedSubmit && !(formData.swapWantedDescription||'').trim() && (<div className="text-xs text-red-600 mt-1">Swap description is required.</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => { 
              setTriedSubmit(true); 
              if (canSubmit && !isLoading) {
                onSubmit();
                if (onSuccess) onSuccess();
              } else {
                console.warn('AddProductModal: Form cannot be submitted. Validation failed:', {
                  requiredFilled,
                  quantityValid,
                  hasDelivery,
                  hasPayment,
                  swapWantedCategoryFilled,
                  swapWantedDescriptionFilled,
                  priceValid,
                  hasImage,
                  hasMinimumImages,
                  isEditing,
                  isSwap,
                  isBoth
                });
              }
            }}
            disabled={!canSubmit || !canSubmitWithChanges || isLoading}
            className={`px-6 py-2 rounded-full transition font-medium cursor-pointer flex items-center space-x-2 ${
              canSubmit && canSubmitWithChanges && !isLoading 
                ? 'bg-green text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isEditing ? 'Updating...' : 'Uploading...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Product' : 'Submit'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;