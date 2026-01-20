import { useEffect, useState } from "react";
import { mockPriceResults } from "../data/mockPriceResult";
    const PriceResults = () => {
        const [PriceSearchQuery,setPriceSearchQuery] = useState('')
        const [filterPriceResult,setFilterPriceResult] = useState(mockPriceResults)
        useEffect(()=>{
         setFilterPriceResult(mockPriceResults.filter((item) => item.name.toLowerCase().includes(PriceSearchQuery.toLowerCase())))
        },[PriceSearchQuery])
            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8 flex justify-between" >
                        <div >
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Price Results</h2>
                        <p className="text-gray-600">View final prices from completed auctions</p></div>
                            <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <input
                                
                                type="text"
                                placeholder="Search results..."
                                value={PriceSearchQuery}
                                onChange={(e) => setPriceSearchQuery(e.target.value)}
                                className="w-full px-6 py-3 pl-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filterPriceResult.map(result => (
                            <div key={result.id} className="bg-gray-100 rounded-xl shadow-md overflow-hidden card-hover">
                                <div className="p-6">
                                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                                        {result.category}
                                    </span>
                                    <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-4">{result.name}</h3>
                                    
                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Estimated Price</span>
                                            <span className="text-sm font-semibold text-gray-700">
                                                ${result.estimatedPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Final Price</span>
                                            <span className="text-xl font-bold text-green-600">
                                                ${result.finalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <span className="text-sm text-gray-500">Sold to</span>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {result.winner}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Date</span>
                                            <span className="text-sm text-gray-700">
                                                {new Date(result.soldDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`text-center py-2 rounded-lg font-semibold ${
                                        result.finalPrice > result.estimatedPrice 
                                            ? 'bg-green-50 text-green-700' 
                                            : 'bg-gray-50 text-gray-700'
                                    }`}>
                                        {result.finalPrice > result.estimatedPrice 
                                            ? `+${((result.finalPrice - result.estimatedPrice) / result.estimatedPrice * 100).toFixed(1)}% above estimate`
                                            : 'Within estimate'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };
export default PriceResults