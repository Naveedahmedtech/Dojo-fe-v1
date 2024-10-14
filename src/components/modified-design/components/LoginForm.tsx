import React from 'react';
import logo from '../../../styles/logo.png';

const LoginForm = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#FF9934] to-[#ffba75]">
            {/* Logo Section */}
            <div className="mb-10">
                <img src={logo} alt="Logo" className="w-64 mx-auto" />
            </div>

            {/* Login Card */}
            <div className="bg-white p-10 rounded-xl shadow-xl border border-gray-200 max-w-md w-full">
                <h2 className="mb-8 text-3xl font-semibold text-gray-800 text-center">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-6 border-b-2 border-gray-300 bg-transparent text-lg placeholder-gray-400 focus:outline-none focus:border-[#FF9934] transition duration-300 ease-in-out"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-8 border-b-2 border-gray-300 bg-transparent text-lg placeholder-gray-400 focus:outline-none focus:border-[#FF9934] transition duration-300 ease-in-out"
                />

                <button className="w-full py-3 bg-gradient-to-r from-[#FF9934] to-[#ffba75] text-white rounded-lg text-xl font-medium shadow-md hover:shadow-lg transition-shadow duration-300">
                    Login
                </button>

                <p className="mt-6 text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition duration-300">
                    Forgot password?
                </p>
            </div>
        </div>
    );
};

export default LoginForm;


<button className="w-full py-3 bg-gradient-to-r from-[#FF9934] to-[#ffba75] text-white rounded-md text-lg font-medium transition duration-500 border border-transparent hover:bg-transparent hover:text-[#FF9934] hover:border-[#FF9934] hover:bg-none">
    Login
</button>
