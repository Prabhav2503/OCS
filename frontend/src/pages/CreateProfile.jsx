import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProfile } from '../api/axios';
import { FaBriefcase, FaBuilding, FaCode, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profile_code: '',
    company_name: '',
    designation: '',
    recruiter_email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        profile_code: formData.profile_code,
        company_name: formData.company_name,
        designation: formData.designation,
      };

      // Admin must provide recruiter_email
      if (user?.role === 'admin') {
        payload.recruiter_email = formData.recruiter_email;
      }

      await createProfile(payload);
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to create profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <FaBriefcase className="text-3xl text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Job Profile</h1>
        <p className="text-gray-600">Add a new job opportunity for students to apply</p>
      </div>

      {/* Form Card */}
      <div className="card border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Code *
            </label>
            <div className="relative">
              <FaCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="profile_code"
                value={formData.profile_code}
                onChange={handleChange}
                placeholder="e.g., SWE-2026-001"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Unique identifier for this job profile</p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <div className="relative">
              <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g., Google, Microsoft, Amazon"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation / Role *
            </label>
            <div className="relative">
              <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g., Software Engineer, Product Manager"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Recruiter Email (Admin only) */}
          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recruiter Email *
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="recruiter_email"
                  value={formData.recruiter_email}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">The recruiter who will manage this profile</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                <span>Creating Profile...</span>
              </>
            ) : (
              'Create Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
