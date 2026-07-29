import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import api from '../../services/api';

const SearchBar = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [results, setResults] = useState({ clients: [], projects: [], tasks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setResults({ clients: [], projects: [], tasks: [] });
      setIsSearchOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/search', { params: { q: searchQuery } });
        if (res && res.success && res.data) {
          setResults({
            clients: res.data.clients || [],
            projects: res.data.projects || [],
            tasks: res.data.tasks || []
          });
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Error fetching search results:', err.message || err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const hasResults = results.clients.length > 0 || results.projects.length > 0 || results.tasks.length > 0;

  return (
    <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 pointer-events-none" />
      <input
        id="search-input"
        className="w-full bg-surface-container-high/50 border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-1 focus:ring-primary/50 text-on-surface"
        placeholder="Search projects, tasks, or clients..."
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setIsSearchOpen(e.target.value.length > 0);
        }}
        onFocus={() => setIsSearchOpen(searchQuery.length > 0)}
      />

      {/* Search Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-h-[400px] overflow-y-auto bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-50 overflow-hidden custom-scrollbar">
          <div className="p-2">
            {isLoading ? (
              <p className="px-3 py-3 text-body-sm text-on-surface-variant text-center">Searching...</p>
            ) : !hasResults ? (
              <p className="px-3 py-3 text-body-sm text-on-surface-variant text-center">No results found for "{searchQuery}"</p>
            ) : (
              <>
                {results.clients.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-1 text-[10px] text-on-surface-variant font-label-caps">Clients</p>
                    {results.clients.slice(0, 3).map(client => (
                      <button key={client.id} onClick={() => { navigate('/freelancer/clients'); setIsSearchOpen(false); }} className="w-full text-left px-3 py-2 text-body-sm text-on-surface hover:bg-surface-variant/30 rounded-lg transition-colors flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        <span className="truncate">{client.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.projects.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-1 text-[10px] text-on-surface-variant font-label-caps">Projects</p>
                    {results.projects.slice(0, 3).map(project => (
                      <button key={project.id} onClick={() => { navigate(user?.role === 'client' ? '/client/projects' : '/freelancer/projects'); setIsSearchOpen(false); }} className="w-full text-left px-3 py-2 text-body-sm text-on-surface hover:bg-surface-variant/30 rounded-lg transition-colors flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="truncate">
                          {project.title || project.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {results.tasks.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-1 text-[10px] text-on-surface-variant font-label-caps">Tasks</p>
                    {results.tasks.slice(0, 3).map(task => (
                      <button key={task.id} onClick={() => { navigate('/freelancer/tasks'); setIsSearchOpen(false); }} className="w-full text-left px-3 py-2 text-body-sm text-on-surface hover:bg-surface-variant/30 rounded-lg transition-colors flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="truncate">{task.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
