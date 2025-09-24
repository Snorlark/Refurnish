"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/help" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using Refurnish ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-6">
              Refurnish is an online marketplace that connects buyers and sellers of pre-loved furniture. 
              We facilitate transactions between users and provide a platform for furniture swapping and selling.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-6">
              To use certain features of the Service, you must register for an account. You are responsible for 
              maintaining the confidentiality of your account and password. You agree to accept responsibility 
              for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Uses</h2>
            <p className="text-gray-600 mb-4">You may not use our Service:</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
            <p className="text-gray-600 mb-6">
              The Service and its original content, features, and functionality are and will remain the exclusive 
              property of Refurnish and its licensors. The Service is protected by copyright, trademark, and other 
              laws. Our trademarks and trade dress may not be used in connection with any product or service without 
              our prior written consent.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User-Generated Content</h2>
            <p className="text-gray-600 mb-6">
              You retain ownership of any content you post to the Service. By posting content, you grant us a 
              non-exclusive, royalty-free, worldwide license to use, reproduce, modify, and distribute your content 
              in connection with the Service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers</h2>
            <p className="text-gray-600 mb-6">
              The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, 
              this Company excludes all representations, warranties, conditions and terms relating to our Service and 
              the use of this Service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              In no event shall Refurnish, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use 
              of the Service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These Terms shall be interpreted and governed by the laws of the Philippines, without regard to its 
              conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be 
              considered a waiver of those rights.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
              revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: support@refurnish.com
              <br />
              Phone: +63 (0) 2 1234 5678
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
