import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

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
   Decorative doodle SVGs
   Theme-aware line art — purely visual.
-------------------------------------------------------------------*/

function DoodleFlower({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M50 50c0-12-8-22-8-22s8 4 8 16c0-12 8-16 8-16s-8 10-8 22z" />
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
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 85C20 55 45 20 85 15C82 55 55 82 20 85Z" />
        <path d="M25 80C40 65 55 45 78 22" />
        <path d="M42 63C36 60 31 56 27 51" />
        <path d="M55 50C51 44 49 38 49 32" />
      </g>
    </svg>
  );
}

function DoodleSparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 4v10M20 26v10M4 20h10M26 20h10" />
        <path d="M9 9l4 4M27 27l4 4M31 9l-4 4M13 27l-4 4" />
      </g>
    </svg>
  );
}

function DoodleHeart({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
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

function DoodleLotus({ className = "" }: { className?: string }) {
  const outerPetal =
    "M50 50 C 42 34, 36 18, 50 4 C 64 18, 58 34, 50 50 Z";

  const innerPetal =
    "M50 50 C 45 40, 42 30, 50 20 C 58 30, 55 40, 50 50 Z";

  const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  const innerAngles = [
    22.5,
    67.5,
    112.5,
    157.5,
    202.5,
    247.5,
    292.5,
    337.5,
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        {outerAngles.map((deg) => (
          <path
            key={`o-${deg}`}
            d={outerPetal}
            transform={`rotate(${deg} 50 50)`}
          />
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

        <path
          d="M20 92c8-4 18-4 30 0s22 4 30 0"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

function DoodleSun({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="50" cy="50" r="17" />
        <path d="M50 8v15M50 77v15M8 50h15M77 50h15" />
        <path d="M20 20l11 11M69 69l11 11M80 20L69 31M31 69L20 80" />
      </g>
    </svg>
  );
}

function DoodleCloud({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 70"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 52h76c9 0 16-7 16-15s-7-15-16-15c-2 0-4 0-6 1C87 12 77 6 65 6c-13 0-24 8-28 19-2-1-5-2-8-2-10 0-18 8-18 18s4 11 9 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoodleWave({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 22c15-12 30-12 45 0s30 12 45 0 30-12 60 0" />
        <path d="M5 40c15-12 30-12 45 0s30 12 45 0 30-12 60 0" />
      </g>
    </svg>
  );
}

function DoodleStar({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M30 5l5.5 17.5L53 28l-17.5 5.5L30 51l-5.5-17.5L7 28l17.5-5.5L30 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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

  /* REAL STATS STATE */
  const [statsData, setStatsData] = useState({
    daysActive: 0,
    meditationMinutes: 0,
    journalEntries: 0,
    goalsAchieved: 0,
  });

  /* LOAD PROFILE STATS */
  const loadProfileStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Days Active (from mood)
    const { data: moodData } = await supabase
      .from('moods')
      .select('created_at')
      .eq('user_id', user.id);

    const uniqueDays = new Set(
      (moodData || []).map((m) =>
        new Date(m.created_at).toDateString()
      )
    );

    // Meditation Minutes (completed only)
    const { data: meditationData } = await supabase
      .from("meditation_sessions")
      .select("duration")
      .eq("user_id", user.id)
      .eq("completed", true);

    const totalMeditationMinutes = (
      meditationData || []
    ).reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );

    // Journal Entries count
    const { count: journalCount } = await supabase
      .from("journals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Goals Achieved
    const { count: goalsCompleted } = await supabase
      .from("goals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);

    setStatsData({
      daysActive: uniqueDays.size,
      meditationMinutes: totalMeditationMinutes,
      journalEntries: journalCount || 0,
      goalsAchieved: goalsCompleted || 0,
    });
  };

  useEffect(() => {
    loadProfileStats();
  }, []);

  /* FETCH USER PROFILE */
  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } =
        await supabase.auth.getUser();

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

  const stats = [
    {
      label: "Days Active",
      value: statsData.daysActive,
      icon: Calendar,
    },
    {
      label: "Meditation Minutes",
      value: statsData.meditationMinutes,
      icon: BarChart3,
    },
    {
      label: "Journals Entries",
      value: statsData.journalEntries,
      icon: Edit3,
    },
    {
      label: "Goals Achieved",
      value: statsData.goalsAchieved,
      icon: Target,
    },
  ];

  const settings = [
    {
      title: "Daily Reminders",
      description: "Get notified daily",
      enabled: true,
    },
    {
      title: "Mood Tracking",
      description: "Daily mood reminder",
      enabled: true,
    },
    {
      title: "Weekly Reports",
      description: "Summary every week",
      enabled: false,
    },
    {
      title: "Sleep Reminders",
      description: "Night routine alerts",
      enabled: true,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground p-6 pb-24 transition-colors duration-300">

      {/* ============================================================
          THEME-AWARE DOODLE BACKGROUND
          ============================================================ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Soft ambient shapes */}
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-[25%] -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-[58%] -left-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        {/* Top */}
        <DoodleSun className="absolute -top-1 right-5 h-20 w-20 text-primary/25 rotate-6" />

        <DoodleCloud className="absolute top-14 left-[-18px] h-16 w-28 text-muted-foreground/20 -rotate-3" />

        <DoodleFlower className="absolute top-8 left-20 h-12 w-12 text-primary/25 rotate-12" />

        <DoodleSparkle className="absolute top-24 right-28 h-6 w-6 text-primary/35" />

        <DoodleStar className="absolute top-32 left-8 h-8 w-8 text-primary/20 rotate-12" />

        {/* Profile */}
        <DoodleLeaf className="absolute top-[18%] -right-5 h-24 w-24 text-primary/20 rotate-12" />

        <DoodleHeart className="absolute top-[22%] left-3 h-9 w-9 text-primary/20 -rotate-8" />

        <DoodleSparkle className="absolute top-[27%] right-10 h-5 w-5 text-primary/30" />

        <DoodleFlower className="absolute top-[32%] -left-5 h-16 w-16 text-primary/18 -rotate-12" />

        {/* Stats */}
        <DoodleLotus className="absolute top-[38%] right-[-10px] h-24 w-24 text-primary/20 rotate-12" />

        <DoodleStar className="absolute top-[43%] left-4 h-7 w-7 text-primary/20 -rotate-6" />

        <DoodleLeaf className="absolute top-[47%] -left-8 h-24 w-24 text-primary/18 -rotate-20" />

        <DoodleSparkle className="absolute top-[52%] right-20 h-6 w-6 text-primary/30" />

        {/* Notifications */}
        <DoodleHeart className="absolute top-[57%] right-3 h-10 w-10 text-primary/18 rotate-8" />

        <DoodleFlower className="absolute top-[61%] left-8 h-12 w-12 text-primary/20 rotate-6" />

        <DoodleCloud className="absolute top-[65%] right-[-20px] h-14 w-24 text-muted-foreground/15 rotate-3" />

        <DoodleSparkle className="absolute top-[69%] left-1/3 h-5 w-5 text-primary/30" />

        {/* Goals / theme */}
        <DoodleLotus className="absolute top-[72%] -left-7 h-28 w-28 text-primary/18 -rotate-12" />

        <DoodleLeaf className="absolute top-[77%] right-3 h-20 w-20 text-primary/20 rotate-45" />

        <DoodleStar className="absolute top-[81%] left-10 h-8 w-8 text-primary/20 rotate-6" />

        <DoodleFlower className="absolute top-[84%] right-1/4 h-12 w-12 text-primary/18 -rotate-12" />

        {/* Bottom */}
        <DoodleWave className="absolute bottom-20 left-1/2 h-12 w-32 -translate-x-1/2 text-primary/18" />

        <DoodleHeart className="absolute bottom-28 right-8 h-9 w-9 text-primary/20 -rotate-6" />

        <DoodleLeaf className="absolute bottom-8 left-4 h-20 w-20 text-primary/18 -rotate-12" />

        <DoodleSparkle className="absolute bottom-12 right-1/3 h-6 w-6 text-primary/25" />

        <DoodleStar className="absolute bottom-32 left-1/4 h-7 w-7 text-primary/18 rotate-12" />
      </div>

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      <div className="relative z-10 mx-auto max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Profile
          </h1>

          <p className="text-muted-foreground">
            Your wellness journey overview
          </p>
        </div>

        {/* Profile Card */}
        <Card className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">

              <div
                onClick={() => setShowAvatarPicker(true)}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <>
                    <Input
                      value={userName}
                      onChange={(e) =>
                        setUserName(e.target.value)
                      }
                    />

                    <Input
                      value={userEmail}
                      disabled
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-foreground">
                      {userName}
                    </h2>

                    <p className="text-muted-foreground">
                      {userEmail}
                    </p>

                    <p className="text-sm text-primary">
                      Verified Member
                    </p>
                  </>
                )}
              </div>

              <Button
                onClick={() =>
                  isEditing
                    ? handleSaveProfile()
                    : setIsEditing(true)
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
        <Card className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <BarChart3 className="text-primary" />
              <span>Your Progress</span>
            </CardTitle>

            <CardDescription className="text-muted-foreground">
              Your wellness journey so far
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/50 bg-primary/5 p-4 text-center transition-colors hover:bg-primary/10"
                  >
                    <Icon className="mx-auto mb-2 h-6 w-6 text-primary" />

                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {settings.map((setting, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg p-3"
              >
                <div>
                  <h4 className="font-medium text-foreground">
                    {setting.title}
                  </h4>

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
        <Card className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Target className="text-primary" />
              <span>Your Goal</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border/50 bg-primary/5 p-3">
              <span className="text-sm font-medium text-foreground">
                {goal
                  ? goal.category
                  : "No goal set yet."}
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => navigate("/set-goal")}
            >
              <Target className="mr-2 h-4 w-4" />
              Set / Edit Goal
            </Button>
          </CardContent>
        </Card>

        {/* Theme & Mode */}
        <Card className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <CardContent className="space-y-4 p-4">

            <div
              onClick={() => navigate("/theme-setup")}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4 transition-transform hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-semibold text-foreground">
                  Theme
                </h3>

                <p className="text-sm text-muted-foreground">
                  Customize your colours
                </p>
              </div>

              <Palette className="h-6 w-6 text-primary" />
            </div>

            <div
              onClick={() => navigate("/mode-selector")}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4 transition-transform hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-semibold text-foreground">
                  Mode
                </h3>

                <p className="text-sm text-muted-foreground">
                  Light / Dark / System
                </p>
              </div>

              <span className="rounded-xl bg-primary/10 px-3 py-1 text-primary capitalize">
                {themeMode}
              </span>
            </div>

          </CardContent>
        </Card>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[90%] max-w-sm space-y-4 rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">

              <h3 className="text-center text-lg font-semibold text-foreground">
                Choose Your Avatar
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "src/assets/Avatar/Male 1.png",
                  "src/assets/Avatar/Male 2.png",
                  "src/assets/Avatar/Female 1.png",
                  "src/assets/Avatar/Female 2.png",
                ].map((avatar, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setProfileImage(avatar);
                      setShowAvatarPicker(false);
                    }}
                    className="mx-auto flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-background transition hover:scale-105"
                  >
                    <img
                      src={avatar}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    const imageUrl =
                      URL.createObjectURL(file);

                    setProfileImage(imageUrl);
                    setShowAvatarPicker(false);
                  }}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setShowAvatarPicker(false)
                }
              >
                Cancel
              </Button>

            </div>
          </div>
        )}

        {/* Actions */}
        <Card className="rounded-[28px] border border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <CardContent className="space-y-3 p-4">

            <Button
              variant="outline"
              className="h-12 w-full justify-start rounded-xl"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings & Privacy
            </Button>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="h-12 w-full justify-start rounded-xl"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>

          </CardContent>
        </Card>

        {/* App Info */}
        <div className="mt-4 text-center text-sm text-muted-foreground/60">
          <p>SAATHI v1.0.0</p>
          <p>Your companion in mental wellness</p>
        </div>

      </div>
    </div>
  );
}
