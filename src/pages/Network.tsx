import React, { useState, useEffect } from 'react';
import { Search, Users, UserPlus, MessageCircle, MapPin, GraduationCap, Briefcase, AlertCircle, Check, X, Clock, Filter, Bell, Heart, Share2, BookmarkPlus, MoreHorizontal, TrendingUp, Award, Lightbulb, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';

interface Connection {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: string;
  created_at: string;
  connected_user?: any;
  sender_profile?: any;
}

interface Post {
  id: string;
  author: {
    name: string;
    title: string;
    avatar: string;
    university?: string;
  };
  content: string;
  type: 'achievement' | 'article' | 'job' | 'course' | 'general';
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  image?: string;
  isLiked?: boolean;
}

const Network = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'connections' | 'requests'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getCurrentUser();
    fetchConnections();
    fetchConnectionRequests();
    generateMockPosts();
  }, []);

  const generateMockPosts = () => {
    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          title: 'Computer Science Student at MIT',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          university: 'MIT'
        },
        content: '🎉 Excited to share that I just completed my Machine Learning certification! The journey was challenging but incredibly rewarding. Special thanks to my study group for the support. #MachineLearning #AI #StudentLife',
        type: 'achievement',
        timestamp: '2 hours ago',
        likes: 24,
        comments: 8,
        shares: 3,
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop',
        isLiked: false
      },
      {
        id: '2',
        author: {
          name: 'Ahmed Hassan',
          title: 'Data Science Student at Stanford',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          university: 'Stanford'
        },
        content: 'Just published my first research paper on "Deep Learning Applications in Healthcare"! It\'s been months of hard work, but seeing it come together is amazing. Looking forward to presenting at the upcoming conference. 📊🔬',
        type: 'article',
        timestamp: '4 hours ago',
        likes: 42,
        comments: 15,
        shares: 7,
        isLiked: true
      },
      {
        id: '3',
        author: {
          name: 'Emily Chen',
          title: 'Software Engineering Intern at Google',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          university: 'UC Berkeley'
        },
        content: '💼 Thrilled to announce that I\'ve accepted a Software Engineering internship at Google for this summer! The interview process was intense, but T-Wenza\'s coding practice modules really helped me prepare. Dreams do come true! 🚀',
        type: 'job',
        timestamp: '1 day ago',
        likes: 156,
        comments: 32,
        shares: 18,
        image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop',
        isLiked: false
      },
      {
        id: '4',
        author: {
          name: 'Marcus Williams',
          title: 'Business Administration Student',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          university: 'Harvard'
        },
        content: '📚 Just finished an incredible course on "Digital Marketing Strategy" through T-Wenza. The AI-generated flashcards and personalized quizzes made complex concepts so much easier to understand. Highly recommend to anyone in business!',
        type: 'course',
        timestamp: '2 days ago',
        likes: 31,
        comments: 12,
        shares: 5,
        isLiked: false
      },
      {
        id: '5',
        author: {
          name: 'Lisa Rodriguez',
          title: 'Psychology PhD Candidate',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          university: 'Yale'
        },
        content: '🧠 Fascinating insight from today\'s research: AI-powered personalized learning can improve retention rates by up to 40%! This aligns perfectly with what we\'re seeing on platforms like T-Wenza. The future of education is here. #EdTech #Psychology',
        type: 'general',
        timestamp: '3 days ago',
        likes: 67,
        comments: 23,
        shares: 12,
        isLiked: true
      }
    ];
    setPosts(mockPosts);
  };

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUserId(session.user.id);
    }
  };

  const fetchConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch accepted connections
      const { data: connectionsData, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          user1_profile:profiles!user_connections_user_id_1_fkey(*),
          user2_profile:profiles!user_connections_user_id_2_fkey(*)
        `)
        .or(`user_id_1.eq.${session.user.id},user_id_2.eq.${session.user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process connections to get the connected user's profile
      const processedConnections = connectionsData?.map(conn => {
        const isUser1 = conn.user_id_1 === session.user.id;
        const connectedUser = isUser1 ? conn.user2_profile : conn.user1_profile;
        
        return {
          ...conn,
          connected_user: connectedUser
        };
      }) || [];

      setConnections(processedConnections);

      // Fetch pending requests sent by current user
      const { data: pendingData, error: pendingError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id_1', session.user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;
      setPendingRequests(pendingData || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

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
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%,major.ilike.%${searchQuery}%`)
        .neq('user_id', session.user.id)
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (targetUserId: string) => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_connections')
        .insert([{
          user_id_1: session.user.id,
          user_id_2: targetUserId,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') {
          setError('Connection request already exists');
        } else {
          throw error;
        }
      } else {
        fetchConnections();
        setError(null);
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      setError('Failed to send connection request. Please try again.');
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

      // Remove the request from the list and refresh connections
      setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
      if (action === 'accept') {
        fetchConnections();
      }
    } catch (error) {
      console.error('Error handling connection request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const getConnectionStatus = (userId: string) => {
    if (!currentUserId) return 'none';

    const connection = [...connections, ...pendingRequests].find(conn => 
      (conn.user_id_1 === currentUserId && conn.user_id_2 === userId) ||
      (conn.user_id_2 === currentUserId && conn.user_id_1 === userId)
    );

    if (!connection) return 'none';
    if (connection.status === 'accepted') return 'connected';
    if (connection.user_id_1 === currentUserId && connection.status === 'pending') return 'pending';
    if (connection.user_id_2 === currentUserId && connection.status === 'pending') return 'received';
    return 'none';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  const getConnectionsByCategory = () => {
    const categories: { [key: string]: Connection[] } = {
      university: [],
      major: [],
      other: []
    };

    connections.forEach(conn => {
      const user = conn.connected_user;
      if (!user) return;

      if (user.university) {
        categories.university.push(conn);
      } else if (user.major) {
        categories.major.push(conn);
      } else {
        categories.other.push(conn);
      }
    });

    return categories;
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'article':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderFeedTab = () => (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <button className="flex-1 text-left px-4 py-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            Share your learning journey...
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-secondary">
            <Award className="w-5 h-5" />
            <span>Achievement</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-secondary">
            <Lightbulb className="w-5 h-5" />
            <span>Article</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-secondary">
            <Calendar className="w-5 h-5" />
            <span>Event</span>
          </button>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Trending in Your Network
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div>
              <h4 className="font-medium text-primary">#MachineLearning</h4>
              <p className="text-sm text-gray-600">142 posts this week</p>
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div>
              <h4 className="font-medium text-primary">#StudentLife</h4>
              <p className="text-sm text-gray-600">89 posts this week</p>
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div>
              <h4 className="font-medium text-primary">#Internships</h4>
              <p className="text-sm text-gray-600">67 posts this week</p>
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-primary">{post.author.name}</h3>
                      {getPostTypeIcon(post.type)}
                    </div>
                    <p className="text-sm text-gray-600">{post.author.title}</p>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-gray-800 leading-relaxed">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="px-6 pb-4">
                <img
                  src={post.image}
                  alt="Post content"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Post Stats */}
            <div className="px-6 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments</span>
                  <span>{post.shares} shares</span>
                </div>
              </div>
            </div>

            {/* Post Actions */}
            <div className="px-6 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isLiked
                      ? 'text-red-500 bg-red-50 hover:bg-red-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <BookmarkPlus className="w-5 h-5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="btn-secondary">
          Load More Posts
        </button>
      </div>
    </div>
  );

  const renderDiscoverTab = () => (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Discover New Connections</h2>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, university, or major..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <button
            onClick={searchUsers}
            disabled={loading}
            className="btn-primary px-8 py-3"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {users.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Search Results ({users.length})
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => {
              const connectionStatus = getConnectionStatus(user.user_id);
              
              return (
                <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">{user.full_name || 'Anonymous User'}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{user.bio || 'No bio available'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {user.university && (
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span>{user.university}</span>
                      </div>
                    )}
                    {user.major && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span>{user.major}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {user.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{user.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {connectionStatus === 'none' && (
                      <button
                        onClick={() => sendConnectionRequest(user.user_id)}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                    )}
                    {connectionStatus === 'pending' && (
                      <button
                        disabled
                        className="flex-1 bg-gray-100 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Request Sent
                      </button>
                    )}
                    {connectionStatus === 'received' && (
                      <button
                        disabled
                        className="flex-1 bg-yellow-100 text-yellow-700 py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Request Received
                      </button>
                    )}
                    {connectionStatus === 'connected' && (
                      <button
                        disabled
                        className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Connected</span>
                      </button>
                    )}
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <MessageCircle className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && searchQuery && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">No Users Found</h3>
          <p className="text-gray-600">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Initial State */}
      {!searchQuery && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">Start Networking</h3>
          <p className="text-gray-600 mb-6">
            Search for students by name, university, or field of study to start building your network
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <GraduationCap className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h4 className="font-medium text-primary mb-1">Find Classmates</h4>
              <p className="text-sm text-gray-600">Connect with students from your university</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Briefcase className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h4 className="font-medium text-primary mb-1">Career Networking</h4>
              <p className="text-sm text-gray-600">Build professional relationships</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h4 className="font-medium text-primary mb-1">Study Groups</h4>
              <p className="text-sm text-gray-600">Form collaborative learning groups</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderConnectionsTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-2xl font-bold text-primary">{connections.length}</h3>
          <p className="text-gray-600">Total Connections</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-2xl font-bold text-primary">
            {getConnectionsByCategory().university.length}
          </h3>
          <p className="text-gray-600">University Peers</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-2xl font-bold text-primary">
            {getConnectionsByCategory().major.length}
          </h3>
          <p className="text-gray-600">Same Major</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-2xl font-bold text-primary">
            {new Set(connections.map(c => c.connected_user?.university).filter(Boolean)).size}
          </h3>
          <p className="text-gray-600">Universities</p>
        </div>
      </div>

      {/* Connections List */}
      {connections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">No Connections Yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your network by connecting with other students
          </p>
          <button 
            onClick={() => setActiveTab('discover')}
            className="btn-primary"
          >
            Find People to Connect
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-6">
            Your Connections ({connections.length})
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => {
              const user = connection.connected_user;
              if (!user) return null;

              return (
                <div
                  key={connection.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{user.full_name || 'Anonymous User'}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{user.bio || 'No bio available'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {user.university && (
                      <p className="text-sm text-gray-600">🎓 {user.university}</p>
                    )}
                    {user.major && (
                      <p className="text-sm text-gray-600">📚 {user.major}</p>
                    )}
                    {user.graduation_year && (
                      <p className="text-sm text-gray-600">📅 Class of {user.graduation_year}</p>
                    )}
                  </div>

                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {user.skills.slice(0, 3).map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{user.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Connection Date */}
                  <div className="text-xs text-gray-400 mb-4">
                    Connected on {new Date(connection.created_at).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 btn-primary flex items-center justify-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderRequestsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
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
    </div>
  );

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4 flex items-center">
            <Users className="w-8 h-8 mr-3" />
            Professional Network
          </h1>
          <p className="text-gray-600">
            Stay connected, share your journey, and discover opportunities in your professional network
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                activeTab === 'feed'
                  ? 'text-secondary border-b-2 border-secondary bg-secondary/5'
                  : 'text-gray-600 hover:text-secondary'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Feed</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                activeTab === 'discover'
                  ? 'text-secondary border-b-2 border-secondary bg-secondary/5'
                  : 'text-gray-600 hover:text-secondary'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Discover</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                activeTab === 'connections'
                  ? 'text-secondary border-b-2 border-secondary bg-secondary/5'
                  : 'text-gray-600 hover:text-secondary'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>My Network ({connections.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                activeTab === 'requests'
                  ? 'text-secondary border-b-2 border-secondary bg-secondary/5'
                  : 'text-gray-600 hover:text-secondary'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Requests</span>
                {connectionRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {connectionRequests.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'discover' && renderDiscoverTab()}
        {activeTab === 'connections' && renderConnectionsTab()}
        {activeTab === 'requests' && renderRequestsTab()}
      </div>
    </div>
  );
};

export default Network;