import React from "react";

interface OverlayProps {
    onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ onClose }) => (
    <div
        className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 transition-opacity duration-200"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
    />
);

export default React.memo(Overlay)