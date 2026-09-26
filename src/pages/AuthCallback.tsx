import { useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash
    );

    const token =
      searchParams.get("oauth_token") ||
      searchParams.get("token") ||
      searchParams.get("access_token") ||
      hashParams.get("access_token");

    if (token) {
      localStorage.setItem("saathi_access_token", token);
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (data?.user) {
            localStorage.setItem("user", JSON.stringify({ user: data.user }));
          }
          navigate("/dashboard", { replace: true });
        })
        .catch(() => {
          navigate("/dashboard", { replace: true });
        });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }).catch(() => {
      navigate("/auth", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
        <p className="text-sm font-medium text-muted-foreground">Authenticating your wellness journey...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
