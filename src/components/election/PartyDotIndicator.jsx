import React from 'react';

const PartyDotIndicator = ({ color, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    return (
        <span
            className={`rounded-full inline-block ${sizeClasses[size] || sizeClasses.md}`}
            style={{ backgroundColor: color || '#ccc' }}
        />
    );
};

export default PartyDotIndicator;
