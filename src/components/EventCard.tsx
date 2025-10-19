import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status?: string;
}

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const startDate = event.start.dateTime || event.start.date;
  const endDate = event.end.dateTime || event.end.date;
  
  const formattedDate = startDate 
    ? format(new Date(startDate), "dd 'de' MMMM", { locale: ptBR })
    : "";
    
  const formattedTime = event.start.dateTime
    ? `${format(new Date(event.start.dateTime), "HH:mm", { locale: ptBR })} - ${format(new Date(endDate!), "HH:mm", { locale: ptBR })}`
    : "Dia inteiro";

  return (
    <Card className="hover:shadow-[var(--shadow-card)] transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-secondary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">
            {event.summary}
          </CardTitle>
          {event.status === "confirmed" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Confirmado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-accent" />
            <span>{formattedTime}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
