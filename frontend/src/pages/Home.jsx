import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Local assets
import hero from '../assets/Hero.jpg';

// small blue icons
import iconReport from '../assets/icons/div.master-icon.png';
import iconCategories from '../assets/icons/div.master-icon (1).png';
import iconTrack from '../assets/icons/div.master-icon (2).png';

// new large images for the cards
import howItWorksImg from '../assets/other_images/howitoworks.png';
import categoryImg from '../assets/other_images/Category.png';
import taskImg from '../assets/other_images/task.png';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
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

  // Buttons area
  const CTAButtons = () => {
    if (isAdmin) {
      return (
        <button
          onClick={handleViewAllComplaints}
          className="bg-[#1E4E8C] text-white px-5 py-2 rounded shadow 
                     hover:bg-[#163B68] 
                     disabled:bg-[#DDDDDD] disabled:text-[#AAAAAA]"
        >
          View All Complaints
        </button>
      );
    }

    if (isStaff) {
      // Staff: no "Register", only "View Assigned Complaints"
      return (
        <button
          onClick={handleViewMyComplaints}
          className="border border-[#4A90E2] bg-white text-[#4A90E2] 
                     px-5 py-2 rounded shadow 
                     hover:bg-[#E8F2FC]"
        >
          View Assigned Complaints
        </button>
      );
    }

    // Normal user (or signed out): show both
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleRegisterComplaint}
          className="bg-[#1E4E8C] text-white px-5 py-2 rounded shadow 
                     hover:bg-[#163B68] 
                     disabled:bg-[#DDDDDD] disabled:text-[#AAAAAA]"
        >
          Register Complaint
        </button>
        <button
          onClick={handleViewMyComplaints}
          className="border border-[#4A90E2] bg-white text-[#4A90E2] 
                     px-5 py-2 rounded shadow 
                     hover:bg-[#E8F2FC]"
        >
          View Complaints
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO */}
      <section
        className="relative h-[22rem] md:h-[28rem] w-full bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: `url(${hero})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 px-6 max-w-4xl flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            <span className="text-blue-400">All</span>{' '}
            <span className="text-blue-400">Your</span>{' '}
            Complaints. One Simple Hub.
          </h1>

          <p className="text-white/90 max-w-2xl mb-6">
            A streamlined way to register issues, track progress, and resolve complaints faster.
          </p>

          <CTAButtons />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <section className="w-full px-6 py-12">
          <h2 className="text-center text-2xl md:text-3xl font-semibold text-slate-800">
            How It Works
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3 items-stretch">
            {/* Card 1 */}
            <article className="relative bg-white rounded-2xl shadow p-5 border border-gray-200 h-full flex flex-col">
              <img
                src={howItWorksImg}
                alt="How It Works illustration"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="absolute -top-5 left-5 bg-white rounded-xl shadow p-2">
                <img src={iconReport} alt="Report icon" className="h-10 w-10" />
              </div>

              <h3 className="text-lg font-semibold mb-2 mt-2">How It Works</h3>
              <p className="text-gray-700">
                Submit your complaint with essential details like subject, description, category, and priority.
                You’ll receive a unique reference number to track status at any time.
              </p>
            </article>

            {/* Card 2 */}
            <article className="relative bg-white rounded-2xl shadow p-5 border border-gray-200 h-full flex flex-col">
              <img
                src={categoryImg}
                alt="Categories illustration"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="absolute -top-5 left-5 bg-white rounded-xl shadow p-2">
                <img src={iconCategories} alt="Categories icon" className="h-10 w-10" />
              </div>

              <h3 className="text-lg font-semibold mb-2 mt-2">Categories &amp; Priorities</h3>
              <p className="text-gray-700">
                Complaints are organized by category and marked with a priority level, helping teams triage and resolve
                issues efficiently.
              </p>
            </article>

            {/* Card 3 */}
            <article className="relative bg-white rounded-2xl shadow p-5 border border-gray-200 h-full flex flex-col">
              <img
                src={taskImg}
                alt="Track & Manage illustration"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="absolute -top-5 left-5 bg-white rounded-xl shadow p-2">
                <img src={iconTrack} alt="Track icon" className="h-10 w-10" />
              </div>

              <h3 className="text-lg font-semibold mb-2 mt-2">Track &amp; Manage</h3>
              <p className="text-gray-700">
                Keep an eye on your submissions with the reference number. Update descriptions or follow up as needed.
                Admins can review and manage all complaints centrally.
              </p>
            </article>
          </div>
        </section>
      </main>

      
    </div>
  );
}
