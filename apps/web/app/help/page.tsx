"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-2">Find answers to your questions and learn about our policies</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Terms of Service */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Terms of Service</h2>
            <p className="text-gray-600 mb-4">
              Learn about the terms and conditions for using Refurnish platform.
            </p>
            <Link 
              href="/help/terms"
              className="inline-flex items-center text-[#636B2F] hover:text-[#4d5323] font-medium"
            >
              Read Terms of Service →
            </Link>
          </div>

          {/* Privacy Policy */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              Understand how we collect, use, and protect your personal information.
            </p>
            <Link 
              href="/help/privacy"
              className="inline-flex items-center text-[#636B2F] hover:text-[#4d5323] font-medium"
            >
              Read Privacy Policy →
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I create an account?</h3>
              <p className="text-gray-600">
                You can create an account by clicking the "Register here" link on the login page, 
                or by using Google sign-in for a quicker registration process.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I list an item for sale?</h3>
              <p className="text-gray-600">
                After logging in, go to your seller dashboard and click "Add Product" to list your furniture items.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How does the swap feature work?</h3>
              <p className="text-gray-600">
                The swap feature allows you to trade your furniture with other users. Browse available items 
                and propose a swap if you find something you like.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
