import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { createAuction } from '../api/auth.js';

export default function CreateAuction() {
  const { user, loading } = useContext(AuthContext);
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
    return <div className="p-6">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          You must be logged in to create an auction.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Auction</h1>
          <p className="text-gray-500 mt-1">Publish a new auction for bidders to join.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seller ID</label>
              <input
                type="text"
                value={user.id || ''}
                readOnly
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Antique vase"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item, its condition, and provenance."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">Category ID</label>
              <input
                id="category_id"
                name="category_id"
                type="number"
                min="1"
                required
                value={form.category_id}
                onChange={handleChange}
                placeholder="1"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="starting_price" className="block text-sm font-medium text-gray-700 mb-2">Starting Price</label>
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
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">Start Time <span className="text-gray-500 text-xs">(optional - defaults to now)</span></label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={form.start_time}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                required
                value={form.end_time}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-xl object-cover border border-gray-200"
                />
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-medium px-8 py-3 shadow-lg hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating…' : 'Create Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
