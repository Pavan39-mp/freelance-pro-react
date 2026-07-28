import re

with open("src/pages/Settings.jsx", "r") as f:
    settings = f.read()

settings = settings.replace("import { User, Bell, Lock, LogOut, Eye, EyeOff } from 'lucide-react';", 
                            "import { User, Bell, Lock, LogOut, Eye, EyeOff, Globe } from 'lucide-react';")

# Tabs
settings = settings.replace(
    """  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true }
  ];""",
"""
  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    ...(user?.role === 'freelancer' ? [{ id: 'public-profile', label: 'Public Profile', icon: Globe }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true }
  ];
"""
)

# States
settings = settings.replace(
    """  // Account State
  const [accountData, setAccountData] = useState({""",
    """  // Public Profile State
  const [publicData, setPublicData] = useState({
    isPublicProfile: user?.isPublicProfile || false,
    services: user?.services || '',
    portfolio: user?.portfolio || '',
    availability: user?.availability || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
    title: user?.title || '',
    location: user?.location || ''
  });

  // Account State
  const [accountData, setAccountData] = useState({"""
)

# Handlers
settings = settings.replace(
    """  const handleAccountSave = async (e) => {""",
    """  const handlePublicProfileSave = async (e) => {
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

  const handleAccountSave = async (e) => {"""
)

with open("src/pages/Settings.jsx", "w") as f:
    f.write(settings)

