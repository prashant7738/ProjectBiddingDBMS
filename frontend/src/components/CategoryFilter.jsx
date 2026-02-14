import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { NavLink } from "react-router-dom";

const CategoryFilter = () => {
    const { selectedCategory, setSelectedCategory } = useContext(AppContext);

    const categories = [
        // { id: 'all', label: 'All Categories', icon: '�', gradient: 'from-purple-400 to-pink-400' },
        { id: 'Electronics', label: 'Electronics', icon: '📱', gradient: 'from-blue-400 to-cyan-400' },
        { id: 'Home & Garden', label: 'Home & Garden', icon: '🏡', gradient: 'from-green-400 to-emerald-400' },
        { id: 'Fashion', label: 'Fashion', icon: '👗', gradient: 'from-pink-400 to-rose-400' },
        { id: 'Others', label: 'Others', icon: '🎨', gradient: 'from-yellow-400 to-orange-400' }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100 overflow-hidden relative">
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