import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your payment was cancelled. Your booking is still on hold for 24 hours if you'd like to complete it later.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link to="/student-dashboard">
                <RotateCcw className="h-4 w-4 mr-2" />
                Complete Payment Later
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/search">
                Continue Browsing
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}