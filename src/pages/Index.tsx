import { useState, useEffect } from "react";
import { CalendarAuth } from "@/components/CalendarAuth";
import { EventCard } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2 } from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status?: string;
}

const Index = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEvents = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
        new URLSearchParams({
          maxResults: "10",
          orderBy: "startTime",
          singleEvents: "true",
          timeMin: new Date().toISOString(),
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      setEvents(data.items || []);
      
      toast({
        title: "Eventos carregados!",
        description: `${data.items?.length || 0} agendamentos encontrados.`,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível conectar ao Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = (token: string) => {
    setAccessToken(token);
    fetchEvents(token);
  };

  const handleSignOut = () => {
    setAccessToken(null);
    setEvents([]);
    toast({
      title: "Desconectado",
      description: "Você foi desconectado do Google Calendar.",
    });
  };

  useEffect(() => {
    // Load Google API script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Hero Section */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-elegant)]">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Meus Agendamentos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie seus eventos do Google Calendar
                </p>
              </div>
            </div>
            
            <CalendarAuth
              onSignIn={handleSignIn}
              isSignedIn={!!accessToken}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!accessToken ? (
          <div className="max-w-2xl mx-auto text-center space-y-6 py-20">
            <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              Conecte-se ao Google Calendar
            </h2>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os seus agendamentos em um só lugar.
              Conecte sua conta do Google para começar.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center space-y-4 py-20">
            <p className="text-xl text-muted-foreground">
              Nenhum evento agendado encontrado.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                Próximos Eventos
              </h2>
              <span className="text-sm text-muted-foreground">
                {events.length} {events.length === 1 ? "evento" : "eventos"}
              </span>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Setup Instructions */}
      {!accessToken && (
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <h3 className="font-semibold text-lg mb-4">Configuração Necessária</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Para usar esta aplicação, você precisa:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Criar um projeto no Google Cloud Console</li>
                <li>Ativar a API do Google Calendar</li>
                <li>Criar credenciais OAuth 2.0</li>
                <li>Adicionar o Client ID no arquivo CalendarAuth.tsx</li>
              </ol>
              <p className="pt-2">
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Acessar Google Cloud Console →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
