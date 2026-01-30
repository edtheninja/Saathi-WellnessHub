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
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">
            Your wellness journey overview
          </p>
        </div>

        {/* Profile Card */}
        <Card className="shadow-elevated border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div
                onClick={() => setShowAvatarPicker(true)}
                className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary" />
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
                    <h2 className="text-xl font-semibold">{userName}</h2>
                    <p className="text-muted-foreground">{userEmail}</p>
                    <p className="text-sm text-primary">Verified Member</p>
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
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="text-primary" />
              <span>Your Progress</span>
            </CardTitle>
            <CardDescription>Your wellness journey so far</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-2xl bg-primary/10">
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
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
                  <h4 className="font-medium">{setting.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Goals */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="text-primary" /> <span>Your Goal</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">
                {goal ? goal.category : "No goal set yet."}
              </span>
            </div>

            <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate("/set-goal")}>
              <Target className="w-4 h-4 mr-2" /> Set / Edit Goal
            </Button>
          </CardContent>
        </Card>

        {/* Theme & Mode */}
        <Card className="shadow-soft border-0">
          <CardContent className="p-4 space-y-4">

            <div
              onClick={() => navigate("/theme-setup")}
              className="p-4 rounded-2xl bg-card border cursor-pointer flex justify-between items-center hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-semibold">Theme</h3>
                <p className="text-sm text-muted-foreground">Customize your colours</p>
              </div>
              <Palette className="w-6 h-6 text-primary" />
            </div>

            <div
              onClick={() => navigate("/mode-selector")}
              className="p-4 rounded-2xl bg-card border cursor-pointer flex justify-between items-center hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-semibold">Mode</h3>
                <p className="text-sm text-muted-foreground">Light / Dark / System</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary capitalize">
                {themeMode}
              </span>
            </div>

          </CardContent>
        </Card>

        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-2xl w-[90%] max-w-sm space-y-4">

              <h3 className="text-lg font-semibold text-center">
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
                    className="w-24 h-24 mx-auto rounded-full bg-primary/10 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition"
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
        <Card className="shadow-soft border-0">
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
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>SAATHI v1.0.0</p>
          <p>Your companion in mental wellness</p>
        </div>





      </div >
    </div >
  );
}
