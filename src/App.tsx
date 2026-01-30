// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/SplashScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import MoodTracker from "./components/MoodTracker";
import Journal from "./components/Journal";
import MeditationScreen from "./components/MeditationScreen";
import MusicScreen from "./components/MusicScreen";
import ChatScreen from "./components/ChatScreen";
import BottomNav from "./components/BottomNav";
import ProfileScreen from "./components/ProfileScreen";
import ThemeSetup from "./screens/ThemeSetup";
import ModeSelectorV2 from "./components/ModeSelectorV2";
import SetGoalScreen from "./screens/SetGoalScreen";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/settings/ProfileSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import WellnessSettings from "./pages/settings/WellnessSettings";
import ReminderSettings from "./pages/settings/ReminderSettings";
import PrivacySettings from "./pages/settings/PrivacySettings";
import TherapistAccess from "./pages/settings/TherapistAccess";
import About from "./pages/settings/About";
import Emergency from "./pages/settings/Emergency";
import DeleteAccount from "./pages/settings/DeleteAccount";
import AuthCallback from "./pages/AuthCallback";

/* ------------------------------- Layout Wrapper ------------------------------- */
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hiddenRoutes = ["/", "/onboarding", "/auth", "/theme-setup"];

  const hideNav = hiddenRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}

/* ------------------------------- Main App ------------------------------- */

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <LayoutWrapper>
              <Routes>
                {/* Startup */}
                <Route path="/" element={<SplashScreen />} />

                {/* Onboarding & Auth */}
                <Route path="/onboarding" element={<OnboardingScreen />} />
                <Route path="/auth" element={<AuthScreen />} />

                {/* Theme setup */}
                <Route path="/theme-setup" element={<ThemeSetup />} />
                <Route path="/mode-selector" element={<ModeSelectorV2 />} />

                {/* Main app */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mood" element={<MoodTracker />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/meditation" element={<MeditationScreen />} />
                <Route path="/breathing" element={<MeditationScreen />} />
                <Route path="/music" element={<MusicScreen />} />
                <Route path="/chat" element={<ChatScreen />} />

                {/* Profile */}

                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/settings" element={<Settings />} /> 
                <Route path="/set-goal" element={<SetGoalScreen />} />
                <Route path="/settings/profile" element={<ProfileSettings />} />
                <Route path="/settings/security" element={<SecuritySettings />} />
                <Route path="/settings/wellness" element={<WellnessSettings />} />
                <Route path="/settings/reminders" element={<ReminderSettings />} />
                <Route path="/settings/privacy" element={<PrivacySettings />} />
                <Route path="/settings/therapist" element={<TherapistAccess />} />
                <Route path="/settings/about" element={<About />} />
                <Route path="/settings/emergency" element={<Emergency />} />
                <Route path="/settings/delete-account" element={<DeleteAccount />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />

                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </LayoutWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
