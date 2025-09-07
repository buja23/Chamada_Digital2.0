import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-72">
      <Navigation />
      <main>
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};