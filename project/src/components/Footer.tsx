import React from 'react';
import { GraduationCap, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-secondary to-primary p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">T-Wenza</span>
            </div>
            <p className="text-gray-400">
              Revolutionizing education through AI-powered personalized learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-secondary transition-colors">Features</a></li>
              <li><a href="#opportunities" className="text-gray-400 hover:text-secondary transition-colors">Opportunities</a></li>
              <li><a href="#community" className="text-gray-400 hover:text-secondary transition-colors">Community</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-secondary transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-secondary transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-secondary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-secondary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-secondary transition-colors">Career Guide</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and opportunities.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-secondary"
              />
              <button className="px-4 py-2 bg-secondary text-white rounded-r-lg hover:bg-secondary/90 transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {currentYear} T-Wenza. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;