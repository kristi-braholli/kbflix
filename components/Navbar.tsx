import React, { useState, useRef, useEffect } from "react";
import NavbarItem from "@/components/NavbarItem";
import { BsSearch } from "react-icons/bs";
import { HiMenu, HiX } from "react-icons/hi";

interface NavbarProps {
    categories: { id: number; key: string; name: string }[];
    selectedCategory: string | null;
    onSelectCategory: (categoryId: string | null) => void;
    onSearch: (query: string) => void;
    onType: (query: string) => void;
    suggestions: string[];
}

function normalize(str: string) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

const Navbar: React.FC<NavbarProps> = ({
                                           categories,
                                           selectedCategory,
                                           onSelectCategory,
                                           onSearch,
                                           onType,
                                           suggestions,
                                       }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    const handleCategorySelect = (key: string) => {
        onSelectCategory(key);
        setShowDropdown(false);
        setShowMobileMenu(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (query: string) => {
        if (!query.trim()) return;

        onSearch(query.trim());
        setSearchQuery("");
        onType("");
        setShowSearch(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <nav className="w-full fixed top-0 z-50 bg-black/90 backdrop-blur-md">
            <div className="px-4 md:px-8 lg:px-16 py-3 md:py-4 flex items-center justify-between">
                {/* Logo */}
                <img
                    className="h-5 sm:h-6 md:h-7"
                    src="/images/logo.png"
                    alt="logo"
                />

                {/* Desktop Navigation */}
                <div className="hidden md:flex ml-8 gap-6 lg:gap-8 relative">
                    <NavbarItem
                        label="Home"
                        onClick={() => {
                            onSelectCategory(null);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    />
                    <NavbarItem
                        label="Categories"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />

                    {/* Desktop Dropdown */}
                    {showDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 mt-2 bg-black text-white shadow-lg border border-zinc-700 rounded-md w-52 max-h-96 overflow-y-auto z-50"
                        >
                            {categories.map((cat) => (
                                <p
                                    key={cat.key}
                                    className={`px-4 py-2 cursor-pointer hover:bg-zinc-700 ${
                                        selectedCategory === cat.key
                                            ? "bg-zinc-800 font-semibold"
                                            : ""
                                    }`}
                                    onClick={() => handleCategorySelect(cat.key)}
                                >
                                    {cat.name}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Search */}
                <div className="hidden md:block ml-auto relative" ref={searchWrapperRef}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearchSubmit(searchQuery);
                        }}
                        className="flex items-center border border-zinc-700 rounded-md overflow-hidden"
                    >
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="bg-black text-white px-3 py-1.5 text-sm focus:outline-none w-48 lg:w-64"
                            value={searchQuery}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchQuery(value);

                                if (value.length >= 3) {
                                    onType(value.toLowerCase());
                                } else {
                                    onType("");
                                }
                            }}
                        />
                        <button
                            type="submit"
                            className="px-3 py-1.5 text-white bg-red-600 hover:bg-red-700"
                        >
                            <BsSearch size={16} />
                        </button>
                    </form>

                    {/* Desktop Suggestions */}
                    {suggestions.length > 0 && searchQuery && (
                        <div className="absolute bg-black text-white mt-1 rounded-md w-full shadow-lg z-50 max-h-60 overflow-y-auto border border-zinc-700">
                            {suggestions.map((movie) => (
                                <p
                                    key={movie}
                                    className="px-4 py-2 cursor-pointer hover:bg-zinc-700 text-sm"
                                    onClick={() => handleSearchSubmit(movie)}
                                >
                                    {movie}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Controls */}
                <div className="flex md:hidden items-center gap-3">
                    {/* Mobile Search Icon */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="text-white p-2 hover:bg-zinc-800 rounded-md"
                    >
                        <BsSearch size={20} />
                    </button>

                    {/* Mobile Menu Icon */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="text-white p-2 hover:bg-zinc-800 rounded-md"
                    >
                        {showMobileMenu ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearch && (
                <div className="md:hidden px-4 pb-3 border-t border-zinc-800">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearchSubmit(searchQuery);
                        }}
                        className="flex items-center border border-zinc-700 rounded-md overflow-hidden mt-3"
                    >
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="bg-black text-white px-3 py-2 text-sm focus:outline-none flex-1"
                            value={searchQuery}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchQuery(value);

                                if (value.length >= 3) {
                                    onType(value.toLowerCase());
                                } else {
                                    onType("");
                                }
                            }}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700"
                        >
                            <BsSearch size={18} />
                        </button>
                    </form>

                    {/* Mobile Suggestions */}
                    {suggestions.length > 0 && searchQuery && (
                        <div className="bg-zinc-900 text-white mt-2 rounded-md shadow-lg max-h-48 overflow-y-auto border border-zinc-700">
                            {suggestions.map((movie) => (
                                <p
                                    key={movie}
                                    className="px-4 py-2 cursor-pointer hover:bg-zinc-700 text-sm"
                                    onClick={() => handleSearchSubmit(movie)}
                                >
                                    {movie}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="md:hidden bg-black border-t border-zinc-800">
                    <div className="px-4 py-2">
                        <p
                            className="text-white py-3 cursor-pointer hover:bg-zinc-800 rounded-md px-3"
                            onClick={() => {
                                onSelectCategory(null);
                                setShowMobileMenu(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        >
                            Home
                        </p>
                        <p className="text-white py-3 px-3 font-semibold text-sm text-zinc-400">
                            Categories
                        </p>
                        <div className="max-h-64 overflow-y-auto">
                            {categories.map((cat) => (
                                <p
                                    key={cat.key}
                                    className={`text-white py-2 px-6 cursor-pointer hover:bg-zinc-800 rounded-md text-sm ${
                                        selectedCategory === cat.key
                                            ? "bg-zinc-800 font-semibold"
                                            : ""
                                    }`}
                                    onClick={() => handleCategorySelect(cat.key)}
                                >
                                    {cat.name}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;