import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import ClientTopNavbar from './ClientTopNavbar';
import ClientMobileBottomNav from './ClientMobileBottomNav';
import ClientMobileDrawer from './ClientMobileDrawer';
import FloatingChatButton from '../../chatbot/FloatingChatButton';

const ClientLayout = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      <div className="print:hidden">
        <ClientSidebar />
        <ClientMobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
        <ClientTopNavbar
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />
      </div>

      <main className="md:ml-[260px] print:ml-0 pt-[88px] md:pt-24 print:pt-0 px-4 md:px-6 print:px-0 pb-20 md:pb-12 min-h-screen print:min-h-0">
        <div className="max-w-[1440px] mx-auto space-y-8">
          <Outlet />
        </div>
      </main>

      <div className="print:hidden">
        <FloatingChatButton />
        <ClientMobileBottomNav />
      </div>
    </div>
  );
};

export default ClientLayout;
