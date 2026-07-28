import re

with open("src/pages/Settings.jsx", "r") as f:
    settings = f.read()

# Add Globe icon
settings = settings.replace("import { User, Bell, Lock, LogOut, Eye, EyeOff } from 'lucide-react';", 
                            "import { User, Bell, Lock, LogOut, Eye, EyeOff, Globe } from 'lucide-react';")

# Add public-profile tab
settings = settings.replace(
    "{ id: 'account', label: 'Account', icon: User },",
    "{ id: 'account', label: 'Account', icon: User },\n    { id: 'public-profile', label: 'Public Profile', icon: Globe },"
)

# Add Public Profile state init
init_state = """  const [publicData, setPublicData] = useState({
    isPublicProfile: user?.isPublicProfile || false,
    services: user?.services || '',
    portfolio: user?.portfolio || '',
    availability: user?.availability || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
    title: user?.title || '',
    location: user?.location || ''
  });"""
  
if "const [publicData, setPublicData]" not in settings:
    settings = settings.replace(
        "const [accountData, setAccountData] = useState({",
        f"{init_state}\n\n  const [accountData, setAccountData] = useState({",
    )

# Add save handler for public profile
public_save = """
  const handlePublicProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUser(publicData);
      if (res.success) {
        toast.success("Public Profile updated successfully");
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };
"""
settings = settings.replace(
    "const handleAccountSave = async (e) => {",
    f"{public_save}\n  const handleAccountSave = async (e) => {",
)

# Build the tab content
public_tab_content = """
        {activeTab === 'public-profile' && (
          <div className="space-y-6 animate-fade-in flex-1">
            <Card className="p-8">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="font-title-lg font-bold text-on-surface mb-2">Public Profile</h3>
                  <p className="text-body-sm text-on-surface-variant">Manage how clients see your profile publicly.</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`text-label-lg font-bold ${publicData.isPublicProfile ? 'text-primary' : 'text-on-surface-variant'}`}>{publicData.isPublicProfile ? 'Public' : 'Private'}</span>
                   <button 
                     type="button"
                     onClick={() => setPublicData({ ...publicData, isPublicProfile: !publicData.isPublicProfile })}
                     className={`w-12 h-6 rounded-full p-1 transition-colors ${publicData.isPublicProfile ? 'bg-primary' : 'bg-surface-variant'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-surface transition-transform duration-300 ${publicData.isPublicProfile ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
              </div>

              <form onSubmit={handlePublicProfileSave} className="space-y-6">
                <div>
                    <label className="text-body-sm font-medium text-on-surface block mb-2">Professional Headline</label>
                    <input
                      type="text"
                      value={publicData.title}
                      onChange={(e) => setPublicData({ ...publicData, title: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="text-body-sm font-medium text-on-surface block mb-2">Location</label>
                      <input
                        type="text"
                        value={publicData.location}
                        onChange={(e) => setPublicData({ ...publicData, location: e.target.value })}
                        className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. Remote, USA"
                      />
                  </div>
                  <div>
                      <label className="text-body-sm font-medium text-on-surface block mb-2">Availability</label>
                      <input
                        type="text"
                        value={publicData.availability}
                        onChange={(e) => setPublicData({ ...publicData, availability: e.target.value })}
                        className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. 20 hrs/week"
                      />
                  </div>
                </div>

                <div>
                    <label className="text-body-sm font-medium text-on-surface block mb-2">Bio / About</label>
                    <textarea
                      value={publicData.bio}
                      onChange={(e) => setPublicData({ ...publicData, bio: e.target.value })}
                      className="w-full h-32 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Tell clients about yourself..."
                    />
                </div>
                
                <div>
                    <label className="text-body-sm font-medium text-on-surface block mb-2">Primary Services Provided (comma separated)</label>
                    <input
                      type="text"
                      value={publicData.services}
                      onChange={(e) => setPublicData({ ...publicData, services: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      placeholder="e.g. Web Development, UI/UX Design"
                    />
                </div>
                
                <div>
                    <label className="text-body-sm font-medium text-on-surface block mb-2">Years of Experience</label>
                    <input
                      type="text"
                      value={publicData.experience}
                      onChange={(e) => setPublicData({ ...publicData, experience: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      placeholder="e.g. 5+ Years"
                    />
                </div>
                
                <div>
                    <label className="text-body-sm font-medium text-on-surface block mb-2">Portfolio URL</label>
                    <input
                      type="text"
                      value={publicData.portfolio}
                      onChange={(e) => setPublicData({ ...publicData, portfolio: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      placeholder="https://yourportfolio.com"
                    />
                </div>

                <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-lg hover:opacity-90 transition-opacity"
                  >
                    Save Public Profile
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
"""

if "{activeTab === 'public-profile'" not in settings:
    settings = settings.replace(
        "{activeTab === 'account' && (",
        f"{public_tab_content}\n\n        {{activeTab === 'account' && ("
    )

# Only show public profile tab if user is freelancer
# Wait we can just filter the tabs array dynamically
settings = settings.replace(
    "const tabs = [",
    """const allTabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'public-profile', label: 'Public Profile', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true }
  ];
  const tabs = allTabs.filter(tab => tab.id !== 'public-profile' || user?.role === 'freelancer');

  // fallback to avoid warnings""",
)
settings = settings.replace(
    "{ id: 'account', label: 'Account', icon: User },\n    { id: 'public-profile', label: 'Public Profile', icon: Globe },\n    { id: 'notifications', label: 'Notifications', icon: Bell },\n    { id: 'security', label: 'Security', icon: Lock },\n    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true }\n  ];",
    ""
)

with open("src/pages/Settings.jsx", "w") as f:
    f.write(settings)

