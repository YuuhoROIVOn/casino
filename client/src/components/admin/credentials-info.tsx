import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaInfoCircle, FaUserShield, FaHeadset } from "react-icons/fa";

export default function CredentialsInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaInfoCircle className="text-primary" />
          Access Information
        </CardTitle>
        <CardDescription>
          Use these credentials to access the admin or operator panel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <div className="flex items-start gap-3">
            <FaUserShield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <AlertTitle className="text-base">Administrator Access</AlertTitle>
              <AlertDescription>
                <div className="mt-1 space-y-1">
                  <div><strong>Username:</strong> admin</div>
                  <div><strong>Password:</strong> hololive123</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Full access to all management features including NFT creation, game odds configuration, and user management.
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
        
        <Alert>
          <div className="flex items-start gap-3">
            <FaHeadset className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <AlertTitle className="text-base">Operator Access</AlertTitle>
              <AlertDescription>
                <div className="mt-1 space-y-1">
                  <div><strong>Username:</strong> operator</div>
                  <div><strong>Password:</strong> support123</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Limited access for support staff to handle customer queries, monitor activity, and respond to support tickets.
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}