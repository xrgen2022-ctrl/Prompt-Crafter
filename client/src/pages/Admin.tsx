import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWithdrawals, useApproveWithdrawal, useDenyWithdrawal } from "@/hooks/use-withdrawals";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ShieldAlert,
  Save,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-display font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Section */}
          <div className="lg:col-span-1">
            <SettingsPanel />
          </div>

          {/* Withdrawals Section */}
          <div className="lg:col-span-2">
            <WithdrawalsList />
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingsPanel() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    rewardAmount: 0,
    penaltyAmount: 0,
    conversionRate: 0
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        rewardAmount: settings.rewardAmount,
        penaltyAmount: settings.penaltyAmount,
        conversionRate: settings.conversionRate
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData, {
      onSuccess: () => {
        toast({ title: "Settings Updated", description: "Game parameters have been updated." });
      }
    });
  };

  if (isLoading) return <Card className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></Card>;

  return (
    <Card className="h-full border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Reward per Correct Answer</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Coins</span>
              <Input 
                type="number" 
                className="pl-14"
                value={formData.rewardAmount}
                onChange={e => setFormData({...formData, rewardAmount: parseInt(e.target.value)})}
              />
            </div>
            <p className="text-xs text-muted-foreground">Coins earned for each correct answer.</p>
          </div>

          <div className="space-y-3">
            <Label>Penalty per Wrong Answer</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Coins</span>
              <Input 
                type="number" 
                className="pl-14"
                value={formData.penaltyAmount}
                onChange={e => setFormData({...formData, penaltyAmount: parseInt(e.target.value)})}
              />
            </div>
            <p className="text-xs text-muted-foreground">Coins deducted for each wrong answer.</p>
          </div>

          <div className="space-y-3">
            <Label>Conversion Rate (Coins → $1)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">1 USD = </span>
              <Input 
                type="number" 
                className="pl-20"
                value={formData.conversionRate}
                onChange={e => setFormData({...formData, conversionRate: parseInt(e.target.value)})}
              />
            </div>
            <p className="text-xs text-muted-foreground">How many coins equal $1.00 USD withdrawal.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WithdrawalsList() {
  const { data: withdrawals, isLoading } = useWithdrawals();
  const { mutate: approve, isPending: approving } = useApproveWithdrawal();
  const { mutate: deny, isPending: denying } = useDenyWithdrawal();
  const { toast } = useToast();

  if (isLoading) return <Card className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></Card>;

  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'pending') || [];
  const historyWithdrawals = withdrawals?.filter(w => w.status !== 'pending') || [];

  return (
    <div className="space-y-8">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            Pending Requests ({pendingWithdrawals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
              No pending withdrawals
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-background border rounded-lg gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={request.user.profileImageUrl || "https://ui-avatars.com/api/?name=User"} 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-bold">{request.user.firstName} {request.user.lastName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {request.createdAt ? format(new Date(request.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right mr-4">
                      <p className="font-mono font-bold text-lg">{request.amount} Coins</p>
                      <p className="text-xs text-muted-foreground">Pending Review</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        onClick={() => approve(request.id, {
                          onSuccess: () => toast({ title: "Approved", description: "Withdrawal approved successfully." })
                        })}
                        disabled={approving || denying}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => deny(request.id, {
                          onSuccess: () => toast({ title: "Denied", description: "Withdrawal denied successfully." })
                        })}
                        disabled={approving || denying}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm opacity-80">
        <CardHeader>
          <CardTitle className="text-lg">History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {historyWithdrawals.map((request) => (
              <div key={request.id} className="flex justify-between items-center p-3 text-sm border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === 'approved' ? 'default' : 'destructive'} className="capitalize">
                    {request.status}
                  </Badge>
                  <span className="font-medium">{request.user.firstName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono">{request.amount} Coins</span>
                  <span className="text-muted-foreground text-xs">
                    {request.createdAt ? format(new Date(request.createdAt), 'MMM d') : '-'}
                  </span>
                </div>
              </div>
            ))}
            {historyWithdrawals.length === 0 && (
              <p className="text-sm text-muted-foreground">No historical records found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
