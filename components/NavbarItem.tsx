import React from "react";

interface NavbarItemProps {
    label: string;
    onClick?: () => void;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ label, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="text-white text-sm font-semibold cursor-pointer hover:underline whitespace-nowrap"
        >
            {label}
        </div>
    );
};

export default NavbarItem;
