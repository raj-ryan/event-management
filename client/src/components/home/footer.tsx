import { Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Subscribed!",
      description: "You've been subscribed to our newsletter.",
    });
    
    setEmail("");
  };
  
  return (
    <footer className="bg-neutral-dark text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xl">E</span>
              </div>
              <span className="ml-2 text-xl font-heading font-bold">EventZen</span>
            </div>
            <p className="text-neutral-medium text-sm mb-4">
              Modern event management platform for venues, organizers, and attendees.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-medium hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-medium hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-medium hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">Event Planning Guide</a></li>
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-neutral-medium hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-neutral-medium">
                <Mail className="h-5 w-5 mr-2" />
                support@eventzen.com
              </li>
              <li className="flex items-center text-neutral-medium">
                <Phone className="h-5 w-5 mr-2" />
                (555) 123-4567
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="rounded-r-none text-foreground" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="rounded-l-none">
                  <span className="sr-only sm:not-sr-only sm:ml-2">Subscribe</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-muted pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-medium">© 2023 EventZen. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-medium hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-neutral-medium hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-neutral-medium hover:text-white text-sm transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
