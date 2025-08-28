import React from 'react';
import { X, Upload } from 'lucide-react';

interface SellerRegistrationFormData {
  shopName: string;
  address: string;
  detailedAddress: string;
  contactNumber: string;
  governmentId1Front: File | null;
  governmentId1Back: File | null;
  governmentId2Front: File | null;
  governmentId2Back: File | null;
  transactionOptions: string[];
  termsAccepted: boolean;
}

interface SellerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: SellerRegistrationFormData;
  onFormChange: (field: keyof SellerRegistrationFormData, value: any) => void;
  onCheckboxChange: (field: 'transactionOptions', value: string, checked: boolean) => void;
  onFileUpload: (field: keyof SellerRegistrationFormData, file: File | null) => void;
  onSubmit: () => void;
}

const SellerRegistrationModal: React.FC<SellerRegistrationModalProps> = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onCheckboxChange,
  onFileUpload,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-900">Seller Registration Form</h2>
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
              {/* Shop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => onFormChange("shopName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => onFormChange("address", e.target.value)}
                  placeholder="Region/Province/City/Barangay/Postal Code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                />
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.detailedAddress}
                  onChange={(e) => onFormChange("detailedAddress", e.target.value)}
                  placeholder="House/Building #"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => onFormChange("contactNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                />
              </div>

              {/* Transaction Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.transactionOptions.includes("Courier Delivery Service")}
                      onChange={(e) =>
                        onCheckboxChange(
                          "transactionOptions",
                          "Courier Delivery Service",
                          e.target.checked
                        )
                      }
                      className="mr-2 text-green-500 focus:ring-green-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Courier Delivery Service</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.transactionOptions.includes("On-Site Claiming")}
                      onChange={(e) =>
                        onCheckboxChange(
                          "transactionOptions",
                          "On-Site Claiming",
                          e.target.checked
                        )
                      }
                      className="mr-2 text-green-500 focus:ring-green-500 rounded"
                    />
                    <span className="text-sm text-gray-700">On-Site Claiming</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Government IDs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government IDs <span className="text-red-500">*</span>
                </label>
                
                {/* ID 1 */}
                <div className="mb-4">
                  <div className="text-xs text-gray-600 font-medium mb-2">ID 1:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Front */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Government ID Front</div>
                      <div className="relative border border-gray-300 rounded-xl bg-gray-50 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              onFileUpload("governmentId1Front", files[0]);
                            }
                          }}
                        />
                        {formData.governmentId1Front ? (
                          <div className="text-xs text-gray-600 text-center">
                            {formData.governmentId1Front.name}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-5 w-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Upload</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Back */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Government ID Back</div>
                      <div className="relative border border-gray-300 rounded-xl bg-gray-50 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              onFileUpload("governmentId1Back", files[0]);
                            }
                          }}
                        />
                        {formData.governmentId1Back ? (
                          <div className="text-xs text-gray-600 text-center">
                            {formData.governmentId1Back.name}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-5 w-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Upload</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ID 2 */}
                <div>
                  <div className="text-xs text-gray-600 font-medium mb-2">ID 2:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Front */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Government ID Front</div>
                      <div className="relative border border-gray-300 rounded-xl bg-gray-50 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              onFileUpload("governmentId2Front", files[0]);
                            }
                          }}
                        />
                        {formData.governmentId2Front ? (
                          <div className="text-xs text-gray-600 text-center">
                            {formData.governmentId2Front.name}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-5 w-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Upload</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Back */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Government ID Back</div>
                      <div className="relative border border-gray-300 rounded-xl bg-gray-50 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              onFileUpload("governmentId2Back", files[0]);
                            }
                          }}
                        />
                        {formData.governmentId2Back ? (
                          <div className="text-xs text-gray-600 text-center">
                            {formData.governmentId2Back.name}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-5 w-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Upload</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-2">
                  The information provided will only be used for valid service-related purposes.
                </p>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => onFormChange("termsAccepted", e.target.checked)}
                    className="mr-2 mt-1 text-green-500 focus:ring-green-500 rounded"
                  />
                  <span className="text-xs text-gray-700">
                    I agree and understand the{" "}
                    <span className="text-green-600 underline cursor-pointer">
                      Terms and Conditions
                    </span>
                    .
                  </span>
                </label>
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
            className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistrationModal;