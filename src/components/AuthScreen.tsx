import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
<<<<<<< HEAD
import { Mail, Lock, User } from 'lucide-react';
import saathiLogo from '@/assets/saathi-logo.png';
=======
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
import { supabase } from '@/supabaseClient';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const AuthScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
<<<<<<< HEAD
=======
  const [showPassword, setShowPassword] = useState(false);
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      const response = await fetch(`${apiBase}/auth/oauth/${provider}/start`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `${provider} login is unavailable`);
      window.location.assign(payload.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'OAuth login is unavailable');
    }
  };

  const handleAuth = async (type: 'login' | 'signup') => {
    setIsLoading(true);

    try {
      // ================= SIGN UP =================
      if (type === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
<<<<<<< HEAD
          data: {
           username: fullName, // 👈 THIS IS KEY
=======
            data: {
              username: fullName,
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
            },
          },
        });

        if (error) throw error;

        // create profile safely (only once)
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            name: fullName,
          });
        }

        alert('Verification email sent🎉. Please verify before login.✅');
        return;
      }

      // ================= LOGIN =================
      if (type === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // 🚨 BLOCK UNVERIFIED USERS
        if (!data.user?.email_confirmed_at) {
          await supabase.auth.signOut();
          alert('Please verify your email before logging in.❌');
          return;
        }

        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={saathiLogo} 
            alt="SAATHI" 
            className="w-20 h-20 mx-auto mb-4 animate-float"
          />
          <h1 className="text-2xl font-bold text-foreground">Welcome to SAATHI</h1>
          <p className="text-muted-foreground">Your mental wellness companion</p>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Create an account or sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={() => handleAuth('login')}
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </div>
              </TabsContent>

              {/* SIGNUP */}
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={() => handleAuth('signup')}
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => void handleOAuth('google')}>
                Continue with Google
              </Button>
              <Button type="button" variant="outline" onClick={() => void handleOAuth('apple')}>
                Continue with Apple
              </Button>
            </div>

            <div className="text-center mt-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground"
              >
                Continue as Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthScreen;
