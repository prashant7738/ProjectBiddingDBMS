import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { createAuction } from '../api/auth.js';

export default function CreateAuction() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    starting_price: '',
    start_time: '',
    end_time: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const imagePreview = useMemo(() => {
    if (!form.image) return '';
    return URL.createObjectURL(form.image);
  }, [form.image]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append('seller_id', String(user?.id ?? ''));
    payload.append('title', form.title.trim());
    payload.append('description', form.description.trim());
    payload.append('category_id', String(form.category_id));
    payload.append('starting_price', String(form.starting_price));
    if (form.start_time) {
      const isoEndTime = new Date(form.start_time).toISOString();
      payload.append('start_time', isoEndTime);
    }
    if (form.end_time) {
      const isoEndTime = new Date(form.end_time).toISOString();
      payload.append('end_time', isoEndTime);
    }
    if (form.image) {
      payload.append('image', form.image);
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user?.id) {
      setError('You must be logged in to create an auction.');
      return;
    }

    if (!form.title || !form.description || !form.category_id || !form.starting_price) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      await createAuction(payload);
      setSuccess('Auction created successfully.');
      setShowSuccessModal(true);
      setForm({
        title: '',
        description: '',
        category_id: '',
        starting_price: '',
        start_time: '',
        end_time: '',
        image: null,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create auction.');
    } finally {
      setSubmitting(false);
      
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4 mx-auto"></div>
          <p className="text-gray-600 font-semibold">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-red-700 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xl font-bold">You must be logged in to create an auction.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]  py-10 px-4 font-outfit">
      <div className="create-card max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
        <div className="px-8 py-8 border-b border-gray-100 ">
          <h1 className="text-3xl md:text-4xl font-black ">
            Create Auction
          </h1>
          <p className="text-gray-600 mt-2 font-semibold">Publish a new auction for bidders to join.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="iPhone 17 Pro Max"
              className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item, its condition, and provenance."
              className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category_id" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                value={form.category_id}
                onChange={handleChange}
                className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="1">Electronics</option>
                <option value="2">Home & Garden</option>
                <option value="3">Fashion</option>
                <option value="4">Others</option>
              </select>
            </div>

            <div>
              <label htmlFor="starting_price" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Starting Price <span className="text-red-500">*</span>
              </label>
              <input
                id="starting_price"
                name="starting_price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.starting_price}
                onChange={handleChange}
                placeholder="500"
                className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="start_time" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Start Time <span className="text-gray-500 text-xs normal-case">(optional)</span>
              </label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={form.start_time}
                onChange={handleChange}
                className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="end_time" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              id="end_time"
              name="end_time"
              type="datetime-local"
              required
              value={form.end_time}
              onChange={handleChange}
              className="input-field w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Image
            </label>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <label className="image-upload-zone flex-1 cursor-pointer">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-2xl px-6 py-8 text-center hover:border-purple-500 transition-all">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-600">
                    {form.image ? form.image.name : 'Click to upload or drag and drop'}
                  </p>
                </div>
              </label>
              {imagePreview && (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded-2xl object-cover border-4 border-purple-200 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 text-red-700 px-5 py-4 text-sm font-semibold flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 px-5 py-4 text-sm font-semibold flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="submit-btn text-white font-bold px-10 py-4 shadow-xl hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed rounded-xl relative overflow-hidden"
            >
              <span className="relative z-10">
                {submitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating…</span>
                  </span>
                ) : 'Create Auction'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                <svg className="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Auction Created!</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Your auction has been successfully created and is now live.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:opacity-95 transition shadow-lg"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}