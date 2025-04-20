"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) router.push(`/${role}`);
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-white/20"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Scholarsuite Logo" 
                width={32} 
                height={32}
                className="w-8 h-8 transition-transform hover:scale-110"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                Scholarsuite
              </h1>
            </div>
            <h2 className="text-gray-200/80 text-sm font-medium">
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
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-medium py-3.5 rounded-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-95 focus:ring-2 focus:ring-indigo-400/50 focus:outline-none"
          >
            Sign In
          </SignIn.Action>

          <p className="text-center text-sm text-gray-300/80">
            Trouble signing in?{" "}
            <a href="#" className="text-indigo-300 hover:text-indigo-200 transition-colors">
              Reset password
            </a>
          </p>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;