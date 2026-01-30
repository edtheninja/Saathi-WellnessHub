import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User } from 'lucide-react';
import saathiLogo from '@/assets/saathi-logo.png';
import { supabase } from '@/supabaseClient';

const AuthScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

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
          data: {
           username: fullName, // 👈 THIS IS KEY
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
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
