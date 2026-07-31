import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { UserProvider } from './context/UserContext';
import { ClientProvider } from './context/ClientContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { TimeTrackingProvider } from './context/TimeTrackingContext';
import { DashboardProvider } from './context/DashboardContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { ActivityProvider } from './context/ActivityContext';
import { MeetingProvider } from './context/MeetingContext';
import { NoteProvider } from './context/NoteContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Invoices from './pages/Invoices';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerProfile from './pages/FreelancerProfile';
import RoleSelection from './pages/RoleSelection';
import ClientLayout from './components/layout/client/ClientLayout';

// New Client Page Stubs
import FindFreelancers from './pages/client/FindFreelancers';
// ClientProjects superseded by generic Projects.jsx
import ProjectRequests from './pages/client/ProjectRequests';
import ClientMessages from './pages/client/ClientMessages';
import ClientNotifications from './pages/client/ClientNotifications';
import Messages from './pages/Messages';
import ClientProfile from './pages/client/ClientProfile';
import ClientMeetings from './pages/client/ClientMeetings';
import CreateProjectRequest from './pages/client/CreateProjectRequest';
import AvailableProjects from './pages/freelancer/AvailableProjects';
import ProjectProposals from './pages/client/ProjectProposals';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="text-center">
      <h1 className="font-headline-md text-2xl font-bold text-on-surface">Page not found</h1>
      <p className="mt-2 text-body-sm text-on-surface-variant">The page you requested does not exist.</p>
    </div>
  </div>
);

const App = () => {
  return (
    <UserProvider>
      <NotificationProvider>
        <ActivityProvider>
          <TimeTrackingProvider>
            <TaskProvider>
              <ProjectProvider>
                <ClientProvider>
                  <DashboardProvider>
                    <MeetingProvider>
                      <NoteProvider>
                        <InvoiceProvider>
                          <AnalyticsProvider>
                            <ThemeProvider>
                              <SettingsProvider>
                                <BrowserRouter>
                                  <Toaster position="top-right" toastOptions={{ style: { background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline-variant)' } }} />
                                  <Routes>
                                    <Route path="/" element={<RoleSelection />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                                    <Route element={<ProtectedRoute allowedRoles={['client']}><ClientLayout /></ProtectedRoute>}>
                                      <Route path="/client-dashboard" element={<ClientDashboard />} />
                                      <Route path="/client/find-freelancers" element={<FindFreelancers />} />
                                      <Route path="/client/projects" element={<Projects />} />
                                      <Route path="/client/invoices" element={<Invoices />} />
                                      <Route path="/client/project-requests" element={<ProjectRequests />} />
                                      <Route path="/client/project-proposals" element={<ProjectProposals />} />
                                      <Route path="/client/create-project-request" element={<CreateProjectRequest />} />
                                      <Route path="/client/messages" element={<ClientMessages />} />
                                      <Route path="/client/profile" element={<ClientProfile />} />
                                      <Route path="/client/notifications" element={<ClientNotifications />} />
                                      <Route path="/client/meetings" element={<ClientMeetings />} />
                                      <Route path="/client/settings" element={<Settings />} />
                                      {/* Maps the isolated client view resolving router collisions */}
                                      <Route path="/client/freelancer/:id" element={<FreelancerProfile />} />
                                    </Route>

                                    <Route element={<ProtectedRoute allowedRoles={['freelancer']}><AppLayout /></ProtectedRoute>}>
                                      <Route path="/freelancer/dashboard" element={<Dashboard />} />
                                      <Route path="/freelancer/profile/:id" element={<FreelancerProfile />} />
                                      <Route path="/freelancer/clients" element={<Clients />} />
                                      <Route path="/freelancer/projects" element={<Projects />} />
                                      <Route path="/freelancer/available-projects" element={<AvailableProjects />} />
                                      <Route path="/freelancer/tasks" element={<Tasks />} />
                                      <Route path="/freelancer/project-requests" element={<ProjectRequests />} />
                                      <Route path="/freelancer/messages" element={<Messages />} />
                                      <Route path="/freelancer/notes" element={<Notes />} />
                                      <Route path="/freelancer/invoices" element={<Invoices />} />
                                      <Route path="/freelancer/analytics" element={<Analytics />} />
                                      <Route path="/freelancer/profile" element={<Profile />} />
                                      <Route path="/freelancer/notifications" element={<Notifications />} />
                                      <Route path="/freelancer/settings" element={<Settings />} />
                                    </Route>

                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                </BrowserRouter>
                              </SettingsProvider>
                            </ThemeProvider>
                          </AnalyticsProvider>
                        </InvoiceProvider>
                      </NoteProvider>
                    </MeetingProvider>
                  </DashboardProvider>
                </ClientProvider>
              </ProjectProvider>
            </TaskProvider>
          </TimeTrackingProvider>
        </ActivityProvider>
      </NotificationProvider>
    </UserProvider>
  );
};

export default App;
