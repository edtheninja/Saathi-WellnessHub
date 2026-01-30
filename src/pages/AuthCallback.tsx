import { useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";


const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard");
      }
    });
  }, []);

  return <p>Verifying email...</p>;
  
};

export default AuthCallback;
