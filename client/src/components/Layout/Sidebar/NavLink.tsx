import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from '../../Icon';
import { type IconName } from "../../../assets/icons";

interface NavLinkProps {
    to: string;
    icon: IconName;
    children: React.ReactNode;
}

const NavLink = ({ to, icon, children }: NavLinkProps) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center px-6 py-3 text-sm font-medium rounded-md mb-1 ${
            isActive
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            }`}
            aria-current={isActive ? 'page' : undefined}
            >
                <Icon name={icon} className="w-5 h-5 mr-3" />
                {children}
        </Link>
    );
};

export default React.memo(NavLink);

