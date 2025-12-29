import { useAuth } from "@/hooks/use-auth";
import { useUserStats } from "@/hooks/use-user-stats";
import { MathGame } from "@/components/MathGame";
import { StatCard } from "@/components/StatCard";
import { WithdrawalModal } from "@/components/WithdrawalModal";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Coins, 
  Brain, 
  Trophy, 
  Target,
  LayoutDashboard
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { data: stats, isLoading: isStatsLoading } = useUserStats();
  
  const isLoading = isAuthLoading || isStatsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-float">
          <Brain className="w-16 h-16 text-primary mb-4 mx-auto" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading MathVerse...</p>
        </div>
      </div>
    );
  }

  // Safe fallback for stats if loading fails or initial state
  const coins = stats?.coins ?? 0;
  const totalAnswers = stats?.totalAnswers ?? 0;
  const correctAnswers = stats?.correctAnswers ?? 0;
  const accuracy = totalAnswers > 0 
    ? Math.round((correctAnswers / totalAnswers) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              MathVerse
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}
            
            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <img 
                src={user?.profileImageUrl || "https://ui-avatars.com/api/?name=User"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-border"
              />
              <span className="hidden md:block text-sm font-medium">{user?.firstName}</span>
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Ready to calculate, <span className="text-primary">{user?.firstName}</span>?
            </h2>
            <p className="text-muted-foreground text-lg">Solve problems, earn coins, climb the ranks.</p>
          </div>
          <WithdrawalModal maxAmount={coins} />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Current Balance" 
            value={coins} 
            icon={Coins} 
            color="text-yellow-500 bg-yellow-500/10"
            className="border-yellow-500/20"
          />
          <StatCard 
            label="Total Solved" 
            value={totalAnswers} 
            icon={Target} 
            color="text-blue-500 bg-blue-500/10" 
          />
          <StatCard 
            label="Accuracy" 
            value={`${accuracy}%`} 
            icon={Trophy} 
            color="text-purple-500 bg-purple-500/10" 
          />
          <StatCard 
            label="Correct Answers" 
            value={correctAnswers} 
            icon={CheckCircle2} 
            color="text-green-500 bg-green-500/10" 
          />
        </section>

        {/* Game Area */}
        <section className="py-8">
          <MathGame />
        </section>
      </main>
    </div>
  );
}

// Helper icon component since it wasn't imported in StatCard above but used here
import { CheckCircle2 } from "lucide-react";
