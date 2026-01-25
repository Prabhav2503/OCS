import { useState, useEffect } from 'react';
import { getProfiles, applyToProfile, acceptRejectOffer, getUserData } from '../api/axios';
import { FaBuilding, FaBriefcase, FaUser, FaSearch, FaCheckCircle, FaClock, FaTimesCircle, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, profiles]);

  const fetchData = async () => {
    try {
      const [profilesRes, userDataRes] = await Promise.all([
        getProfiles(),
        getUserData()
      ]);
      setProfiles(profilesRes.data.data || []);
      setFilteredProfiles(profilesRes.data.data || []);
      setStatus(profilesRes.data.status || 'All');
      setUserApplications(userDataRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    const filtered = profiles.filter(profile => 
      profile.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.profile_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProfiles(filtered);
  };

  const getApplicationStatus = (profileCode) => {
    const application = userApplications.find(app => app.profile_code === profileCode);
    return application?.status || null;
  };

  const handleApply = async (profileCode) => {
    setApplyingTo(profileCode);
    try {
      await applyToProfile(profileCode);
      toast.success('Application submitted successfully!');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply';
      toast.error(message);
    } finally {
      setApplyingTo(null);
    }
  };

  const handleAcceptReject = async (profileCode, action) => {
    setActionLoading(`${profileCode}-${action}`);
    try {
      await acceptRejectOffer(profileCode, action);
      toast.success(`Offer ${action.toLowerCase()} successfully!`);
      fetchData();
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
          <p className="text-gray-500">Loading job profiles...</p>
        </div>
      </div>
    );
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'Accepted':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
          icon: <FaTrophy className="text-green-500 text-3xl" />,
          title: '🎉 Congratulations! You\'re Placed! 🎉',
          message: 'You have successfully accepted an offer. Here are the details of your placement.'
        };
      case 'Selected':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
          icon: <FaCheckCircle className="text-amber-500 text-xl" />,
          title: 'You\'ve been selected!',
          message: 'Review your offer(s) below and accept or reject.'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {status === 'Accepted' ? 'Your Placement' : status === 'Selected' ? 'Your Offers' : 'Browse Job Profiles'}
        </h1>
        <p className="text-gray-600">
          {status === 'Accepted' ? 'Your placement details' : status === 'Selected' ? 'Accept or reject your offers' : 'Explore and apply to exciting career opportunities'}
        </p>
      </div>

      {/* Status Banner */}
      {statusInfo && (
        <div className={`${statusInfo.bg} border-2 rounded-2xl p-8 mb-8 flex items-start gap-6`}>
          {statusInfo.icon}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{statusInfo.title}</h3>
            <p className="text-gray-600">{statusInfo.message}</p>
          </div>
        </div>
      )}

      {/* Search Bar - Only for All status */}
      {status === 'All' && (
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, role, or profile code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Profiles Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No job profiles available at the moment'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${status === 'Accepted' ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredProfiles.map((profile, index) => {
            const appStatus = getApplicationStatus(profile.profile_code);
            
            return (
              <div 
                key={index} 
                className={`card border hover:shadow-xl transition-all duration-300 flex flex-col ${
                  status === 'Accepted' 
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                {/* Accepted Badge */}
                {status === 'Accepted' && (
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-full text-sm">
                      <FaTrophy />
                      PLACED
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    status === 'Accepted' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                    <FaBuilding className="text-white text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{profile.designation}</h3>
                    <p className="text-gray-600 truncate">{profile.company_name}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaBriefcase className="text-gray-400" />
                    <span>Profile Code: <span className="font-medium text-gray-700">{profile.profile_code}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaUser className="text-gray-400" />
                    <span>Recruiter: <span className="font-medium text-gray-700">{profile.recruiter_email}</span></span>
                  </div>
                </div>

                {/* Card Footer - Based on status */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  {/* Accepted Status - Just show the accepted badge */}
                  {status === 'Accepted' && (
                    <div className="flex items-center justify-center gap-2 py-3 bg-green-100 text-green-700 font-semibold rounded-xl">
                      <FaCheckCircle />
                      <span>Offer Accepted</span>
                    </div>
                  )}

                  {/* Selected Status - Show Accept/Reject buttons */}
                  {status === 'Selected' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptReject(profile.profile_code, 'Accepted')}
                        disabled={actionLoading === `${profile.profile_code}-Accepted`}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {actionLoading === `${profile.profile_code}-Accepted` ? (
                          <>
                            <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            <span>Accept</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAcceptReject(profile.profile_code, 'Rejected')}
                        disabled={actionLoading === `${profile.profile_code}-Rejected`}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {actionLoading === `${profile.profile_code}-Rejected` ? (
                          <>
                            <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* All Status - Show Apply or Applied status */}
                  {status === 'All' && (
                    <>
                      {appStatus === 'Applied' ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-blue-100 text-blue-700 font-semibold rounded-xl">
                          <FaClock />
                          <span>Applied</span>
                        </div>
                      ) : appStatus === 'Selected' ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-emerald-100 text-emerald-700 font-semibold rounded-xl">
                          <FaCheckCircle />
                          <span>Selected</span>
                        </div>
                      ) : appStatus === 'Not Selected' ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl">
                          <FaTimesCircle />
                          <span>Not Selected</span>
                        </div>
                      ) : appStatus === 'Rejected' ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 font-semibold rounded-xl">
                          <FaTimesCircle />
                          <span>Rejected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(profile.profile_code)}
                          disabled={applyingTo === profile.profile_code}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {applyingTo === profile.profile_code ? (
                            <>
                              <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                              <span>Applying...</span>
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Profiles;
