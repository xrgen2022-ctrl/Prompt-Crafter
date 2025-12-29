import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-glow delay-1000" />
      </div>

      <div className="relative z-10 container px-4 mx-auto text-center space-y-8 max-w-3xl">
        <div className="inline-flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 mb-4 animate-float">
          <Brain className="w-16 h-16 text-primary" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground">
          Master Math. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary">
            Earn Rewards.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
          Solve generated math problems, collect coins for correct answers, and climb the leaderboard.
        </p>

        <div className="pt-8">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full text-lg h-16 px-10 gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <a href="/api/login">
              <Button size="lg" className="rounded-full text-lg h-16 px-10 gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
                Start Playing Now <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          )}
        </div>
        
        <div className="pt-12 grid grid-cols-3 gap-8 text-center opacity-80">
          <div>
            <h3 className="text-3xl font-bold font-display">10k+</h3>
            <p className="text-sm text-muted-foreground">Problems Solved</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold font-display">24/7</h3>
            <p className="text-sm text-muted-foreground">Always Online</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold font-display">100%</h3>
            <p className="text-sm text-muted-foreground">Free to Join</p>
          </div>
        </div>
      </div>
    </div>
  );
}
