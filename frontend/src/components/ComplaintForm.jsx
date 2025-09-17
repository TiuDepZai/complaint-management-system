import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function ComplaintForm({ onClose, onSubmitted }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'Medium',
    assignTo: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // categories
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');

  const [apiError, setApiError] = useState('');

  const validate = (values) => {
    const e = {};
    if (!values.subject.trim()) e.subject = 'Subject is required';
    else if (values.subject.trim().length > 200) e.subject = 'Subject must be 200 characters or fewer';
    if (!values.description.trim()) e.description = 'Description is required';
    if (!values.category) e.category = 'Please select a category';
    if (!PRIORITIES.includes(values.priority)) e.priority = 'Invalid priority';
    return e;
  };

  const handleChange = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (touched[field]) {
      const v = validate(next);
      setErrors((prev) => ({ ...prev, [field]: v[field] }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    const v = validate(form);
    setErrors((prev) => ({ ...prev, [field]: v[field] }));
  };

  // Load Active categories (auth required)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setCatLoading(true);
        setCatError('');
        const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
        const res = await axiosInstance.get('/api/categories/active', { headers });
        if (!ignore) setCategories(res.data || []);
      } catch (e) {
        if (!ignore) setCatError('Failed to load categories');
      } finally {
        if (!ignore) setCatLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const v = validate(form);
    setErrors(v);
    setTouched({
      subject: true, description: true, category: true, priority: true,
    });
    if (Object.keys(v).length > 0) return;
    
    try {
      setSubmitting(true);
      const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
      const payload = {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      };

      console.log('Submitting complaint with payload:', payload);
      const res = await axiosInstance.post('/api/complaints', payload, { headers });


      onSubmitted?.(res.data);


      setForm({  subject: '', description: '', category: '', priority: 'Medium' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit complaint';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const invalid = (field) => touched[field] && errors[field];

  return (
    <form onSubmit={handleSubmit} className="relative bg-white p-6 shadow-md rounded mb-6">
      {/* Close (X) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <h1 className="text-2xl font-bold mb-4">Submit a Complaint</h1>

      {/* Subject */}
      <input
        type="text"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange('subject')}
        onBlur={handleBlur('subject')}
        aria-invalid={!!invalid('subject')}
        className={`w-full mb-1 p-2 border rounded ${invalid('subject') ? 'border-red-500' : ''}`}
      />
      {invalid('subject') && <div className="text-red-600 text-sm mb-3">{errors.subject}</div>}

      {/* Description */}
      <textarea
        placeholder="Description"
        rows={4}
        value={form.description}
        onChange={handleChange('description')}
        onBlur={handleBlur('description')}
        aria-invalid={!!invalid('description')}
        className={`w-full mb-1 p-2 border rounded ${invalid('description') ? 'border-red-500' : ''}`}
      />
      {invalid('description') && <div className="text-red-600 text-sm mb-3">{errors.description}</div>}

      {/* Category */}
      <select
        value={form.category}
        onChange={handleChange('category')}
        onBlur={handleBlur('category')}
        aria-invalid={!!invalid('category')}
        className={`w-full mb-1 p-2 border rounded ${invalid('category') ? 'border-red-500' : ''}`}
        disabled={catLoading}
      >
        <option value="">
          {catLoading ? 'Loading categories…' : 'Select Category'}
        </option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      {catError && <div className="text-red-600 text-sm mb-2">{catError}</div>}
      {invalid('category') && <div className="text-red-600 text-sm mb-3">{errors.category}</div>}

      {/* Priority */}
      <select
        value={form.priority}
        onChange={handleChange('priority')}
        onBlur={handleBlur('priority')}
        aria-invalid={!!invalid('priority')}
        className={`w-full mb-6 p-2 border rounded ${invalid('priority') ? 'border-red-500' : ''}`}
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      {invalid('priority') && <div className="text-red-600 text-sm mb-3 -mt-5 mb-6">{errors.priority}</div>}

      {apiError && <div className="text-red-600 mb-2">{apiError}</div>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className={`flex-1 p-2 rounded text-white ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
        <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