=======
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#dcd5ff] via-[#dff4f5] to-[#c9f0df] px-4 py-8 sm:px-6">
      
      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Soft gradient blobs */}
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#bda8f5]/30 blur-3xl" />
        <div className="absolute -right-32 top-20 h-[460px] w-[460px] rounded-full bg-[#9edfe8]/35 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[25%] h-[420px] w-[420px] rounded-full bg-[#a8e4c5]/30 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[-100px] h-[400px] w-[400px] rounded-full bg-[#cdb7f7]/25 blur-3xl" />

        {/* =======================================================
            TOP LEFT DOODLES
        ======================================================= */}
        <svg
          className="absolute left-0 top-0 h-[300px] w-[340px] opacity-55"
          viewBox="0 0 340 300"
          fill="none"
        >
          <path
            d="M-20 110C70 80 60 10 150-10"
            stroke="#8d83df"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M50 215C105 170 135 145 150 90"
            stroke="#78bfa4"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M112 145C90 125 70 124 52 132C71 150 92 154 112 145Z"
            fill="#9bcfb9"
          />

          <path
            d="M133 118C120 92 125 73 140 58C153 78 153 99 133 118Z"
            fill="#9c92e9"
          />

          <path
            d="M80 188C63 165 65 146 77 132C92 149 94 169 80 188Z"
            fill="#b9a9f1"
          />

          <path
            d="M230 45C230 35 238 27 248 27C238 27 230 19 230 9C230 19 222 27 212 27C222 27 230 35 230 45Z"
            stroke="#8d83df"
            strokeWidth="2"
          />

          <path
            d="M275 130C275 116 286 105 300 105C286 105 275 94 275 80C275 94 264 105 250 105C264 105 275 116 275 130Z"
            stroke="#7eb8e0"
            strokeWidth="2"
          />
        </svg>

        {/* =======================================================
            TOP RIGHT SUN + LEAVES
        ======================================================= */}
        <svg
          className="absolute right-0 top-0 h-[330px] w-[360px] opacity-50"
          viewBox="0 0 360 330"
          fill="none"
        >
          <circle
            cx="282"
            cy="72"
            r="34"
            stroke="#8c9be6"
            strokeWidth="3"
          />

          <path
            d="M282 20V4M282 140V124M230 72H214M350 72H334M245 35L234 24M319 109L308 98M319 35L330 24M245 109L234 120"
            stroke="#8c9be6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M75 270C95 215 130 165 180 125"
            stroke="#72bca1"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M118 225C94 205 91 183 99 166C119 179 127 200 118 225Z"
            fill="#8bc9aa"
          />

          <path
            d="M150 188C142 161 150 141 166 128C177 150 172 173 150 188Z"
            fill="#a2d7b8"
          />

          <path
            d="M190 150C184 127 191 110 206 99C215 119 208 139 190 150Z"
            fill="#9ab9ee"
          />

          <path
            d="M200 250C220 232 244 230 262 238C247 254 224 259 200 250Z"
            fill="#a9dcbf"
          />

          {/* little birds */}
          <path
            d="M250 165C257 158 264 158 271 165C278 158 285 158 292 165"
            stroke="#7f9fd8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* =======================================================
            LEFT MEDITATION DOODLE
        ======================================================= */}
        <svg
          className="absolute bottom-0 left-0 h-[370px] w-[330px] opacity-45"
          viewBox="0 0 330 370"
          fill="none"
        >
          <path
            d="M-20 315C40 270 75 240 85 175"
            stroke="#8d83df"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M85 175C69 154 72 130 88 114C105 134 104 157 85 175Z"
            fill="#b29ceb"
          />

          <path
            d="M100 142C99 117 112 99 132 91C136 115 123 136 100 142Z"
            fill="#9bcfb9"
          />

          {/* peaceful face */}
          <circle
            cx="108"
            cy="246"
            r="42"
            fill="#efc0a2"
          />

          <path
            d="M73 235C73 202 89 185 113 185C136 185 151 204 149 231C139 219 130 214 115 213C98 213 87 221 73 235Z"
            fill="#5d514d"
          />

          <path
            d="M96 248C99 251 103 251 106 248"
            stroke="#705b61"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M119 248C122 251 126 251 129 248"
            stroke="#705b61"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M103 262C110 268 119 268 126 262"
            stroke="#9d6472"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* body */}
          <path
            d="M64 300C69 273 88 263 109 263C132 263 151 276 156 300L165 356H52L64 300Z"
            fill="#b99bea"
          />

          {/* lotus */}
          <path
            d="M220 335C205 322 204 304 215 292C226 306 228 320 220 335Z"
            fill="#c06bdd"
          />

          <path
            d="M220 335C235 322 237 304 226 292C215 306 213 320 220 335Z"
            fill="#a78de9"
          />

          <path
            d="M220 338C204 331 190 333 179 342C194 351 208 349 220 338Z"
            fill="#bd74dc"
          />

          <path
            d="M220 338C236 331 250 333 261 342C246 351 232 349 220 338Z"
            fill="#a48be7"
          />
        </svg>

        {/* =======================================================
            RIGHT BOTTOM LOTUS + WAVES
        ======================================================= */}
        <svg
          className="absolute bottom-0 right-0 h-[360px] w-[380px] opacity-50"
          viewBox="0 0 380 360"
          fill="none"
        >
          <path
            d="M210 340C250 320 275 285 286 240"
            stroke="#72bca1"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M274 276C255 253 256 229 272 211C289 233 290 255 274 276Z"
            fill="#95cdb1"
          />

          <path
            d="M292 250C290 225 302 207 321 198C325 222 313 242 292 250Z"
            fill="#9ab9eb"
          />

          {/* lotus */}
          <path
            d="M235 276C211 277 191 268 178 250C198 247 220 253 235 276Z"
            fill="#c05fdc"
          />

          <path
            d="M245 276C269 277 289 268 302 250C282 247 260 253 245 276Z"
            fill="#ad88e9"
          />

          <path
            d="M240 270C222 256 218 235 224 215C240 228 247 249 240 270Z"
            fill="#bf68dc"
          />

          <path
            d="M240 270C258 256 262 235 256 215C240 228 233 249 240 270Z"
            fill="#a77fe4"
          />

          <path
            d="M240 279C221 260 219 233 240 207C261 233 259 260 240 279Z"
            fill="#c15fdc"
          />

          {/* water lines */}
          <path
            d="M175 298C205 289 235 289 265 298"
            stroke="#8c9be6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M160 315C200 304 240 304 280 315"
            stroke="#8c9be6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M145 332C190 320 250 320 295 332"
            stroke="#8c9be6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* =======================================================
            FLOATING HEARTS / SPARKLES
        ======================================================= */}
        <div className="absolute left-[10%] top-[30%] text-2xl text-[#9b8ce4]/55">
          ✦
        </div>

        <div className="absolute right-[12%] top-[38%] text-xl text-[#7dbda0]/60">
          ✦
        </div>

        <div className="absolute left-[16%] bottom-[24%] text-2xl text-[#a78de9]/45">
          ♥
        </div>

        <div className="absolute right-[18%] bottom-[28%] text-xl text-[#8cc9ad]/55">
          ♥
        </div>

        {/* =======================================================
            DOODLE AFFIRMATIONS
        ======================================================= */}
        <div className="absolute left-[3%] top-[14%] rotate-[-7deg] text-center font-serif text-lg leading-tight text-[#756bd0]/55 sm:left-[7%] sm:text-xl">
          Better
          <br />
          Days
          <br />
          Ahead
          <span className="block mt-1 text-sm">♥</span>
        </div>

        <div className="absolute right-[3%] top-[28%] rotate-[7deg] text-center font-serif text-lg leading-tight text-[#68a88c]/60 sm:right-[7%] sm:text-xl">
          Small
          <br />
          Steps
          <br />
          Big
          <br />
          Changes
          <span className="block mt-1 text-sm">♥</span>
        </div>

        <div className="absolute bottom-[8%] left-[5%] rotate-[-5deg] text-center font-serif text-lg leading-tight text-[#756bd0]/50 sm:left-[9%] sm:text-xl">
          You
          <br />
          Are
          <br />
          Enough
          <span className="block mt-1 text-sm">♥</span>
        </div>

        {/* subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-lg animate-scale-in">

          {/* =====================================================
              SAATHI BRANDING
          ===================================================== */}
          <div className="mb-7 text-center sm:mb-8">

            {/* Lotus */}
            <div className="mx-auto mb-2 h-20 w-24 sm:h-24 sm:w-28">
              <svg
                viewBox="0 0 240 170"
                className="h-full w-full overflow-visible"
                aria-label="Saathi lotus"
                role="img"
              >
                {/* left petal */}
                <path
                  d="M116 128C92 130 67 124 50 108C41 99 35 87 32 74C55 70 78 74 96 86C109 95 115 111 116 128Z"
                  fill="#c75edc"
                  stroke="#8d8ae8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* right petal */}
                <path
                  d="M124 128C148 130 173 124 190 108C199 99 205 87 208 74C185 70 162 74 144 86C131 95 125 111 124 128Z"
                  fill="#c75edc"
                  stroke="#8d8ae8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* inner left */}
                <path
                  d="M119 128C101 118 85 104 79 86C74 69 78 51 89 37C105 49 115 66 119 85C122 101 121 116 119 128Z"
                  fill="#c45bdb"
                  stroke="#8d8ae8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* inner right */}
                <path
                  d="M121 128C139 118 155 104 161 86C166 69 162 51 151 37C135 49 125 66 121 85C118 101 119 116 121 128Z"
                  fill="#c45bdb"
                  stroke="#8d8ae8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* small left */}
                <path
                  d="M116 91C105 82 99 70 100 57C101 47 106 37 112 29C119 40 122 52 121 65C120 75 118 84 116 91Z"
                  fill="#c960dd"
                  stroke="#8d8ae8"
                  strokeWidth="2"
                />

                {/* small right */}
                <path
                  d="M124 91C135 82 141 70 140 57C139 47 134 37 128 29C121 40 118 52 119 65C120 75 122 84 124 91Z"
                  fill="#c960dd"
                  stroke="#8d8ae8"
                  strokeWidth="2"
                />

                {/* center */}
                <path
                  d="M120 134C101 116 94 97 94 79C94 57 105 36 120 20C135 36 146 57 146 79C146 97 139 116 120 134Z"
                  fill="#c65ddb"
                  stroke="#8d8ae8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-semibold tracking-[0.12em] text-[#34435d] sm:text-4xl">
              SAATHI
            </h1>

            <p className="mt-2 text-sm font-medium tracking-wide text-[#66758f] sm:text-base">
              Your Companion in Mental Wellness
            </p>
          </div>

          {/* =====================================================
              AUTH CARD
          ===================================================== */}
          <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_25px_80px_rgba(79,72,140,0.18)] backdrop-blur-2xl">

            {/* subtle top highlight */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#c77ee9] via-[#8d82ee] to-[#79cdb0]" />

            <CardHeader className="px-7 pb-5 pt-8 text-center sm:px-10 sm:pt-10">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#eee9ff] text-[#8b7de5]">
                <Sparkles className="h-5 w-5" />
              </div>

              <CardTitle className="text-3xl font-semibold tracking-tight text-[#35445e]">
                Get Started
              </CardTitle>

              <CardDescription className="mt-2 text-sm text-[#71809a] sm:text-base">
                Create an account or sign in to continue your journey
              </CardDescription>
            </CardHeader>

            <CardContent className="px-7 pb-8 sm:px-10 sm:pb-10">

              <Tabs defaultValue="login" className="w-full">

                {/* =================================================
                    TABS
                ================================================= */}
                <TabsList className="mb-7 grid h-14 w-full grid-cols-2 rounded-2xl bg-[#eef2f7]/90 p-1.5">
                  <TabsTrigger
                    value="login"
                    className="h-full rounded-xl text-base font-semibold text-[#6b7b95] transition-all data-[state=active]:bg-white data-[state=active]:text-[#6552d6] data-[state=active]:shadow-[0_5px_18px_rgba(96,82,190,0.12)]"
                  >
                    Login
                  </TabsTrigger>

                  <TabsTrigger
                    value="signup"
                    className="h-full rounded-xl text-base font-semibold text-[#6b7b95] transition-all data-[state=active]:bg-white data-[state=active]:text-[#6552d6] data-[state=active]:shadow-[0_5px_18px_rgba(96,82,190,0.12)]"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* =================================================
                    LOGIN
                ================================================= */}
                <TabsContent value="login" className="space-y-4">

                  <div className="space-y-4">

                    <div className="group relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71809a] transition-colors group-focus-within:text-[#7564df]" />

                      <Input
                        placeholder="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 rounded-2xl border-[#d9e2ef] bg-white/75 pl-12 text-base text-[#35445e] shadow-none transition-all placeholder:text-[#8794a9] focus:border-[#a896f0] focus:bg-white focus:ring-4 focus:ring-[#a896f0]/10"
                      />
                    </div>

                    <div className="group relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71809a] transition-colors group-focus-within:text-[#7564df]" />

                      <Input
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 rounded-2xl border-[#d9e2ef] bg-white/75 pl-12 pr-12 text-base text-[#35445e] shadow-none transition-all placeholder:text-[#8794a9] focus:border-[#a896f0] focus:bg-white focus:ring-4 focus:ring-[#a896f0]/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8190a5] transition-colors hover:text-[#6655d5]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm font-medium text-[#765de0] transition-colors hover:text-[#5f49c9]"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      onClick={() => handleAuth('login')}
                      disabled={isLoading}
                      className="group h-14 w-full rounded-2xl border-0 bg-gradient-to-r from-[#b76ce4] via-[#876cf0] to-[#687eea] text-base font-semibold text-white shadow-[0_12px_25px_rgba(119,94,218,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(119,94,218,0.34)]"
                    >
                      {isLoading ? (
                        'Signing In...'
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Sign In
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* =================================================
                    SIGNUP
                ================================================= */}
                <TabsContent value="signup" className="space-y-4">

                  <div className="space-y-4">

                    <div className="group relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71809a] transition-colors group-focus-within:text-[#7564df]" />

                      <Input
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-14 rounded-2xl border-[#d9e2ef] bg-white/75 pl-12 text-base text-[#35445e] shadow-none transition-all placeholder:text-[#8794a9] focus:border-[#a896f0] focus:bg-white focus:ring-4 focus:ring-[#a896f0]/10"
                      />
                    </div>

                    <div className="group relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71809a] transition-colors group-focus-within:text-[#7564df]" />

                      <Input
                        placeholder="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 rounded-2xl border-[#d9e2ef] bg-white/75 pl-12 text-base text-[#35445e] shadow-none transition-all placeholder:text-[#8794a9] focus:border-[#a896f0] focus:bg-white focus:ring-4 focus:ring-[#a896f0]/10"
                      />
                    </div>

                    <div className="group relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71809a] transition-colors group-focus-within:text-[#7564df]" />

                      <Input
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 rounded-2xl border-[#d9e2ef] bg-white/75 pl-12 pr-12 text-base text-[#35445e] shadow-none transition-all placeholder:text-[#8794a9] focus:border-[#a896f0] focus:bg-white focus:ring-4 focus:ring-[#a896f0]/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8190a5] transition-colors hover:text-[#6655d5]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <Button
                      onClick={() => handleAuth('signup')}
                      disabled={isLoading}
                      className="group h-14 w-full rounded-2xl border-0 bg-gradient-to-r from-[#b76ce4] via-[#876cf0] to-[#687eea] text-base font-semibold text-white shadow-[0_12px_25px_rgba(119,94,218,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(119,94,218,0.34)]"
                    >
                      {isLoading ? (
                        'Creating Account...'
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Create Account
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* ===================================================
                  SOCIAL LOGIN
              =================================================== */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#dbe2ed]" />
                <span className="text-xs font-medium uppercase tracking-wider text-[#8794a9]">
                  or continue with
                </span>
                <div className="h-px flex-1 bg-[#dbe2ed]" />
              </div>

              <div className="grid grid-cols-2 gap-3">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleOAuth('google')}
                  className="h-12 rounded-xl border-[#d9e2ef] bg-white/70 text-sm font-medium text-[#4d5c74] shadow-none transition-all hover:-translate-y-0.5 hover:border-[#c5b9f1] hover:bg-white hover:shadow-md"
                >
                  <span className="mr-2 text-base font-bold">G</span>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleOAuth('apple')}
                  className="h-12 rounded-xl border-[#d9e2ef] bg-white/70 text-sm font-medium text-[#4d5c74] shadow-none transition-all hover:-translate-y-0.5 hover:border-[#c5b9f1] hover:bg-white hover:shadow-md"
                >
                  <span className="mr-2 text-lg"></span>
                  Apple
                </Button>

              </div>

              {/* ===================================================
                  GUEST
              =================================================== */}
              <div className="mt-5">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="h-12 w-full rounded-xl bg-[#e5f4ed]/70 text-sm font-semibold text-[#4e8d75] transition-all hover:bg-[#d8eee3] hover:text-[#39745e]"
                >
                  <User className="mr-2 h-4 w-4" />
                  Continue as Guest
                </Button>
              </div>

              {/* tiny brand detail */}
              <div className="mt-7 flex items-center justify-center gap-3 opacity-50">
                <div className="h-px w-12 bg-[#9b8de2]" />
                <span className="text-sm text-[#8b7de5]">✦</span>
                <div className="h-px w-12 bg-[#9b8de2]" />
              </div>

            </CardContent>
          </Card>

          {/* Bottom reassurance */}
          <p className="mt-5 text-center text-xs font-medium tracking-wide text-[#66758f]/75">
            A little step toward feeling better 🌿
          </p>

        </div>
      </div>
    </main>
  );
};

export default AuthScreen;
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
