import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserData, changeApplicationStatus, acceptRejectOffer } from '../api/axios';
import { FaBriefcase, FaBuilding, FaUser, FaCheckCircle, FaClock, FaTimesCircle, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getUserData();
      setData(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Applied': { bg: 'bg-blue-100 text-blue-700', icon: <FaClock /> },
      'Selected': { bg: 'bg-emerald-100 text-emerald-700', icon: <FaCheckCircle /> },
      'Accepted': { bg: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> },
      'Rejected': { bg: 'bg-red-100 text-red-700', icon: <FaTimesCircle /> },
      'Not Selected': { bg: 'bg-gray-100 text-gray-700', icon: <FaTimesCircle /> },
    };
    const config = statusConfig[status] || statusConfig['Applied'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const handleStudentAction = async (profileCode, action) => {
    setActionLoading(`${profileCode}-${action}`);
    try {
      await acceptRejectOffer(profileCode, action);
      toast.success(`Offer ${action.toLowerCase()} successfully!`);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecruiterAction = async (profileCode, entryNumber, status) => {
    setActionLoading(`${profileCode}-${entryNumber}-${status}`);
    try {
      await changeApplicationStatus(profileCode, status, entryNumber);
      toast.success(`Application ${status.toLowerCase()} successfully!`);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, <span className="text-blue-600">{user?.userid}</span>!
        </h1>
        <p className="text-gray-600">
          {user?.role === 'student' && 'Track your job applications and manage offers'}
          {user?.role === 'recruiter' && 'Manage your job profiles and review applications'}
          {user?.role === 'admin' && 'Overview of all profiles and applications'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FaBriefcase className="text-white text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total {user?.role === 'student' ? 'Applications' : 'Profiles'}</p>
              <p className="text-2xl font-bold text-gray-900">{data.length}</p>
            </div>
          </div>
        </div>

        {user?.role === 'student' && (
          <>
            <div className="card bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Selected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.filter(d => d.status === 'Selected').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <FaClock className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.filter(d => d.status === 'Applied').length}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {(user?.role === 'recruiter' || user?.role === 'admin') && (
          <div className="card bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <FaUsers className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.reduce((acc, d) => acc + (d.applicants?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content based on role */}
      {data.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Found</h3>
          <p className="text-gray-500">
            {user?.role === 'student' && "You haven't applied to any profiles yet."}
            {user?.role === 'recruiter' && "You haven't created any job profiles yet."}
            {user?.role === 'admin' && "No profiles have been created yet."}
          </p>
        </div>
      ) : user?.role === 'student' ? (
        <StudentDashboard 
          data={data} 
          getStatusBadge={getStatusBadge}
        />
      ) : (
        <RecruiterAdminDashboard 
          data={data}
          role={user?.role}
          handleAction={handleRecruiterAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

const StudentDashboard = ({ data, getStatusBadge }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Applications</h2>
    <div className="grid gap-4">
      {data.map((item, index) => (
        <div key={index} className="card hover:shadow-xl transition-all border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.designation}</h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FaBuilding className="text-gray-400" />
                    {item.company_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Profile: {item.profile_code}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              {getStatusBadge(item.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RecruiterAdminDashboard = ({ data, role, handleAction, actionLoading }) => {
  const [expandedProfile, setExpandedProfile] = useState(null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        {role === 'admin' ? 'All Job Profiles' : 'Your Job Profiles'}
      </h2>
      
      <div className="grid gap-6">
        {data.map((profile, index) => (
          <div key={index} className="card border border-gray-100">
            <div 
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              onClick={() => setExpandedProfile(expandedProfile === index ? null : index)}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaBriefcase className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{profile.designation}</h3>
                  <p className="text-gray-600">{profile.company_name}</p>
                  <p className="text-sm text-gray-500">Code: {profile.profile_code}</p>
                  {role === 'admin' && (
                    <p className="text-sm text-gray-500">Recruiter: {profile.recruiter_email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{profile.applicants?.length || 0}</p>
                  <p className="text-sm text-gray-500">Applicants</p>
                </div>
                <svg 
                  className={`w-6 h-6 text-gray-400 transition-transform ${expandedProfile === index ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Applicants List */}
            {expandedProfile === index && profile.applicants?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Applicants</h4>
                <div className="grid gap-3">
                  {profile.applicants.map((applicant, idx) => {
                    const entryNumber = applicant.entry_number || applicant;
                    const appStatus = applicant.status || null;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">{entryNumber}</span>
                            {appStatus && (
                              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                                appStatus === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                                appStatus === 'Accepted' ? 'bg-green-100 text-green-700' :
                                appStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                appStatus === 'Not Selected' ? 'bg-gray-200 text-gray-600' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {appStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {appStatus === 'Applied' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(profile.profile_code, entryNumber, 'Selected');
                                }}
                                disabled={actionLoading === `${profile.profile_code}-${entryNumber}-Selected`}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                              >
                                Select
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(profile.profile_code, entryNumber, 'Not Selected');
                                }}
                                disabled={actionLoading === `${profile.profile_code}-${entryNumber}-Not Selected`}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {appStatus === 'Accepted' && (
                            <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                              Placed ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {expandedProfile === index && (!profile.applicants || profile.applicants.length === 0) && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-center py-8">
                <FaUsers className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No applicants yet</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
