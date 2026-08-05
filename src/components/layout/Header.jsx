import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, Key, Building2, Menu, X, Volume2, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import logoImg from '../../Kevalon_Technology_Logo_Transparent.png';
import { requestWebNotificationPermission, triggerDesktopNotification } from '../../utils/webNotification';

export const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout, authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [webNotifPermission, setWebNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState('');

  const seenNotifIds = useRef(new Set());

  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications/my');
      if (res.success) {
        const notifList = res.data || [];
        setNotifications(notifList);
        setUnreadCount(res.unreadCount || 0);

        // Check for new unread notifications to trigger OS-level Web Push Notification
        notifList.forEach(notif => {
          if (!notif.isRead && !seenNotifIds.current.has(notif._id)) {
            seenNotifIds.current.add(notif._id);
            triggerDesktopNotification(
              notif.title || '🔔 New Kevalon CRM Alert',
              notif.message || 'You have a new update in your workstation queue.',
              notif._id
            );
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 6000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleEnableWebNotifications = async () => {
    const granted = await requestWebNotificationPermission();
    if (granted) {
      setWebNotifPermission('granted');
    } else {
      setWebNotifPermission(Notification.permission);
    }
  };

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
    <header className="bg-erp-primary text-white h-14 flex items-center justify-between gap-2 px-3 sm:px-4 shadow-sm z-40 sticky top-0 overflow-hidden">
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden shrink-0 p-1.5 hover:bg-white/10 rounded-xs text-white transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Kevalon Technology Logo */}
        <img src={logoImg} alt="Kevalon Technology Logo" className="h-8 w-auto shrink-0 object-contain drop-shadow-xs sm:h-9" />

        <div className="min-w-0">
          <h1 className="truncate font-bold text-[10px] sm:text-sm md:text-base tracking-wider uppercase leading-tight">
            Kevalon Technology
          </h1>
          <p className="hidden text-[9px] text-gray-200 tracking-widest font-semibold uppercase sm:block sm:text-[10px]">
            Recruitment CRM Enterprise Edition
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Enable Desktop Web Notifications Button if not granted */}
        {webNotifPermission !== 'granted' && (
          <button
            onClick={handleEnableWebNotifications}
            className="hidden sm:flex items-center gap-1 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 text-[11px] font-bold px-2.5 py-1 rounded-xs transition"
            title="Enable Desktop Web Notifications"
          >
            <Bell size={12} className="animate-bounce" /> Enable Web Alerts
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 transition hover:bg-white/10 rounded-xs"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-erp-primary bg-red-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-xs border border-erp-border bg-white text-gray-800 shadow-xl sm:w-80">
              <div className="flex items-center justify-between gap-2 bg-erp-primary px-3 py-2 text-xs font-semibold uppercase text-white">
                <span className="truncate">Notification Center</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {webNotifPermission !== 'granted' && (
                    <button
                      onClick={handleEnableWebNotifications}
                      className="flex items-center gap-0.5 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-950"
                    >
                      <Bell size={10} /> Enable Web Alerts
                    </button>
                  )}
                  <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">{unreadCount} Unread</span>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">No notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markRead(n._id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-gray-50 transition ${
                        !n.isRead ? 'bg-blue-50/60 font-semibold' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-erp-primary">{n.title}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-1.5 border-l border-white/20 pl-1.5 text-xs sm:gap-2 sm:pl-3">
          <div className="hidden text-right sm:block">
            <div className="truncate font-bold leading-none">{user?.fullName || user?.username}</div>
            <div className="mt-0.5 text-[10px] font-semibold text-gray-300">
              {user?.role?.name || 'User'}
            </div>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="shrink-0 p-1.5 hover:bg-white/10 rounded-xs transition"
            title="Reset Password"
          >
            <Key size={16} />
          </button>

          <button
            onClick={logout}
            className="shrink-0 p-1.5 hover:bg-white/10 rounded-xs text-red-300 hover:text-red-100 transition"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password">
        <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
          {passMsg && (
            <div className={`p-2 rounded font-semibold ${passMsg.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {passMsg}
            </div>
          )}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              className="erp-input"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              className="erp-input"
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setShowResetModal(false)} className="btn-erp-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-erp-primary">
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
