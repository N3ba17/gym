import React from 'react';

/**
 * Modern App Logo Component
 * Fixed: Removed background and fixed width constraints for collapsed state.
 */

export default function AppLogo({ className }: { className?: string }) {
    const cloudIconUrl = "https://cdn-icons-png.flaticon.com/512/4558/4558848.png";

    return (
        <div className="flex size-10 items-center justify-center">
            
                <img 
                    src={cloudIconUrl} 
                    alt="Logo"
                    className="size-0 transition-transform duration-500 group-hover:rotate-12"
                   
                />
            
        </div>
    );
}