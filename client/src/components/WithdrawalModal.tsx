import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWithdrawal } from "@/hooks/use-withdrawals";
import { Coins, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface WithdrawalModalProps {
  maxAmount: number;
}

export function WithdrawalModal({ maxAmount }: WithdrawalModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const { mutate: createWithdrawal, isPending } = useCreateWithdrawal();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);

    if (isNaN(val) || val <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    if (val > maxAmount) {
      toast({
        title: "Insufficient funds",
        description: `You can only withdraw up to ${maxAmount} coins.`,
        variant: "destructive",
      });
      return;
    }

    createWithdrawal({ amount: val }, {
      onSuccess: () => {
        setOpen(false);
        setAmount("");
        toast({
          title: "Request Submitted!",
          description: "Your withdrawal request is pending approval.",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full sm:w-auto font-bold gap-2">
          <Coins className="w-4 h-4" />
          Request Withdrawal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Request Withdrawal</DialogTitle>
          <DialogDescription>
            Convert your earned coins into cash. Current balance: <span className="font-bold text-primary">{maxAmount} coins</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Withdrawal Amount</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0"
                className="pl-9 h-12 text-lg font-mono"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                max={maxAmount}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">Max: {maxAmount}</p>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-bold" 
            disabled={isPending || maxAmount === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Withdrawal"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
