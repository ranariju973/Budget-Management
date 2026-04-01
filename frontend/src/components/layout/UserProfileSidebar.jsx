import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiX, FiUser, FiTrash2, FiSave, FiAlertTriangle, FiLogOut, FiPieChart, FiSun, FiMoon } from 'react-icons/fi';

const UserProfileSidebar = ({ isOpen, onClose, setActiveSection }) => {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorName, setErrorName] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if user data changes
  useState(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setErrorName('Name cannot be empty.');
      return;
    }
    if (name.trim() === user?.name) {
      return; // No change
    }

    try {
      setIsSavingName(true);
      setErrorName('');
      await updateProfile(name);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setErrorName(err.response?.data?.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      // Wait a moment for dramatic effect and ensuring the request fires
      await deleteAccount(); 
      // Account deleted -> AuthContext logout will redirect to login page
    } catch (err) {
      console.error('Delete fail:', err);
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`relative w-full max-w-[360px] h-full shadow-2xl flex flex-col slide-in-right rounded-l-2xl ${
          darkMode ? 'bg-[rgba(25,25,25,0.95)]' : 'bg-[rgba(250,250,250,0.95)]'
        }`}
        style={{
          borderLeft: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/10">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <FiUser /> Profile Settings
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-8">
          
          {/* Email Info (Read-only) */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
              Email Address
            </label>
            <div 
              className="px-4 py-3 rounded-xl text-[14px] font-medium opacity-70"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              {user?.email}
            </div>
          </div>

          {/* Edit Name */}
          <div className="space-y-3">
            <label className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
              Display Name
            </label>
            <div className="flex flex-col gap-2">
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-[15px] font-medium rounded-xl outline-none transition-all placeholder:opacity-50"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  color: 'var(--color-text)', 
                  border: '1px solid var(--color-border)',
                }}
                placeholder="Your full name"
                maxLength={50}
              />
              {errorName && <div className="text-red-500 text-sm">{errorName}</div>}
              
              <button
                onClick={handleUpdateName}
                disabled={isSavingName || name.trim() === user?.name || !name.trim()}
                className={`w-full py-3 mt-1 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  (name.trim() !== user?.name && name.trim()) 
                    ? 'hover:brightness-110 active:scale-[0.98]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
              >
                {isSavingName ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <>Saved!</>
                ) : (
                  <><FiSave size={18} /> Save Changes</>
                )}
              </button>
            </div>
          </div>

          <hr className="border-black/5 dark:border-white/5" />

          {/* Navigation & Preferences */}
          <div className="space-y-2">
             <label className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
               Preferences
             </label>
             {setActiveSection && (
               <button 
                  onClick={() => { setActiveSection('charts'); onClose(); }} 
                  className="w-full flex items-center justify-between px-4 py-3 text-[15px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors mb-2" 
                  style={{ color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                >
                  Spend Analysis <FiPieChart size={18} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
             )}
             <button 
                onClick={toggleTheme} 
                className="w-full flex items-center justify-between px-4 py-3 text-[15px] font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors" 
                style={{ color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'} 
                {darkMode ? <FiSun size={18} style={{ color: 'var(--color-text-secondary)' }} /> : <FiMoon size={18} style={{ color: 'var(--color-text-secondary)' }} />}
              </button>
          </div>

          <hr className="border-black/5 dark:border-white/5" />

          {/* Danger Zone */}
          <div className="space-y-4 pt-2">
             <label className="text-[13px] font-semibold tracking-wide flex items-center gap-1.5 uppercase text-red-500">
               <FiAlertTriangle /> Danger Zone
             </label>
             
             {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 rounded-xl font-bold text-red-500 flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500/10 active:bg-red-500/20 transition-all tap-effect"
                >
                  <FiTrash2 size={18} /> Delete Account
                </button>
             ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-red-500 text-sm font-semibold text-center">
                    Are you incredibly sure? All your data will be permanently wiped out. This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex justify-center items-center tap-effect"
                    >
                      {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Yes, Delete!'}
                    </button>
                  </div>
                </div>
             )}
          </div>
        </div>
        
        {/* Footer Logout */}
        <div className="p-5 border-t border-black/5 dark:border-white/10 mt-auto">
           <button 
             onClick={logout}
             className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-[0.98]"
             style={{ color: 'var(--color-text)' }}
           >
             <FiLogOut size={18} /> Sign Out
           </button>
        </div>
      </div>

    </div>
  );
};

export default UserProfileSidebar;
