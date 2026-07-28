import re

with open("src/pages/Settings.jsx", "r") as f:
    settings = f.read()

public_jsx = """
            {activeTab === 'public-profile' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6 flex justify-between items-center pb-4 border-b border-outline-variant/10">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Public Profile</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-body-sm font-semibold text-on-surface-variant">Profile Visibility: {publicData.isPublicProfile ? 'Public' : 'Private'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={publicData.isPublicProfile}
                        onChange={(e) => setPublicData({ ...publicData, isPublicProfile: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <form onSubmit={handlePublicProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface ml-1">Professional Headline</label>
                      <input
                        type="text"
                        value={publicData.title}
                        onChange={(e) => setPublicData({ ...publicData, title: e.target.value })}
                        className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                        placeholder="e.g. Senior Full-Stack Developer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface ml-1">Location</label>
                      <input
                        type="text"
                        value={publicData.location}
                        onChange={(e) => setPublicData({ ...publicData, location: e.target.value })}
                        className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                        placeholder="e.g. New York, USA or Remote"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface ml-1">Years of Experience</label>
                      <input
                        type="text"
                        value={publicData.experience}
                        onChange={(e) => setPublicData({ ...publicData, experience: e.target.value })}
                        className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                        placeholder="e.g. 8+ Years"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface ml-1">Availability</label>
                      <input
                        type="text"
                        value={publicData.availability}
                        onChange={(e) => setPublicData({ ...publicData, availability: e.target.value })}
                        className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                        placeholder="e.g. 20 hrs/week"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-body-sm font-semibold text-on-surface ml-1">Services</label>
                    <input
                      type="text"
                      value={publicData.services}
                      onChange={(e) => setPublicData({ ...publicData, services: e.target.value })}
                      className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                      placeholder="e.g. Web Development, UI/UX Design, Strategy"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-body-sm font-semibold text-on-surface ml-1">Portfolio Website</label>
                    <input
                      type="url"
                      value={publicData.portfolio}
                      onChange={(e) => setPublicData({ ...publicData, portfolio: e.target.value })}
                      className="w-full h-12 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
                      placeholder="https://myportfolio.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-body-sm font-semibold text-on-surface ml-1">Bio / About Me</label>
                    <textarea
                      value={publicData.bio}
                      onChange={(e) => setPublicData({ ...publicData, bio: e.target.value })}
                      className="w-full h-32 bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md resize-none"
                      placeholder="Tell clients about your background and expertise..."
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-on-primary font-label-lg font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Save Public Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
"""

if "{activeTab === 'public-profile'" not in settings:
    settings = settings.replace(
        "{activeTab === 'notifications' && (",
        f"{public_jsx}\n            {{activeTab === 'notifications' && ("
    )

with open("src/pages/Settings.jsx", "w") as f:
    f.write(settings)

