import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateWithdrawal } from "@/hooks/use-withdrawals";
import { Coins, Loader2, CreditCard, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalModalProps {
  maxAmount: number;
}

export function WithdrawalModal({ maxAmount }: WithdrawalModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"GCash" | "Maya" | "">("");
  const [accountDetails, setAccountDetails] = useState<string>("");
  
  const { mutate: createWithdrawal, isPending } = useCreateWithdrawal();
  const { toast } = useToast();

  const resetForm = () => {
    setStep(1);
    setAmount("");
    setPaymentMode("");
    setAccountDetails("");
  };

  const handleNext = () => {
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
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMode) {
      toast({
        title: "Payment mode required",
        description: "Please select a payment mode.",
        variant: "destructive",
      });
      return;
    }

    if (!accountDetails) {
      toast({
        title: "Account details required",
        description: "Please provide your account details.",
        variant: "destructive",
      });
      return;
    }

    createWithdrawal({ 
      amount: parseInt(amount), 
      paymentMode: paymentMode as "GCash" | "Maya", 
      accountDetails 
    }, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
        toast({
          title: "Request Submitted!",
          description: `${amount} Coins have been deducted from your balance. The project owner will approve the payout shortly.`,
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
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetForm();
    }}>
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
            {step === 1 
              ? `Convert your earned coins into cash. Current balance: ${maxAmount} coins`
              : `Select your preferred payment method for ${amount} Coins.`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 pt-4">
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
              onClick={handleNext}
              className="w-full h-12 text-lg font-bold" 
              disabled={maxAmount === 0 || !amount}
            >
              Next
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={(val: any) => setPaymentMode(val)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select GCash or Maya" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GCash">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        GCash
                      </div>
                    </SelectItem>
                    <SelectItem value="Maya">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Maya
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMode && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="details">
                    {paymentMode === "GCash" ? "GCash Number" : "Maya Account Details"}
                  </Label>
                  <Input
                    id="details"
                    placeholder={paymentMode === "GCash" ? "0917XXXXXXX" : "Mobile number or email"}
                    className="h-12"
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-[2] h-12 text-lg font-bold" 
                disabled={isPending || !paymentMode || !accountDetails}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
