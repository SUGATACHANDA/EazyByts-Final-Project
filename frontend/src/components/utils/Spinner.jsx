import React from 'react';

const Spinner = () => {
    return (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        </div>
    );
};

export default Spinner;