import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import saathiLogo from '@/assets/saathi-logo.png';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-calm flex flex-col items-center justify-center px-8 animate-fade-in">
      <div className="text-center space-y-8">
        <div className="animate-float">
          <img 
            src={saathiLogo} 
            alt="SAATHI Logo" 
            className="w-32 h-32 mx-auto drop-shadow-soft"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary-foreground tracking-wide">
            SAATHI
          </h1>
          
          <p className="text-lg text-primary-foreground/90 max-w-sm mx-auto leading-relaxed">
            Your Companion in Mental Wellness
          </p>
        </div>

        <div className="animate-breathe">
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;