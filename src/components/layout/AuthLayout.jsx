import React from "react";
import { Outlet } from "react-router-dom";
import { Calendar, Sparkles } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-row w-full">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 flex-shrink-0">
        <div className="size-full">
          {/* Content - Outlet renders nested routes */}
          <Outlet />
        </div>
      </div>

      {/* Right Side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 p-12 items-center justify-center relative overflow-hidden flex-shrink-0">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-lg">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center justify-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm shadow-lg">
              <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold text-center text-white drop-shadow-md">
              Manage Your Venue Like a Pro
            </h1>
          </div>

          <p className="text-xl text-white/90 mb-8">
            Streamline event planning, client management, and team collaboration
            all in one place.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Effortless Event Management
                </h3>
                <p className="text-white/80">
                  Track bookings, manage calendars, and coordinate events
                  seamlessly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Financial Control
                </h3>
                <p className="text-white/80">
                  Handle payments, invoices, and financial reporting with ease.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Team Collaboration
                </h3>
                <p className="text-white/80">
                  Assign tasks, set reminders, and keep everyone in sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
