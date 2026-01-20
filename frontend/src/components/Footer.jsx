import React from 'react'

const Footer = () => {
  return (
  <footer className="bg-gray-900 text-white mt-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div>
                                    <h3 className="logo-font text-2xl font-bold mb-4">Elite Auctions</h3>
                                    <p className="text-gray-400">
                                        The world's premier online auction platform for luxury items.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-4">Quick Links</h4>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="hover:text-white cursor-pointer">About Us</li>
                                        <li className="hover:text-white cursor-pointer">How It Works</li>
                                        <li className="hover:text-white cursor-pointer">Contact</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-4">Categories</h4>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="hover:text-white cursor-pointer">Art</li>
                                        <li className="hover:text-white cursor-pointer">Jewelry</li>
                                        <li className="hover:text-white cursor-pointer">Furniture</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-4">Follow Us</h4>
                                    <div className="flex space-x-4">
                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                                            <span>f</span>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                                            <span>t</span>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                                            <span>in</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                                <p>&copy; 2024 Elite Auctions. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>

  )
}

export default Footer