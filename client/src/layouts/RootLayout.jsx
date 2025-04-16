import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import React from 'react'
import { Outlet } from 'react-router-dom'

function RootLayout() {
    return (
        <div className='flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 min-h-screen'>
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="w-full md:ml-64 flex flex-col">
                <Navbar />
                <main className="flex-grow p-2 md:p-6 bg-gray-50 dark:bg-gray-900 pt-4 md:pt-6">
                    <Outlet />
                </main>

                {/* Footer - optional */}
                <footer className="py-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 md:hidden">
                    Created with ❤️
                </footer>
            </div>
        </div>
    )
}

export default RootLayout
