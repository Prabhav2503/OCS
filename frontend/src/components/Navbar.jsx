import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaBriefcase } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'recruiter': return 'bg-gradient-to-r from-teal-500 to-emerald-600';
      case 'student': return 'bg-gradient-to-r from-indigo-500 to-purple-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 md:px-8 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-18">
        <Link to="/" className="flex items-center gap-3 text-white no-underline text-xl font-bold tracking-tight">
          <FaBriefcase className="text-2xl text-blue-400" />
          <span className="hidden sm:inline">OCS Portal</span>
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex gap-1">
            <Link to="/dashboard" className="text-white/85 no-underline px-4 py-2 rounded-lg font-medium hover:bg-white/10 hover:text-white transition-all">
              Dashboard
            </Link>
            {user?.role === 'student' && (
              <Link to="/profiles" className="text-white/85 no-underline px-4 py-2 rounded-lg font-medium hover:bg-white/10 hover:text-white transition-all">
                Browse Jobs
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'recruiter') && (
              <Link to="/create-profile" className="text-white/85 no-underline px-4 py-2 rounded-lg font-medium hover:bg-white/10 hover:text-white transition-all">
                Create Profile
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/register-user" className="text-white/85 no-underline px-4 py-2 rounded-lg font-medium hover:bg-white/10 hover:text-white transition-all">
                Register User
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <FaUser className="text-blue-400" />
                <span className="text-white font-medium">{user?.userid}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase text-white ${getRoleBadgeClass(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white border-none rounded-lg cursor-pointer font-medium transition-all hover:-translate-y-0.5"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 bg-blue-400 hover:bg-white text-slate-800 no-underline rounded-lg font-semibold transition-all hover:-translate-y-0.5">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
