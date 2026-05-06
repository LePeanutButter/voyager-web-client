import { useState, useEffect } from 'react'
import { useUserProfile } from '../../hooks/useUserProfile'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { User, Mail, Phone, Edit2, Save, X, Shield, Star } from 'lucide-react'
import './ProfilePage.css'

const INTERESTS_OPTIONS = [
  'Adventure', 'Beach', 'Culture', 'Food & Cuisine', 'History',
  'Luxury', 'Nature', 'Nightlife', 'Photography', 'Sports', 'Wellness', 'Wildlife',
]

const ProfilePage = () => {
  const { profile, loading, saving, error, success, save, clearMessages } = useUserProfile()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
    interests: [],
  })

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        interests: Array.isArray(profile.interests) ? profile.interests : [],
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSave = async () => {
    try {
      await save({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        bio: form.bio.trim() || undefined,
        interests: form.interests,
      })
      setEditing(false)
    } catch {
      // error is handled by hook
    }
  }

  const handleCancel = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        interests: Array.isArray(profile.interests) ? profile.interests : [],
      })
    }
    setEditing(false)
    clearMessages()
  }

  if (loading) {
    return (
      <div className="profile-page page-container">
        <div className="profile-grid">
          <div className="profile-sidebar-card">
            <div className="skeleton skeleton-avatar" style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 1rem' }} />
            <SkeletonLoader variant="text" width="60%" />
            <SkeletonLoader variant="text" width="45%" />
          </div>
          <div>
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username
  const initials = ((profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')).toUpperCase() || profile.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="profile-page page-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and travel preferences</p>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={clearMessages} />
      <ErrorBanner variant="success" message={success} onDismiss={clearMessages} />

      <div className="profile-grid">
        {/* Sidebar */}
        <div className="profile-sidebar-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-avatar-badge">
              <Shield size={12} />
            </div>
          </div>
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-username">@{profile.username}</p>

          <div className="profile-meta-list">
            {profile.email && (
              <div className="profile-meta-item">
                <Mail size={15} />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.phoneNumber && (
              <div className="profile-meta-item">
                <Phone size={15} />
                <span>{profile.phoneNumber}</span>
              </div>
            )}
            {profile.role && (
              <div className="profile-meta-item">
                <Star size={15} />
                <span>{profile.role}</span>
              </div>
            )}
          </div>

          {!editing && (
            <button className="btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setEditing(true)}>
              <Edit2 size={15} /> Edit Profile
            </button>
          )}
        </div>

        {/* Main content */}
        <div>
          {editing ? (
            /* Edit form */
            <div className="profile-form-card">
              <div className="profile-form-header">
                <h3>Edit Profile</h3>
                <button className="icon-btn" onClick={handleCancel}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="profile-firstName">First Name</label>
                    <input id="profile-firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-lastName">Last Name</label>
                    <input id="profile-lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profile-phone">Phone Number</label>
                  <input id="profile-phone" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} placeholder="+1 555 000 0000" />
                </div>

                <div className="form-group">
                  <label htmlFor="profile-bio">Bio</label>
                  <textarea id="profile-bio" name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell other travelers about yourself…" />
                </div>

                <div className="form-group">
                  <label>Travel Interests</label>
                  <div className="interests-grid">
                    {INTERESTS_OPTIONS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        className={`interest-chip ${form.interests.includes(interest) ? 'active' : ''}`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button type="button" className="btn-ghost" onClick={handleCancel}>Cancel</button>
                  <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        Saving…
                      </span>
                    ) : (
                      <><Save size={15} /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="profile-view-card">
              <div className="profile-section">
                <h3>Personal Information</h3>
                <div className="profile-fields">
                  {[
                    { label: 'First Name', value: profile.firstName, icon: User },
                    { label: 'Last Name', value: profile.lastName, icon: User },
                    { label: 'Email', value: profile.email, icon: Mail },
                    { label: 'Phone', value: profile.phoneNumber || '—', icon: Phone },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="profile-field">
                      <span className="profile-field-label">
                        <Icon size={14} /> {label}
                      </span>
                      <span className="profile-field-value">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {profile.bio && (
                <div className="profile-section">
                  <h3>Bio</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>{profile.bio}</p>
                </div>
              )}

              {Array.isArray(profile.interests) && profile.interests.length > 0 && (
                <div className="profile-section">
                  <h3>Travel Interests</h3>
                  <div className="interests-display">
                    {profile.interests.map((i) => (
                      <span key={i} className="interest-chip active">{i}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
