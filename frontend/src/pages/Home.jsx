import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBriefcase, FaUserGraduate, FaBuilding, FaUserShield, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl mb-8">
            <FaBriefcase className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            On-Campus <span className="text-blue-400">Recruitment</span> Portal
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Streamlining the placement process for students, recruiters, and administrators. 
            Find your dream job or discover top talent.
          </p>
          
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Go to Dashboard
              <FaArrowRight />
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started
              <FaArrowRight />
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Designed for Everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform caters to all stakeholders in the campus recruitment process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <FaUserGraduate className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Students</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                  <span>Browse available job profiles from top companies</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                  <span>Apply to multiple positions with one click</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                  <span>Track application status in real-time</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                  <span>Accept or reject offers with ease</span>
                </li>
              </ul>
            </div>

            {/* Recruiter Card */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <FaBuilding className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Recruiters</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-teal-500 mt-1 flex-shrink-0" />
                  <span>Create and manage job profiles</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-teal-500 mt-1 flex-shrink-0" />
                  <span>Review applications efficiently</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-teal-500 mt-1 flex-shrink-0" />
                  <span>Select or reject candidates instantly</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-teal-500 mt-1 flex-shrink-0" />
                  <span>Track hiring pipeline progress</span>
                </li>
              </ul>
            </div>

            {/* Admin Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <FaUserShield className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Admins</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span>Complete system oversight and control</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span>Register students, recruiters, and admins</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span>Create profiles and assign recruiters</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <FaCheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span>Monitor all recruitment activities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500">
            © 2026 OCS Portal. Built for seamless campus recruitment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
