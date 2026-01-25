import { useState } from 'react';
import { registerUser } from '../api/axios';
import { FaUserPlus, FaUser, FaLock, FaUserTag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RegisterUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userid: '',
    role: 'student',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(formData.userid, formData.role, formData.password);
      toast.success('User registered successfully!');
      setFormData({ userid: '', role: 'student', password: '' });
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error?.message || 'Failed to register user';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
          <FaUserPlus className="text-3xl text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New User</h1>
        <p className="text-gray-600">Create accounts for students, recruiters, or admins</p>
      </div>

      {/* Form Card */}
      <div className="card border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID *
            </label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="userid"
                value={formData.userid}
                onChange={handleChange}
                placeholder="e.g., john@example.com or student123"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">This will be used for login</p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <div className="relative">
              <FaUserTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Role Permissions</h4>
            <div className="space-y-2 text-sm">
              <div className={`flex items-start gap-2 ${formData.role === 'student' ? 'text-emerald-700' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full mt-1.5 ${formData.role === 'student' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                <span><strong>Student:</strong> Browse job profiles, apply to jobs, accept/reject offers</span>
              </div>
              <div className={`flex items-start gap-2 ${formData.role === 'recruiter' ? 'text-emerald-700' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full mt-1.5 ${formData.role === 'recruiter' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                <span><strong>Recruiter:</strong> Create job profiles, review applications, select candidates</span>
              </div>
              <div className={`flex items-start gap-2 ${formData.role === 'admin' ? 'text-emerald-700' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full mt-1.5 ${formData.role === 'admin' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                <span><strong>Admin:</strong> All permissions + register new users + assign recruiters to profiles</span>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                <span>Registering User...</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Register User</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
