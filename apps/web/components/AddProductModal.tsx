import React from 'react';
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
  modeOfDelivery: string[];
  modeOfPayment: string[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: AddProductFormData;
  onFormChange: (field: keyof AddProductFormData, value: any) => void;
  onCheckboxChange: (field: 'modeOfDelivery' | 'modeOfPayment', value: string, checked: boolean) => void;
  onImageUpload: (index: number, file: File | null) => void;
  onSubmit: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onCheckboxChange,
  onImageUpload,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green focus:border-green bg-gray-50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => onFormChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green focus:border-green bg-gray-50"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green focus:border-green bg-gray-50"
                />
              </div>

              {/* Material + Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => onFormChange("material", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green focus:border-green bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => onFormChange("age", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green focus:border-green bg-gray-50"
                  />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green focus:border-green bg-gray-50"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-xs text-gray-600 font-medium">
                        IMAGE {index + 1} :
                      </div>
                      <div className="relative border border-gray-300 rounded-xl bg-gray-50 h-24 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
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
                        {formData.images[index] ? (
                          <div className="text-xs text-gray-600 text-center">
                            {formData.images[index]?.name || "Image uploaded"}
                          </div>
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
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="modeOfTransaction"
                        value="For Swap"
                        checked={formData.modeOfTransaction === "For Swap"}
                        onChange={(e) => onFormChange("modeOfTransaction", e.target.value)}
                        className="mr-2 text-green focus:ring-green"
                      />
                      <span className="text-sm text-gray-700">For Swap</span>
                    </label>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green focus:border-green bg-gray-50"
                    placeholder={
                      formData.modeOfTransaction === "For Swap"
                        ? "SWAP"
                        : "₱ 0.00"
                    }
                    disabled={formData.modeOfTransaction === "For Swap"}
                  />
                </div>
              </div>

              {/* Mode of Delivery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Delivery <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {["J&T Express", "LBC Express", "Lalamove", "GoGo Xpress", "GrabExpress"].map(
                    (option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.modeOfDelivery.includes(option)}
                          onChange={(e) =>
                            onCheckboxChange(
                              "modeOfDelivery",
                              option,
                              e.target.checked
                            )
                          }
                          className="mr-2 text-green focus:ring-green rounded"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Mode of Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Payment :
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
              </div>
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
            onClick={onSubmit}
            className="px-6 py-2 bg-green text-white rounded-full hover:bg-green transition font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;