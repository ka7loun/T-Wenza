import React, { useState, useEffect } from 'react';
import { Bell, Users, Check, X, Clock, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConnectionRequest {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: string;
  created_at: string;
  sender_profile?: any;
}

const Notifications = () => {
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch pending connection requests where current user is the recipient
      const { data: requests, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          sender_profile:profiles!user_connections_user_id_1_fkey(*)
        `)
        .eq('user_id_2', session.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnectionRequests(requests || []);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingRequest(requestId);
      
      const newStatus = action === 'accept' ? 'accepted' : 'declined';
      
      const { error } = await supabase
        .from('user_connections')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      // Remove the request from the list
      setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error handling connection request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4 flex items-center">
            <Bell className="w-8 h-8 mr-3" />
            Notifications
          </h1>
          <p className="text-gray-600">
            Manage your connection requests and stay updated with your network
          </p>
        </div>

        {/* Connection Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Connection Requests ({connectionRequests.length})
          </h2>

          {connectionRequests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No Pending Requests</h3>
              <p className="text-gray-600">
                You don't have any pending connection requests at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectionRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                        {request.sender_profile?.avatar_url ? (
                          <img
                            src={request.sender_profile.avatar_url}
                            alt={request.sender_profile.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary">
                          {request.sender_profile?.full_name || 'Anonymous User'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.sender_profile?.bio || 'No bio available'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {request.sender_profile?.university && (
                            <span>{request.sender_profile.university}</span>
                          )}
                          {request.sender_profile?.major && (
                            <>
                              <span>•</span>
                              <span>{request.sender_profile.major}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-400 mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>
                            {new Date(request.created_at).toLocaleDateString()} at{' '}
                            {new Date(request.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleConnectionRequest(request.id, 'accept')}
                        disabled={processingRequest === request.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleConnectionRequest(request.id, 'decline')}
                        disabled={processingRequest === request.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>

                  {/* Skills */}
                  {request.sender_profile?.skills && request.sender_profile.skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {request.sender_profile.skills.slice(0, 5).map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {request.sender_profile.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{request.sender_profile.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other Notifications Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Recent Activity
          </h2>
          
          <div className="text-center py-8">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">No Recent Activity</h3>
            <p className="text-gray-600">
              Your recent activity and updates will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;