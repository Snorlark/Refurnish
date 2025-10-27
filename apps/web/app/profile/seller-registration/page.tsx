"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export default function SellerRegistrationPage() {
  const { token, user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    shopName: '',
    address: '',
    detailedAddress: '',
    contactNumber: '',
    transactionOptions: [] as string[],
    termsAccepted: false,
    governmentId1Front: '',
    governmentId1Back: '',
    governmentId2Front: '',
    governmentId2Back: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/seller/me`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setForm((prev) => ({
            ...prev,
            shopName: data.shopName || '',
            address: data.address || '',
            detailedAddress: data.detailedAddress || '',
            contactNumber: data.contactNumber || '',
            transactionOptions: data.transactionOptions || [],
            termsAccepted: !!data.termsAccepted,
            governmentId1Front: data.governmentId1Front || '',
            governmentId1Back: data.governmentId1Back || '',
            governmentId2Front: data.governmentId2Front || '',
            governmentId2Back: data.governmentId2Back || '',
          }));
          // Setup previews from stored URLs
          const newPreviews: Record<string, string> = {};
          if (data.governmentId1Front) newPreviews.governmentId1Front = data.governmentId1Front;
          if (data.governmentId1Back) newPreviews.governmentId1Back = data.governmentId1Back;
          if (data.governmentId2Front) newPreviews.governmentId2Front = data.governmentId2Front;
          if (data.governmentId2Back) newPreviews.governmentId2Back = data.governmentId2Back;
          setPreviews(newPreviews);
          // If already submitted and not rejected, prevent resubmission and further edits/uploads
          if (data.status && data.status !== 'rejected') {
            setSuccess(`Submitted for approval${data.status ? ` (${data.status})` : ''}`);
            setIsLocked(true);
          }
        }
      } catch {}
    };
    run();
  }, [token]);

  const setField = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      setError(''); setSuccess(''); setSaving(true);
      const newErrors: Record<string, string> = {};
      if (!token) { setError('You must be logged in'); setSaving(false); return; }
      if (!form.shopName.trim()) newErrors.shopName = 'Shop name is required';
      if (!form.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
      else if (!/^\+?[0-9\-\s]{7,15}$/.test(form.contactNumber)) newErrors.contactNumber = 'Enter a valid contact number';
      if (!form.address.trim()) newErrors.address = 'Address is required';
      if (!form.detailedAddress.trim()) newErrors.detailedAddress = 'Detailed address is required';
      if (!form.transactionOptions || form.transactionOptions.length === 0) newErrors.transactionOptions = 'Select at least one transaction option';
      if (!form.governmentId1Front) newErrors.governmentId1Front = 'Government ID 1 (Front) is required';
      if (!form.governmentId1Back) newErrors.governmentId1Back = 'Government ID 1 (Back) is required';
      if (!form.termsAccepted) newErrors.termsAccepted = 'You must agree to the terms';
      setErrors(newErrors);
      if (Object.keys(newErrors).length) { setSaving(false); return; }
      const res = await fetch(`${API_BASE_URL}/api/seller/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const ct = res.headers.get('content-type') || '';
      const json = ct.includes('application/json') ? await res.json() : { error: await res.text() } as any;
      if (res.status === 409) {
        setSuccess('Seller registration already submitted for approval');
        return;
      }
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      setSuccess('Seller registration submitted for approval');
      setIsLocked(true);
      await refreshProfile();
    } catch (e: any) {
      setError(e.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  const uploadDoc = async (file: File, key: keyof typeof form) => {
    try {
      if (isLocked) return;
      if (!token) return;
      setUploading(true);
      // Validate type and size (<= 5MB)
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) { setError('Only JPG/PNG images are allowed'); setUploading(false); return; }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) { setError('File size must be 5MB or less'); setUploading(false); return; }
      const localUrl = URL.createObjectURL(file);
      setPreviews((p) => ({ ...p, [key as string]: localUrl }));
      const fd = new FormData();
      fd.append('document', file);
      const res = await fetch(`${API_BASE_URL}/api/seller/document`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setForm((p) => ({ ...p, [key]: json.url }));
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (user?.role === 'seller') {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-6">
        <div className="bg-white rounded-2xl border p-6">You are already a seller. Go to Seller Dashboard.</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-(--color-olive)">Seller Registration</h1>
                <p className="text-sm text-gray-600 mt-1">Provide your shop details and identification to become a verified seller.</p>
              </div>
              <button onClick={save} disabled={saving || uploading || isLocked} className={`px-5 py-2 rounded-full bg-(--color-green) text-white font-medium ${saving||uploading||isLocked?'opacity-70 cursor-not-allowed':''}`}>{saving?'Saving...': isLocked ? 'Submitted' : 'Submit'}</button>
            </div>
            {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
            {success && <div className="mt-4 text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2 text-sm">{success}</div>}
          </div>

          {/* Store & Contact */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                <input placeholder="Your shop name" value={form.shopName} disabled={isLocked} onChange={(e)=>{ setErrors((p)=>({ ...p, shopName: '' })); setField('shopName', e.target.value); }} className={`w-full px-4 py-3 border text-gray-800 ${errors.shopName ? 'border-red-500' : 'border-gray-200'} ${isLocked ? 'bg-gray-100 opacity-70 cursor-not-allowed' : 'bg-gray-100'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`} />
                {errors.shopName && <p className="mt-1 text-xs text-red-600">{errors.shopName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input placeholder="e.g. +63 912 345 6789" value={form.contactNumber} disabled={isLocked} onChange={(e)=>{ setErrors((p)=>({ ...p, contactNumber: '' })); setField('contactNumber', e.target.value); }} className={`w-full px-4 py-3 text-gray-800 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-200'} ${isLocked ? 'bg-gray-100 opacity-70 cursor-not-allowed' : 'bg-gray-100'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`} />
                {errors.contactNumber && <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input placeholder="City / Province" value={form.address} disabled={isLocked} onChange={(e)=>{ setErrors((p)=>({ ...p, address: '' })); setField('address', e.target.value); }} className={`w-full px-4 py-3 text-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-200'} ${isLocked ? 'bg-gray-100 opacity-70 cursor-not-allowed' : 'bg-gray-100'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`} />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Address</label>
                <input placeholder="Street, Building, Barangay" value={form.detailedAddress} disabled={isLocked} onChange={(e)=>{ setErrors((p)=>({ ...p, detailedAddress: '' })); setField('detailedAddress', e.target.value); }} className={`w-full px-4 py-3 text-gray-800 border ${errors.detailedAddress ? 'border-red-500' : 'border-gray-200'} ${isLocked ? 'bg-gray-100 opacity-70 cursor-not-allowed' : 'bg-gray-100'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`} />
                {errors.detailedAddress && <p className="mt-1 text-xs text-red-600">{errors.detailedAddress}</p>}
              </div>
            </div>
          </div>

          <hr />

          {/* Transaction Options */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Options</h2>
            <div className="flex flex-wrap gap-4">
              {['Courier Delivery Service','On-Site Claiming'].map(opt => (
                <label key={opt} className={`inline-flex items-center space-x-2 px-3 py-2 ${isLocked ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'} rounded-lg border ${errors.transactionOptions ? 'border-red-500' : 'border-gray-200'}`}>
                  <input type="checkbox" disabled={isLocked} className="accent-(--color-green)" checked={form.transactionOptions.includes(opt)} onChange={(e)=>{
                    setField('transactionOptions', e.target.checked ? [...form.transactionOptions, opt] : form.transactionOptions.filter(o=>o!==opt));
                  }} />
                  <span className="text-sm text-gray-800">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <hr />

          {/* Government IDs */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Government IDs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{k:'governmentId1Front', label:'Government ID 1 (Front)'}, {k:'governmentId1Back', label:'Government ID 1 (Back)'}, {k:'governmentId2Front', label:'Government ID 2 (Front)'}, {k:'governmentId2Back', label:'Government ID 2 (Back)'}].map((conf)=> {
                const url = previews[conf.k] || (form as any)[conf.k];
                return (
                <div key={conf.k}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{conf.label}</label>
                  <label className={`relative flex items-center justify-center h-44 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden ${isLocked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}>
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="ID" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-sm text-gray-600">{isLocked ? 'Editing disabled while pending approval' : 'Click to upload JPG/PNG (max 5MB)'}</span>
                    )}
                    <input disabled={isLocked} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e)=> e.target.files && uploadDoc(e.target.files[0], conf.k as keyof typeof form)} />
                  </label>
                  <div className="mt-2 text-xs text-gray-600">{url ? 'Uploaded' : ''}</div>
                </div>
              );})}
            </div>
          </div>

          <hr />

          {/* Terms */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmation</h2>
            <p className="text-sm text-gray-600 mb-4">The information provided will only be used for valid, service-related purposes.</p>
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                className="accent-(--color-green)"
                checked={!!form.termsAccepted}
                onChange={(e) => { setErrors((p)=>({ ...p, termsAccepted: '' })); setField('termsAccepted', e.target.checked); }}
              />
              <span className="text-sm text-gray-800">
                I agree and understand the <Link href="/help/terms" className="text-(--color-green) underline">Terms and Conditions</Link>.
              </span> 
            </label>
            {errors.termsAccepted && <p className="mt-1 text-xs text-red-600">{errors.termsAccepted}</p>}
          </div>
        </div>
      </div>
  );
}


