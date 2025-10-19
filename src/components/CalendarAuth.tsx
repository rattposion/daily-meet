import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface CalendarAuthProps {
  onSignIn: (accessToken: string) => void;
  isSignedIn: boolean;
  onSignOut: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

export const CalendarAuth = ({ onSignIn, isSignedIn, onSignOut }: CalendarAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      // Initialize Google OAuth
      const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // User needs to configure this
      const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
      
      if (!window.google) {
        throw new Error("Google API not loaded");
      }
      
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            onSignIn(response.access_token);
          }
          setIsLoading(false);
        },
      });
      
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {!isSignedIn ? (
        <Button 
          onClick={handleSignIn} 
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {isLoading ? "Conectando..." : "Conectar ao Google Calendar"}
        </Button>
      ) : (
        <Button onClick={onSignOut} variant="outline">
          Desconectar
        </Button>
      )}
    </div>
  );
};
