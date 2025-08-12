import React, { useState } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function ComplaintForm({ onClose, categories = [] }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    category: '',
    priority: 'Medium',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (values) => {
    const e = {};
    if (!values.name.trim()) e.name = 'Name is required';
    if (!values.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(values.email.trim())) e.email = 'Enter a valid email';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setTouched({
      name: true,
      email: true,
      subject: true,
      description: true,
      category: true,
      priority: true,
    });
    if (Object.keys(v).length > 0) return; // invalid → stop here

    // TODO: hook up API in next sub-task
    // You could temporarily console.log(form) if you want to see the payload.
  };

  // helper to style invalid fields
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

      {/* Name */}
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        aria-invalid={!!invalid('name')}
        className={`w-full mb-1 p-2 border rounded ${invalid('name') ? 'border-red-500' : ''}`}
      />
      {invalid('name') && <div className="text-red-600 text-sm mb-3">{errors.name}</div>}

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        aria-invalid={!!invalid('email')}
        className={`w-full mb-1 p-2 border rounded ${invalid('email') ? 'border-red-500' : ''}`}
      />
      {invalid('email') && <div className="text-red-600 text-sm mb-3">{errors.email}</div>}

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
      >
        <option value="">
          {categories.length ? 'Select Category' : 'Loading categories…'}
        </option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
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

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded">
          Submit
        </button>
        <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
