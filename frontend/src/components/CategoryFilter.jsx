import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { NavLink } from "react-router-dom";

const CategoryFilter = () => {
    const { selectedCategory, setSelectedCategory } = useContext(AppContext);

    const categories = [
        { id: 'all', label: 'All Categories', icon: '�', gradient: 'from-purple-400 to-pink-400' },
        { id: 'Electronics', label: 'Electronics', icon: '📱', gradient: 'from-blue-400 to-cyan-400' },
        { id: 'Home & Garden', label: 'Home & Garden', icon: '🏡', gradient: 'from-green-400 to-emerald-400' },
        { id: 'Fashion', label: 'Fashion', icon: '👗', gradient: 'from-pink-400 to-rose-400' },
        { id: 'Others', label: 'Others', icon: '🎨', gradient: 'from-yellow-400 to-orange-400' }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100 overflow-hidden relative">
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(5deg);
                    }
                }
                @keyframes shimmer-bg {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }
                @keyframes pulse-border {
                    0%, 100% {
                        border-color: rgba(124, 58, 237, 0.3);
                        box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.2);
                    }
                    50% {
                        border-color: rgba(124, 58, 237, 0.6);
                        box-shadow: 0 0 0 8px rgba(124, 58, 237, 0);
                    }
                }
                .category-card {
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                }
                .category-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.4s;
                    pointer-events: none;
                }
                .category-card:hover::before {
                    opacity: 1;
                }
                .category-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 12px 24px rgba(124, 58, 237, 0.15);
                }
                .category-card.active {
                    animation: pulse-border 2s ease-in-out infinite;
                }
                .category-card .icon-wrapper {
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .category-card:hover .icon-wrapper {
                    transform: scale(1.2) rotate(10deg);
                    animation: float 2s ease-in-out infinite;
                }
                .category-card.active .icon-wrapper {
                    animation: float 3s ease-in-out infinite;
                }
                .gradient-overlay {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity 0.4s;
                    pointer-events: none;
                }
                .category-card:hover .gradient-overlay,
                .category-card.active .gradient-overlay {
                    opacity: 0.1;
                }
                .background-pattern {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle at center, rgba(124, 58, 237, 0.05) 0%, transparent 70%);
                    pointer-events: none;
                }
            `}</style>
            
            <div className="background-pattern"></div>
            
            <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Browse Categories
                    </span>
                    <svg className="w-6 h-6 ml-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <NavLink
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            to={'/upcoming'}
                            className={`category-card p-6 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                                selectedCategory === cat.id
                                    ? 'active border-purple-600 bg-gradient-to-br from-purple-50 to-indigo-50'
                                    : 'border-gray-200 hover:border-purple-300 bg-white'
                            }`}
                        >
                            <div className={`gradient-overlay bg-gradient-to-br ${cat.gradient}`}></div>
                            
                            <div className="icon-wrapper text-5xl mb-2">
                                {cat.icon}
                            </div>
                            
                            <div className={`font-bold text-sm md:text-base text-center transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                                    : 'text-gray-700'
                            }`}>
                                {cat.label}
                            </div>
                            
                            {selectedCategory === cat.id && (
                                <div className="w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mt-2"></div>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryFilter;