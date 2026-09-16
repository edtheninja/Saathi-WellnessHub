// src/components/ProfileScreen.tsx
import { useState, useEffect } from "react";
import { supabase } from '@/supabaseClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import {
  User,
  Bell,
  Target,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Edit3,
  Save,
  Palette,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useGoals } from "@/context/GoalsContext";

/* ------------------------------------------------------------------
   Decorative doodle SVGs — purely visual, no logic, no external assets.
   Hand-drawn-style line art so they read as "doodles" rather than icons.
-------------------------------------------------------------------*/
function DoodleFlower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M50 50c0-12 -8-22-8-22s8 4 8 16c0-12 8-16 8-16s-8 10-8 22z" />
        <path d="M50 50c10-4 22-2 22-2s-4 8-14 10c10 2 16 10 16 10s-12-2-18-8z" />
        <path d="M50 50c-4 10-2 22-2 22s8-4 10-14c2 10 10 16 10 16s-2-12-8-18z" />
        <path d="M50 50c-10 4-22 2-22 2s4-8 14-10c-10-2-16-10-16-10s12 2 18 8z" />
        <circle cx="50" cy="50" r="4.5" />
      </g>
    </svg>
  );
}

function DoodleLeaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 85C20 55 45 20 85 15C82 55 55 82 20 85Z" />
        <path d="M25 80C40 65 55 45 78 22" />
      </g>
    </svg>
  );
}

function DoodleSparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 4v10M20 26v10M4 20h10M26 20h10" />
      </g>
    </svg>
  );
}

function DoodleHeart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M50 88C50 88 12 62 12 34C12 18 24 8 38 8C45 8 50 12 50 12C50 12 55 8 62 8C76 8 88 18 88 34C88 62 50 88 50 88Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Layered lotus doodle: outer + inner petals built from one teardrop
   petal shape, rotated around the center to form the flower. */
function DoodleLotus({ className = "" }: { className?: string }) {
  const outerPetal = "M50 50 C 42 34, 36 18, 50 4 C 64 18, 58 34, 50 50 Z";
  const innerPetal = "M50 50 C 45 40, 42 30, 50 20 C 58 30, 55 40, 50 50 Z";
  const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        {outerAngles.map((deg) => (
          <path key={`o-${deg}`} d={outerPetal} transform={`rotate(${deg} 50 50)`} />
        ))}
        {innerAngles.map((deg) => (
          <path
            key={`i-${deg}`}
            d={innerPetal}
            transform={`rotate(${deg} 50 50)`}
            opacity="0.75"
          />
        ))}
        <circle cx="50" cy="50" r="4" />
        {/* water ripple base, subtle */}
        <path d="M20 92c8-4 18-4 30 0s22 4 30 0" opacity="0.6" />
      </g>
    </svg>
  );
}

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const { goal } = useGoals();

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);


  /* ✅ REAL STATS STATE */
  const [statsData, setStatsData] = useState({
    daysActive: 0,
    meditationMinutes: 0,
    journalEntries: 0,
    goalsAchieved: 0
  });

  /* ✅ LOAD PROFILE STATS */
  const loadProfileStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;


    // Days Active (from mood)
    const { data: moodData } = await supabase
      .from('mood')
      .select('created_at')
      .eq('user_id', user.id);

    const uniqueDays = new Set(
      (moodData || []).map(m =>
        new Date(m.created_at).toDateString()
      )
    );

    // Meditation Minutes (completed only)
    const { data: meditationData } = await supabase
      .from('meditation')
      .select('duration')
      .eq('user_id', user.id)
      .eq('completed', true);

    const totalMeditationMinutes = (meditationData || []).reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );

    // Journal Entries count
    const { count: journalCount } = await supabase
      .from('journals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Goals Achieved
    const { count: goalsCompleted } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    /* ✅ CORRECT SETTER */
    setStatsData({
      daysActive: uniqueDays.size,
      meditationMinutes: totalMeditationMinutes,
      journalEntries: journalCount || 0,
      goalsAchieved: goalsCompleted || 0
    });
  };

  useEffect(() => {
    loadProfileStats();
  }, []);

  /* -------------------------------------------
     FETCH USER PROFILE
  -------------------------------------------- */
  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return navigate("/auth");

      setUserId(authData.user.id);
      setUserEmail(authData.user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", authData.user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || "");
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: userName })
      .eq("id", userId);

    if (!error) setIsEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  /* ✅ CONNECT STATS TO UI */
  const stats = [
    { label: "Days Active", value: statsData.daysActive, icon: Calendar },
    { label: "Meditation Minutes", value: statsData.meditationMinutes, icon: BarChart3 },
    { label: "Journals Entries", value: statsData.journalEntries, icon: Edit3 },
    { label: "Goals Achieved", value: statsData.goalsAchieved, icon: Target },
  ];

  const settings = [
    { title: "Daily Reminders", description: "Get notified daily", enabled: true },
    { title: "Mood Tracking", description: "Daily mood reminder", enabled: true },
    { title: "Weekly Reports", description: "Summary every week", enabled: false },
    { title: "Sleep Reminders", description: "Night routine alerts", enabled: true },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f6f1fc] via-[#eef2fb] to-[#fdf1f7] p-6 pb-24">

      {/* ---------------- Decorative doodle layer (background only) ---------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* soft ambient blooms */}
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-purple-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-pink-300/15 blur-3xl" />
        <div className="absolute top-[70%] -left-24 w-72 h-72 rounded-full bg-teal-200/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-blue-200/15 blur-3xl" />

        {/* --- Lotuses (hero doodle of the theme) --- */}
        <DoodleLotus className="absolute top-4 right-4 w-24 h-24 text-fuchsia-400/30 rotate-6" />
        <DoodleLotus className="absolute top-[48%] -left-8 w-28 h-28 text-purple-400/25 -rotate-12" />
        <DoodleLotus className="absolute bottom-24 right-2 w-20 h-20 text-rose-400/25 rotate-12" />
        <DoodleLotus className="absolute top-[85%] left-1/2 w-16 h-16 text-fuchsia-300/25 -rotate-6" />

        {/* --- Flowers --- */}
        <DoodleFlower className="absolute top-10 left-6 w-14 h-14 text-fuchsia-400/25 -rotate-6" />
        <DoodleFlower className="absolute top-[30%] right-8 w-12 h-12 text-purple-400/25 rotate-12" />
        <DoodleFlower className="absolute top-[62%] right-1/4 w-12 h-12 text-pink-400/25 -rotate-12" />
        <DoodleFlower className="absolute bottom-52 left-8 w-14 h-14 text-rose-400/25 rotate-6" />
        <DoodleFlower className="absolute bottom-8 left-1/3 w-12 h-12 text-fuchsia-300/25 rotate-12" />

        {/* --- Leaves --- */}
        <DoodleLeaf className="absolute top-28 right-10 w-20 h-20 text-emerald-500/20 rotate-12" />
        <DoodleLeaf className="absolute top-[42%] left-2 w-24 h-24 text-teal-500/20 -rotate-12" />
        <DoodleLeaf className="absolute top-[75%] right-6 w-20 h-20 text-emerald-400/20 rotate-45" />
        <DoodleLeaf className="absolute bottom-10 right-14 w-16 h-16 text-teal-400/20 -rotate-6" />

        {/* --- Hearts --- */}
        <DoodleHeart className="absolute top-[20%] left-1/2 w-10 h-10 text-rose-300/25 rotate-6" />
        <DoodleHeart className="absolute top-[90%] right-1/3 w-9 h-9 text-fuchsia-300/25 -rotate-6" />

        {/* --- Sparkles --- */}
        <DoodleSparkle className="absolute top-16 right-1/3 w-6 h-6 text-amber-300/40" />
        <DoodleSparkle className="absolute top-[55%] right-1/4 w-5 h-5 text-fuchsia-300/40" />
        <DoodleSparkle className="absolute bottom-32 left-1/4 w-5 h-5 text-purple-300/40" />
        <DoodleSparkle className="absolute bottom-64 right-8 w-6 h-6 text-amber-300/35" />
      </div>

      <div className="relative max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-purple-950">Profile</h1>
          <p className="text-purple-900/50">
            Your wellness journey overview
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(120,80,180,0.10)] rounded-[28px]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div
                onClick={() => setShowAvatarPicker(true)}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-200 to-purple-300 flex items-center justify-center cursor-pointer overflow-hidden ring-2 ring-white/70 shadow-md"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-purple-600" />
                )}
              </div>


              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <>
                    <Input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    <Input value={userEmail} disabled />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-purple-950">{userName}</h2>
                    <p className="text-purple-900/50">{userEmail}</p>
                    <p className="text-sm text-fuchsia-600">Verified Member</p>
                  </>
                )}
              </div>

              <Button
                onClick={() =>
                  isEditing ? handleSaveProfile() : setIsEditing(true)
                }
                variant="outline"
                size="sm"
              >
                {isEditing ? <Save /> : <Edit3 />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(120,80,180,0.10)] rounded-[28px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-950">
              <BarChart3 className="text-fuchsia-500" />
              <span>Your Progress</span>
            </CardTitle>
            <CardDescription className="text-purple-900/50">Your wellness journey so far</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-2xl bg-purple-50/70 border border-white/60">
                    <Icon className="w-6 h-6 text-fuchsia-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-950">{stat.value}</div>
                    <div className="text-xs text-purple-900/50">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(120,80,180,0.10)] rounded-[28px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-950">
              <Bell className="w-5 h-5 text-fuchsia-500" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.map((setting, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-purple-950">{setting.title}</h4>
                  <p className="text-sm text-purple-900/50">
                    {setting.description}
                  </p>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Goals */}
        <Card className="border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(120,80,180,0.10)] rounded-[28px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-950">
              <Target className="text-fuchsia-500" /> <span>Your Goal</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="p-3 bg-purple-50/70 border border-white/60 rounded-lg">
              <span className="text-sm font-medium text-purple-950">
                {goal ? goal.category : "No goal set yet."}
              </span>
            </div>

            <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate("/set-goal")}>
              <Target className="w-4 h-4 mr-2" /> Set / Edit Goal
            </Button>
          </CardContent>
        </Card>

        {/* Theme & Mode */}
        <Card className="border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(120,80,180,0.10)] rounded-[28px]">
          <CardContent className="p-4 space-y-4">

            <div
              onClick={() => navigate("/theme-setup")}
              className="p-4 rounded-2xl bg-white/70 border border-white/60 cursor-pointer flex justify-between items-center transition-transform hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-semibold text-purple-950">Theme</h3>
                <p className="text-sm text-purple-900/50">Customize your colours</p>
              </div>
              <Palette className="w-6 h-6 text-fuchsia-500" />
            </div>

            <div
              onClick={() => navigate("/mode-selector")}
              className="p-4 rounded-2xl bg-white/70 border border-white/60 cursor-pointer flex justify-between items-center transition-transform hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-semibold text-purple-950">Mode</h3>
                <p className="text-sm text-purple-900/50">Light / Dark / System</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-fuchsia-100 text-fuchsia-700 capitalize">
                {themeMode}
              </span>
            </div>

          </CardContent>
        </Card>

        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[28px] w-[90%] max-w-sm space-y-4 border border-white/60 shadow-2xl">

              <h3 className="text-lg font-semibold text-center text-purple-950">
                Choose Your Avatar
              </h3>

              {/* Avatar Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  "src/assets/Avatar/Male 1.png", // male avatar 1
                  "src/assets/Avatar/Male 2.png", // male avatar 2
                  "src/assets/Avatar/Female 1.png", // female avatar 1
                  "src/assets/Avatar/Female 2.png", // female avatar 2
                ].map((avatar, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setProfileImage(avatar);
                      setShowAvatarPicker(false);
                    }}
                    className="w-24 h-24 mx-auto rounded-full bg-purple-100 cursor-pointer flex items-center justify-center overflow-hidden ring-2 ring-white hover:scale-105 transition"
                  >
                    {avatar && (
                      <img
                        src={avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const imageUrl = URL.createObjectURL(file);
                    setProfileImage(imageUrl);
                    setShowAvatarPicker(false);
                  }}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAvatarPicker(false)}
              >
                Cancel
              </Button>

            </div>
          </div>
        )}


        {/* Actions */}
        <Card className="border border-white/50 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(120,80,180,0.10)] rounded-[28px]">
          <CardContent className="p-4 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-12"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings & Privacy
            </Button>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full justify-start rounded-xl h-12"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-purple-900/40 mt-4">
          <p>SAATHI v1.0.0</p>
          <p>Your companion in mental wellness</p>
        </div>

      </div>
    </div>
  );
}