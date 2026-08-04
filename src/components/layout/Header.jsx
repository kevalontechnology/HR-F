import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, Key, Building2, Menu, X } from 'lucide-react';
import { Modal } from '../common/Modal';

import logoImg from '../../Kevalon_Technology_Logo_Transparent.png';

export const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout, authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications/my');
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markRead = async (id) => {
    try {
      await authFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(passData)
      });
      if (res.success) {
        setPassMsg('Password reset successfully!');
        setPassData({ currentPassword: '', newPassword: '' });
        setTimeout(() => setShowResetModal(false), 1500);
      } else {
        setPassMsg(res.message || 'Reset failed');
      }
    } catch (err) {
      setPassMsg(err.message);
    }
  };

  return (
    <header className="bg-erp-primary text-white h-14 flex items-center justify-between px-3 sm:px-4 shadow-sm z-40 sticky top-0">
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 hover:bg-white/10 rounded-xs text-white transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Kevalon Technology Logo */}
        <img src={logoImg} alt="Kevalon Technology Logo" className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs" />

        <div>
          <h1 className="font-bold text-xs sm:text-sm md:text-base tracking-wider uppercase leading-tight">
            Kevalon Technology
          </h1>
          <p className="text-[9px] sm:text-[10px] text-gray-200 tracking-widest font-semibold uppercase hidden sm:block">
            Recruitment CRM Enterprise Edition
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:bg-white/10 rounded-xs relative transition"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-erp-primary">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-gray-800 border border-erp-border rounded-xs shadow-xl z-50 overflow-hidden">
              <div className="bg-erp-primary text-white px-3 py-2 text-xs font-semibold uppercase flex items-center justify-between">
                <span>Notification Center</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{unreadCount} Unread</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">No notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={() => markRead(n._id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? 'bg-blue-50/50 font-medium' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-erp-primary">{n.title}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      </div>
                      <p className="text-gray-600 mt-1 text-[11px]">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active User Information */}
        <div className="flex items-center gap-2 border-l border-white/20 pl-2 sm:pl-3">
          <div className="w-7 h-7 bg-white/10 rounded-xs flex items-center justify-center border border-white/20">
            <User size={15} />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold leading-tight">{user?.username}</div>
            <div className="text-[10px] text-gray-200 uppercase font-semibold">
              {user?.role?.name || 'User'}
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <button
          onClick={() => setShowResetModal(true)}
          className="p-1.5 hover:bg-white/10 rounded-xs text-xs flex items-center gap-1 border border-white/20 transition"
          title="Reset Password"
        >
          <Key size={14} />
        </button>

        <button
          onClick={logout}
          className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 sm:px-2.5 rounded-xs text-xs font-bold flex items-center gap-1 transition"
          title="Logout"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Password Reset Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password">
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {passMsg && (
            <div className={`p-2 text-xs rounded ${passMsg.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {passMsg}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={e => setPassData({ ...passData, currentPassword: e.target.value })}
              className="erp-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passData.newPassword}
              onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
              className="erp-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowResetModal(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Update Password</button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
