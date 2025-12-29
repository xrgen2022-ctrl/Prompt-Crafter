import { useState, useRef, useEffect } from "react";
import { useMathQuestion, useSubmitAnswer } from "@/hooks/use-math";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, CheckCircle2, XCircle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export function MathGame() {
  const { data: questionData, isLoading, isError, refetch } = useMathQuestion();
  const { mutate: submitAnswer, isPending } = useSubmitAnswer();
  
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; coins: number } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, questionData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionData || !answer) return;

    submitAnswer(
      { questionId: questionData.id, answer: parseFloat(answer) },
      {
        onSuccess: (result) => {
          setAnswer("");
          setFeedback({
            correct: result.correct,
            message: result.correct ? "Correct!" : `Wrong! Answer was ${result.correctAnswer}`,
            coins: result.coinsChange
          });

          if (result.correct) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#8b5cf6', '#ec4899', '#06b6d4']
            });
          }

          // Clear feedback after 2 seconds
          setTimeout(() => {
            setFeedback(null);
          }, 2000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Generating problem...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center border-dashed border-2">
        <BrainCircuit className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-bold mb-2">Oops! Something went wrong.</h3>
        <Button onClick={() => refetch()} variant="outline">Try Again</Button>
      </Card>
    );
  }

  return (
    <div className="relative max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={cn(
              "absolute -top-24 left-0 right-0 z-10 p-4 rounded-xl text-center shadow-lg backdrop-blur-md border",
              feedback.correct 
                ? "bg-green-100/90 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-100" 
                : "bg-red-100/90 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-100"
            )}
          >
            <div className="flex items-center justify-center gap-2 font-bold text-xl">
              {feedback.correct ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              {feedback.message}
            </div>
            <div className="mt-1 font-mono text-sm opacity-80">
              {feedback.coins > 0 ? "+" : ""}{feedback.coins} coins
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="glass-card p-8 md:p-12 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center space-y-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              Solve this
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
              {questionData?.question}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto">
            <div className="relative group">
              <Input
                ref={inputRef}
                type="number"
                step="any"
                placeholder="?"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isPending || !!feedback}
                className="h-16 text-center text-3xl font-mono font-bold rounded-2xl border-2 border-border focus:border-primary transition-all shadow-sm group-hover:shadow-md"
                autoComplete="off"
              />
            </div>
            <Button 
              type="submit" 
              variant="game" 
              size="lg" 
              className="w-full rounded-xl"
              disabled={!answer || isPending || !!feedback}
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Submit Answer <Send className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 rounded bg-muted text-muted-foreground font-mono text-xs">Enter</kbd> to submit
          </p>
        </div>
      </Card>
    </div>
  );
}
