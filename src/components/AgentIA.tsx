import * as React from "react";
import { 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Sparkles, 
  Wrench, 
  History,
  Lightbulb,
  Zap,
  Mic,
  Paperclip,
  Trash2,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AgentIA() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis l'Agent IA Hydromines, expert en maintenance d'engins miniers. Je peux vous aider pour un diagnostic moteur, un problème hydraulique ou un plan de maintenance préventive. Que puis-je faire pour vous aujourd'hui ?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Impossible de contacter l'IA. Vérifiez votre connexion.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Mon ST7 surchauffe après 2h d'utilisation",
    "Procédure vidange ST2D",
    "Consommation hydraulique excessive engine S-012",
    "Diagnostic perte de puissance moteur diesel"
  ];

  return (
    <div className="flex h-full bg-white font-sans text-slate-900 border-t border-slate-200">
      {/* Sidebar Histrorique IA */}
      <div className="hidden lg:flex flex-col w-72 border-r border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center gap-2 mb-8 p-2">
           <div className="h-8 w-8 rounded-lg bg-alert-orange/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-alert-orange fill-current" />
           </div>
           <span className="font-bold text-slate-900 tracking-tight text-sm uppercase">AGENT IA HYDROMINES</span>
        </div>
        
        <div className="space-y-6">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Interventions Récentes</p>
              <div className="space-y-1">
                 {[
                   "Surchauffe M-045",
                   "Injecteurs ST7-10",
                   "Circuit Hyd. Bou-Azzer"
                 ].map((hist, i) => (
                   <Button key={i} variant="ghost" className="w-full justify-start text-xs h-auto py-2 text-slate-600 hover:text-hydro hover:bg-white border-transparent hover:border-slate-100 border">
                      <History className="h-3 w-3 mr-2 opacity-50" /> {hist}
                   </Button>
                 ))}
              </div>
           </div>

           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recommandations IA</p>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                 <p className="text-[10px] text-hydro font-bold mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> ANALYSE AUTO
                 </p>
                 <p className="text-xs text-slate-600 leading-relaxed">
                    Le parc ST2G présente une anomalie de pression turbo récurrente ce mois-ci.
                 </p>
                 <Button variant="link" className="text-[10px] text-hydro p-0 h-auto mt-2">Détails <ChevronRight className="h-2 w-2" /></Button>
              </div>
           </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200">
           <Button variant="ghost" className="w-full justify-start text-xs text-slate-400 hover:text-red-500">
              <Trash2 className="h-3 w-3 mr-2" /> Effacer l'historique
           </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-alert-orange/20 shadow-sm">
                 <AvatarFallback className="bg-alert-orange/5 text-alert-orange">
                    <Bot className="h-6 w-6" />
                 </AvatarFallback>
              </Avatar>
              <div>
                 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Expert Mécanicien IA 
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] py-0 font-bold tracking-widest">IA ACTIVE</Badge>
                 </h3>
                 <p className="text-[10px] text-muted-foreground">
                    Spécialisé en engins miniers & Hydraulique lourde
                 </p>
              </div>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 h-8 text-xs font-medium shadow-sm">
                 <Wrench className="h-3 w-3 mr-1" /> Diagnostic Manuel
              </Button>
           </div>
        </header>

        <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-8">
           <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-4 items-start animate-in fade-in duration-500",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}>
                  <Avatar className={cn(
                    "h-8 w-8 border shrink-0",
                    message.role === "assistant" ? "border-alert-orange/20" : "border-hydro/20"
                  )}>
                    <AvatarFallback className={message.role === "assistant" ? "bg-alert-orange/5 text-alert-orange" : "bg-hydro/5 text-hydro"}>
                      {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "flex flex-col space-y-2 max-w-[85%]",
                    message.role === "user" ? "items-end" : ""
                  )}>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                      message.role === "assistant" 
                        ? "bg-slate-50 border border-slate-200 text-slate-800" 
                        : "bg-hydro text-white"
                    )}>
                       {message.content}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium px-2">
                       {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 items-start animate-pulse">
                   <div className="h-8 w-8 rounded-full bg-slate-100" />
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 w-32 h-10" />
                </div>
              )}

              {/* Suggestions for first prompt */}
              {messages.length === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 border-t border-dashed border-slate-100 mt-8">
                   {suggestions.map((s, i) => (
                      <Button 
                        key={i} 
                        variant="outline" 
                        className="justify-start border-slate-200 bg-white text-slate-600 hover:text-hydro hover:border-hydro/30 hover:bg-hydro/5 h-auto py-3 px-4 text-xs shadow-sm transition-all text-left whitespace-normal h-full"
                        onClick={() => setInput(s)}
                      >
                        <Lightbulb className="h-4 w-4 mr-3 text-alert-orange shrink-0" /> {s}
                      </Button>
                   ))}
                </div>
              )}
           </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100 bg-white">
           <div className="max-w-4xl mx-auto relative">
              <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-4 focus-within:border-hydro focus-within:bg-white focus-within:ring-4 focus-within:ring-hydro/5 transition-all shadow-sm">
                 <Input 
                   placeholder="Posez votre question technique..." 
                   className="border-none bg-transparent focus-visible:ring-0 text-slate-900 placeholder:text-slate-400 min-h-[44px] text-sm"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && handleSend()}
                 />
                 <div className="flex gap-1 pb-1 pr-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600">
                       <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600">
                       <Mic className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="h-9 w-9 bg-hydro hover:bg-hydro/90 text-white shadow-md disabled:bg-slate-200"
                      disabled={!input.trim() || isLoading}
                      onClick={handleSend}
                    >
                       <Send className="h-5 w-5" />
                    </Button>
                 </div>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                 L'IA Hydromines peut commettre des erreurs. Vérifiez les mesures réelles avant intervention.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
