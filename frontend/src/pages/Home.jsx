import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const year = new Date().getFullYear();

  const handleRegisterComplaint = () => {
    const target = '/complaints?new=1';
    if (!user?.token) {
      navigate('/login', { state: { redirectTo: target } });
    } else {
      navigate(target);
    }
  };

  const handleViewAllComplaints = () => navigate('/complaints?all=1');

  const handleViewMyComplaints = () => {
    const target = '/complaints';
    if (!user?.token) {
      navigate('/login', { state: { redirectTo: target } });
    } else {
      navigate(target);
    }
  };

  const CTAButtons = () =>
    isAdmin ? (
      <button
        onClick={handleViewAllComplaints}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        View All Complaints
      </button>
    ) : (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRegisterComplaint}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Register Complaint
        </button>
        <button
          onClick={handleViewMyComplaints}
          className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-gray-800"
        >
          View Complaints
        </button>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO */}
      <section
        className="relative h-72 md:h-96 w-full bg-cover bg-center"
        aria-label="People waiting in a queue to register complaints"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/3848898/pexels-photo-3848898.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center">
          <div className="px-6 max-w-5xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Complaint Management System
            </h1>
            <p className="text-white/90 max-w-2xl">
              A streamlined way to register issues, track progress, and resolve complaints faster.
            </p>
            <div className="mt-4">
              <CTAButtons />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* Spread-out content sections */}
        <section className="w-full px-6 py-10 grid gap-6 md:grid-cols-3 items-stretch">
          <article className="bg-white rounded-xl shadow p-5 border border-gray-200 h-full min-h-56 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">How It Works</h2>
            <p className="text-gray-700">
              Submit your complaint with essential details like subject, description, category, and priority.
              You’ll receive a unique reference number to track status at any time.
            </p>
          </article>

          <article className="bg-white rounded-xl shadow p-5 border border-gray-200 h-full min-h-56 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Categories &amp; Priorities</h2>
            <p className="text-gray-700">
              Complaints are organized by category and marked with a priority level, helping teams triage and resolve
              issues efficiently.
            </p>
          </article>

          <article className="bg-white rounded-xl shadow p-5 border border-gray-200 h-full min-h-56 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Track &amp; Manage</h2>
            <p className="text-gray-700">
              Keep an eye on your submissions with the reference number. Update descriptions or follow up as needed.
              Admins can review and manage all complaints centrally.
            </p>
          </article>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {year} CMS — All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-gray-800">About</Link>
            <Link to="/contact" className="hover:text-gray-800">Contact</Link>
            <Link to="/privacy" className="hover:text-gray-800">Privacy</Link>

          </div>
        </div>
      </footer>
    </div>
  );
}
