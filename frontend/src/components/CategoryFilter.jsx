import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { NavLink } from "react-router-dom";
const CategoryFilter = () => {
            const { selectedCategory, setSelectedCategory } = useContext(AppContext);

            const categories = [
                { id: 'all', label: 'All Categories', icon: '🎨' },
                { id: 'art', label: 'Art', icon: '🎨' },
                { id: 'jewelry', label: 'Jewelry', icon: '💎' },
                { id: 'furniture', label: 'Furniture', icon: '🪑' }
            ];

            return (
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Browse Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map(cat => (
                            <NavLink
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                to={'/upcoming'}
                                className={`p-4 rounded-lg border-2 transition-all card-hover cursor-pointer flex items-center justify-center ${
                                    selectedCategory === cat.id
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                }`}
                            >
                                <div className="text-3xl mb-2">{cat.icon}</div>
                                <div className="font-medium text-gray-700">{cat.label}</div>
                            </NavLink>
                        ))}
                    </div>
                </div>
            );
        };

export default CategoryFilter