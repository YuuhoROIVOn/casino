import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaComments, FaHeadset, FaTimesCircle, FaPaperPlane, FaInfoCircle } from "react-icons/fa";

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  timestamp: Date;
}

interface Ticket {
  id: string;
  subject: string;
  userId: string;
  status: 'open' | 'pending' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export default function SupportChat() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: ""
  });
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  
  // Fetch user tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/support/tickets/user"],
    enabled: isAuthenticated && chatOpen,
  });
  
  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (messageEndRef.current && activeTicket) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTicket]);
  
  // Mock tickets for demo
  const mockTickets: Ticket[] = [
    {
      id: "1",
      subject: "Payment Issue",
      userId: user?.id || "1",
      status: "open",
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(),
      messages: [
        {
          id: "1",
          content: "I'm having issues with my $HOLOCOIN purchase. I tried to buy 5000 coins but it's not showing in my wallet.",
          isAdmin: false,
          timestamp: new Date(Date.now() - 86400000)
        },
        {
          id: "2",
          content: "Thank you for reporting this issue. Could you please provide the transaction ID from your purchase?",
          isAdmin: true,
          timestamp: new Date(Date.now() - 80000000)
        }
      ]
    },
    {
      id: "2",
      subject: "Game Freezing Issue",
      userId: user?.id || "1",
      status: "closed",
      createdAt: new Date(Date.now() - 386400000), // 4 days ago
      updatedAt: new Date(Date.now() - 286400000), // 3 days ago
      messages: [
        {
          id: "1",
          content: "The Plinko game keeps freezing when I try to play on my mobile device.",
          isAdmin: false,
          timestamp: new Date(Date.now() - 386400000)
        },
        {
          id: "2",
          content: "I'm sorry to hear you're experiencing issues. What browser and device are you using?",
          isAdmin: true,
          timestamp: new Date(Date.now() - 380000000)
        },
        {
          id: "3",
          content: "I'm using Chrome on an iPhone 13.",
          isAdmin: false,
          timestamp: new Date(Date.now() - 370000000)
        },
        {
          id: "4",
          content: "Thank you for the information. We've deployed a fix that should resolve the issue. Please try again and let us know if it's working properly now.",
          isAdmin: true,
          timestamp: new Date(Date.now() - 286400000)
        },
        {
          id: "5",
          content: "It's working now! Thank you for the quick fix.",
          isAdmin: false,
          timestamp: new Date(Date.now() - 280000000)
        }
      ]
    }
  ];
  
  // Create a new support ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string, message: string }) => {
      // In a real app, this would call an API endpoint
      // For now, just simulate a successful response
      return {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: Math.random().toString(36).substring(2, 9),
            content: data.message,
            isAdmin: false,
            timestamp: new Date()
          }
        ]
      };
    },
    onSuccess: (data) => {
      // In a real app, this would invalidate the tickets query
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted."
      });
      
      // Reset form
      setNewTicket({
        subject: "",
        message: ""
      });
      
      // Set as active ticket
      setActiveTicket(data as unknown as Ticket);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create ticket",
        variant: "destructive",
      });
    }
  });
  
  // Send a message in an existing ticket
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: string, message: string }) => {
      // In a real app, this would call an API endpoint
      // For now, just simulate a successful response
      return {
        id: Math.random().toString(36).substring(2, 9),
        content: data.message,
        isAdmin: false,
        timestamp: new Date()
      };
    },
    onSuccess: (data, variables) => {
      // In a real app, this would invalidate the ticket query
      if (activeTicket) {
        setActiveTicket({
          ...activeTicket,
          messages: [...activeTicket.messages, data as unknown as Message],
          updatedAt: new Date()
        });
      }
      
      // Reset message input
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    }
  });
  
  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }
    
    createTicketMutation.mutate(newTicket);
  };
  
  const handleSendMessage = () => {
    if (!newMessage || !activeTicket) return;
    
    sendMessageMutation.mutate({
      ticketId: activeTicket.id,
      message: newMessage
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Main chat button that opens the support panel
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 bg-primary shadow-lg hover:bg-primary/90"
          onClick={() => setChatOpen(true)}
        >
          <FaHeadset className="h-6 w-6" />
        </Button>
      </div>
      
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-[550px] h-[85vh] max-h-[700px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FaHeadset className="h-5 w-5 text-primary" />
                Support Chat
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setChatOpen(false)}
              >
                <FaTimesCircle className="h-5 w-5" />
              </Button>
            </div>
            <DialogDescription>
              Need help? Our support team is here to assist you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex h-[calc(100%-135px)]">
            {/* Tickets sidebar */}
            <div className="w-1/3 border-r overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Your Tickets</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <FaComments className="mr-1 h-3 w-3" /> New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Support Ticket</DialogTitle>
                      <DialogDescription>
                        Describe your issue and we'll help you resolve it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <Input
                          id="subject"
                          placeholder="Brief description of your issue"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                        <Textarea
                          id="message"
                          placeholder="Please provide details about your issue..."
                          value={newTicket.message}
                          onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                          className="h-32"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateTicket}>
                        Create Ticket
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2">
                {/* Use real tickets when available, mockTickets for demo */}
                {(tickets || mockTickets)?.map((ticket: Ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      activeTicket?.id === ticket.id 
                        ? 'bg-muted' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveTicket(ticket)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm truncate max-w-[120px]">
                        {ticket.subject}
                      </h4>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                
                {(!tickets && !mockTickets) && (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No tickets found
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat area */}
            <div className="w-2/3 flex flex-col">
              {activeTicket ? (
                <>
                  {/* Chat header */}
                  <div className="border-b p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{activeTicket.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activeTicket.status)}`}>
                        {activeTicket.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created on {new Date(activeTicket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.isAdmin 
                            ? 'bg-muted' 
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messageEndRef} />
                  </div>
                  
                  {/* Message input */}
                  {activeTicket.status !== 'closed' && (
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage}>
                          <FaPaperPlane className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                  <FaInfoCircle className="h-10 w-10 mb-4 opacity-25" />
                  <h3 className="font-medium">No ticket selected</h3>
                  <p className="text-sm mt-2 max-w-[200px]">
                    Select a ticket from the list or create a new one to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}