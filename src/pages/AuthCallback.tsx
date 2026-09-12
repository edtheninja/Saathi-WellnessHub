import { useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";


const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const oauthToken = new URLSearchParams(window.location.search).get("oauth_token");
    if (oauthToken) {
      localStorage.setItem("saathi_access_token", oauthToken);
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify({ user: data.user }));
          navigate("/dashboard", { replace: true });
        }
      });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return <p>Verifying email...</p>;
  
};

export default AuthCallback;
