import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MobileBottomNav from './MobileBottomNav';
import MobileDrawer from './MobileDrawer';
import FloatingChatButton from '../chatbot/FloatingChatButton';
import AddTaskModal from '../ui/AddTaskModal';

const AppLayout = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
      <div className="print:hidden">
        <Sidebar />
        <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
        <TopNavbar
          onAddNew={() => setIsModalOpen(true)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />
      </div>

      <main className="min-w-0 md:ml-[260px] print:ml-0 pt-[88px] md:pt-24 print:pt-0 px-4 md:px-6 print:px-0 pb-20 md:pb-12 min-h-screen print:min-h-0">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto space-y-8">
          <Outlet />
        </div>
      </main>

      <div className="print:hidden">
        <FloatingChatButton />
        <MobileBottomNav />
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(task) => {
          console.log('New task added:', task);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default AppLayout;
