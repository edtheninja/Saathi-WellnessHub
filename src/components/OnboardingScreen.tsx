import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';




const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Discover Inner Peace",
      description: "Start your mindfulness journey with guided meditations designed to calm your mind and reduce stress.",
      emoji: "🧘‍♀️",
      gradient: "bg-gradient-ocean"
    },
    {
      title: "Track Your Journey",
      description: "Monitor your mood patterns and emotional wellness with our easy-to-use daily tracking tools.",
      emoji: "📊",
      gradient: "bg-gradient-mint"
    },
    {
      title: "Express Yourself",
      description: "Write down your thoughts and feelings in a safe, private space that's always available to you.",
      emoji: "✍️",
      gradient: "bg-gradient-peaceful"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/auth');
    }
  }; 

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className={`min-h-screen ${slides[currentSlide].gradient} flex flex-col justify-between px-8 py-12`}>
      {/* Skip Button */}
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          onClick={skipToAuth}
          className="text-primary-foreground/80 hover:text-primary-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
        <div className="text-8xl animate-float">
          {slides[currentSlide].emoji}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-primary-foreground max-w-sm">
            {slides[currentSlide].title}
          </h2>
          
          <p className="text-lg text-primary-foreground/90 max-w-md leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-primary-foreground' 
                  : 'bg-primary-foreground/40'
              }`}
            />
          ))}
        </div>
      </div> 

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-primary-foreground/80 hover:text-primary-foreground disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </Button>

        <Button
          onClick={nextSlide}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-soft"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          {currentSlide < slides.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
        </Button>
      </div>
    </div>
  );
}; 
export default OnboardingScreen;