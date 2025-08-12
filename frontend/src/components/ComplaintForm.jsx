import React, { useState } from 'react';

export default function ComplaintForm({ onClose, categories = [] }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    category: '',
    priority: 'Medium',
  });

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: hook up API in next sub-task
  };

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

      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={handleChange('name')}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange('email')}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange('subject')}
        className="w-full mb-4 p-2 border rounded"
      />

      <textarea
        placeholder="Description"
        rows={4}
        value={form.description}
        onChange={handleChange('description')}
        className="w-full mb-4 p-2 border rounded"
      />

      {/* Category dropdown (expects only Active categories passed in) */}
      <select
        value={form.category}
        onChange={handleChange('category')}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="" disabled>
          {categories.length ? 'Select Category' : 'Loading categories…'}
        </option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={form.priority}
        onChange={handleChange('priority')}
        className="w-full mb-6 p-2 border rounded"
      >
        {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

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
