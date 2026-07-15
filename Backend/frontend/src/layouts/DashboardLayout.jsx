import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

/* ---------------------------------------------------
   DashboardLayout – wraps all authenticated pages
   with the sidebar + top navbar shell.
   --------------------------------------------------- */

export default function DashboardLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area (offset for the fixed sidebar) */}
            <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopNavbar />
                <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
