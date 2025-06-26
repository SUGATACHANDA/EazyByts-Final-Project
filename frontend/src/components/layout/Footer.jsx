import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t mt-12">
            <div className="container mx-auto py-6 px-4 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Eventive Inc. All Rights Reserved.</p>
                <p className="mt-1">Built with React, Node.js, and a dash of ☕</p>
            </div>
        </footer>
    );
};

export default Footer;