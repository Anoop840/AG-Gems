'use client';

// Import the component containing all the profile and order logic
import ProfilePage from '@/components/ProfilePage';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Loader2 } from 'lucide-react';

// This wrapper component ensures the route is correctly picked up by Next.js
// It uses ProtectedRoute internally within the ProfilePage component itself.

export default function ProfileRoute() {
  // Since the logic (including ProtectedRoute) is inside the component,
  // we just render it directly here.
  return (
    // We render Navbar/Footer outside the main ProfilePage component
    // in case ProfilePage handles its own loading state. 
    // However, since ProfilePage is fully loaded, we can simplify this.
    // Let's ensure the main component handles its layout, as designed.
    <ProfilePage />
  );
}