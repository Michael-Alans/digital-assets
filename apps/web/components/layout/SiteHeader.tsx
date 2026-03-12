"use client";

import { useEffect, useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import NavLink from 'next/link'
import { Menu, X } from 'lucide-react' 

export default function SiteHeader() {
  const { user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // 1. Track mounting to prevent hydration errors

  // 2. Set mounted to true once the component is active in the browser
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debugging log
  useEffect(() => {
    if (user && isLoaded) {
      console.log("Current User Role:", user.publicMetadata?.role);
    }
  }, [user, isLoaded]);

  // 3. Logic: Defensive check for role
  // We check 'mounted' and 'isLoaded' to ensure we have real data before rendering
  const isCreator = 
    mounted && 
    isLoaded && 
    user?.publicMetadata?.role?.toString().toUpperCase() === "CREATOR";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // 4. Return null or a skeleton if Clerk isn't ready to prevent flicker
  if (!mounted || !isLoaded) return <div className="h-16 border-b border-border bg-bg" />;

  return (
    <header className="sticky top-0 z-50 flex flex-col bg-bg border-b border-border">
      <div className="flex justify-between items-center p-4 h-16 max-w-7xl mx-auto w-full">
        
        {/* Brand/Logo */}
        <div className="text-xl font-bold text-text-main shrink-0">
          <NavLink href="/">Digital Assets</NavLink>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/assets" className="text-sm font-medium text-muted hover:text-text-main transition-colors">
            Marketplace
          </NavLink>
          
          <Show when="signed-in">
            <NavLink href="/buyer/my-assets" className="text-sm font-medium text-muted hover:text-text-main transition-colors">
              My Library
            </NavLink>
            
            {/* The Link: Should now appear correctly */}
            {isCreator && (
              <NavLink href="/creator/assets" className="text-sm font-medium text-muted hover:text-text-main transition-colors">
                Creator Dashboard
              </NavLink>
            )}
          </Show>
        </nav>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <div className="hidden sm:block">
              <SignInButton fallbackRedirectUrl="/buyer/my-assets" mode="modal">
                <button className="text-sm font-medium text-muted hover:text-text-main transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
            
            <SignUpButton fallbackRedirectUrl="/buyer/my-assets" mode="modal">
              <button className="bg-primary text-white rounded-lg font-medium text-sm h-10 px-5 hover:opacity-90 transition-opacity">
                Sign Up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10"
                }
              }}
            />
          </Show>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-text-main" 
            onClick={toggleMenu}
            aria-label="Toggle Navigation"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-bg border-t border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <NavLink href="/assets" onClick={toggleMenu} className="text-base font-medium text-muted hover:text-text-main">
            Marketplace
          </NavLink>
          
          <Show when="signed-in">
            <NavLink href="/buyer/my-assets" onClick={toggleMenu} className="text-base font-medium text-muted hover:text-text-main">
              My Library
            </NavLink>
            
            {isCreator && (
              <NavLink href="/creator/assets" onClick={toggleMenu} className="text-base font-medium text-muted hover:text-text-main">
                Creator Dashboard
              </NavLink>
            )}
          </Show>

          <Show when="signed-out">
            <SignInButton fallbackRedirectUrl="/buyer/my-assets" mode="modal">
              <button onClick={toggleMenu} className="text-left text-base font-medium text-muted hover:text-text-main">
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
      )}
    </header>
  )
}