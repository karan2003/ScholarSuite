"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

const CombinedPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const loginRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.publicMetadata.role) {
      setLoading(true);
      router.push(`/${user.publicMetadata.role}`);
    }
  }, [user, router]);

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 hidden sm:block">
          <Image
            src="/bg.jpg"
            alt="Background"
            fill
            priority
            style={{ objectFit: "fill" }}
          />
          <div className="absolute inset-0 opacity-75"></div>
        </div>
        <div className="relative z-10">
          <header className="flex flex-col md:flex-row items-center justify-center text-center py-24 px-4">
            <div className="hidden md:flex md:w-1/4 justify-end pr-4 animate-slideInLeft">
              <Image
                src="/left.png"
                alt="Left Decoration"
                width={400}
                height={600}
                className="rounded-lg shadow-lg transition-transform duration-500 hover:scale-105 animate-oscillate"
              />
            </div>
            <div className="w-full md:w-1/2 px-4">
              <div className="card-3d bg-lamaPurpleLight/40 p-8 rounded-lg shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                <div className="mb-6 flex justify-center">
                  <div className="w-[100px] h-[100px]" style={{ perspective: '800px' }}>
                    <div
                      className="inline-block origin-center"
                      style={{
                        transformStyle: 'preserve-3d',
                        animation: 'globe-spin 10s linear infinite'
                      }}
                    >
                      <Image
                        src="/logo.png"
                        alt="ScholarSuite Logo"
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl text-bluebag font-bold mb-4 tracking-widest drop-shadow-lg animate-slideInDown animate-textPulse">
                  ScholarSuite
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-tb font-medium mb-8 max-w-3xl mx-auto drop-shadow-md animate-slideInDown">
                  Transforming Campus Administration &amp; Elevating Academic Excellence
                </p>
                <p className="max-w-2xl mb-10 text-base sm:text-lg leading-relaxed mx-auto drop-shadow-md animate-slideInUp">
                  ScholarSuite is an advanced college database management system engineered to automate and manage every aspect of campus administration.
                </p>
                <button
                  onClick={scrollToLogin}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-800 font-semibold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-gray-100 animate-bounce"
                >
                  Sign In Now
                </button>
              </div>
            </div>
            <div className="hidden md:flex md:w-1/4 justify-start pl-4 animate-slideInRight">
              <Image
                src="/right.png"
                alt="Right Decoration"
                width={300}
                height={400}
                className="rounded-lg shadow-lg transition-transform duration-500 hover:scale-105 animate-oscillate"
              />
            </div>
          </header>

          <section className="py-16 px-4">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-bluebag">About ScholarSuite</h2>
              <p className="mb-6 text-base sm:text-lg text-black">
                ScholarSuite replaces outdated manual systems by centralizing data management and automating critical administrative tasks.
              </p>
              <p className="text-base sm:text-lg text-black">
                Designed for administrators, teachers, students, and parents, ScholarSuite isn’t just a system — it’s a gateway to academic excellence.
              </p>
            </div>
          </section>

          <section className="py-16 px-4 bg-indigo-900">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-white">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="card-3d bg-white text-indigo-800 p-6 rounded-lg shadow-xl animate-slideInLeft">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Centralized Data Management</h3>
                  <p>Manage all student, faculty, and administrative records from one unified platform.</p>
                </div>
                <div className="card-3d bg-white text-indigo-800 p-6 rounded-lg shadow-xl animate-slideInRight">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Automated Administration</h3>
                  <p>Automate tasks like attendance, scheduling, and exam management to save time and minimize errors.</p>
                </div>
                <div className="card-3d bg-white text-indigo-800 p-6 rounded-lg shadow-xl animate-slideInLeft">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Role-Based Access</h3>
                  <p>Securely manage user access for administrators, teachers, students, and parents.</p>
                </div>
                <div className="card-3d bg-white text-indigo-800 p-6 rounded-lg shadow-xl animate-slideInRight">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Scalable &amp; Reliable</h3>
                  <p>Designed to scale with your institution for a future‑ready administrative solution.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 px-4 bg-gradient-to-r from-indigo-700 to-blue-700">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Join ScholarSuite Today</h2>
              <p className="mb-6 text-base sm:text-lg text-white">
                Experience streamlined campus administration that delivers secure and user-friendly management.
              </p>
              <button
                onClick={scrollToLogin}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-800 font-semibold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-gray-100 animate-slideInUp"
              >
                Sign In Now
              </button>
            </div>
          </section>
        </div>
      </div>

      <div
        ref={loginRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 px-4 py-12"
      >
        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-white/20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="ScholarSuite Logo"
                  width={40}
                  height={40}
                  className="w-8 h-8 transition-transform duration-300 hover:scale-110"
                />
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                  ScholarSuite
                </h1>
              </div>
              <h2 className="text-gray-200/80 text-xs sm:text-sm font-medium">
                Elevate Your Academic Journey
              </h2>
            </div>
            <Clerk.GlobalError className="text-sm text-red-300 bg-red-900/30 px-4 py-2 rounded-lg" />
            <div className="space-y-4">
              <Clerk.Field name="identifier" className="space-y-1">
                <Clerk.Label className="text-xs font-medium text-gray-300/80">
                  Email or Username
                </Clerk.Label>
                <div className="relative">
                  <Clerk.Input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 placeholder:text-gray-400/70 text-gray-100 transition-all outline-none"
                    placeholder="Enter your email or username"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute right-3 top-3.5"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M7.5 7a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0" />
                    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                </div>
                <Clerk.FieldError className="text-xs text-red-300/90 mt-1" />
              </Clerk.Field>
              <Clerk.Field name="password" className="space-y-1">
                <Clerk.Label className="text-xs font-medium text-gray-300/80">
                  Password
                </Clerk.Label>
                <div className="relative">
                  <Clerk.Input
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 placeholder:text-gray-400/70 text-gray-100 transition-all outline-none"
                    placeholder="Enter your password"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute right-3 top-3.5"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M3 15.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" />
                    <path d="M7 9v5a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5V9" />
                    <path d="M12 4a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3" />
                  </svg>
                </div>
                <Clerk.FieldError className="text-xs text-red-300/90 mt-1" />
              </Clerk.Field>
            </div>
            <SignIn.Action
              submit
              onClick={() => setLoading(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-medium py-3.5 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-indigo-400/50 focus:outline-none"
            >
              Sign In
            </SignIn.Action>
            <p className="text-center text-sm text-gray-300/80">
              Trouble signing in?{' '}
              <a href="#" className="text-indigo-300 hover:text-indigo-200 transition-colors">
                Reset password
              </a>
            </p>
          </SignIn.Step>
        </SignIn.Root>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}



      {/* Custom CSS Animations & 3D Effects */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideInUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeInAnimation {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes oscillate {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes globe-spin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.8s ease-out forwards;
        }
        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeInAnimation 1s ease forwards;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }
        .animate-oscillate {
          animation: oscillate 3s infinite ease-in-out;
        }
        .animate-textPulse {
          animation: textPulse 2s infinite;
        }
        .card-3d {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: transform 0.5s ease;
        }
        .card-3d:hover {
          transform: rotateY(15deg) rotateX(5deg);
        }

        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .spinner {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CombinedPage;