import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Admin credentials 
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

// Define login schema with userType
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["user", "admin"], {
    required_error: "You need to select a user type",
  }),
});

// Register schema from auth hook
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export default function AuthPage() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginWithGoogle, register: firebaseRegister, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      userType: "user",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    
    // Check if admin login
    if (values.userType === "admin") {
      if (values.username === ADMIN_CREDENTIALS.username && 
          values.password === ADMIN_CREDENTIALS.password) {
        // Admin login success
        setTimeout(() => {
          toast({
            title: "Admin Login Successful",
            description: "Welcome to the admin dashboard!",
          });
          setIsSubmitting(false);
          navigate("/dashboard?role=admin");
        }, 1500);
      } else {
        // Admin login failed
        setTimeout(() => {
          toast({
            title: "Admin Login Failed",
            description: "Invalid admin credentials",
            variant: "destructive",
          });
          setIsSubmitting(false);
        }, 1500);
      }
    } else {
      // Regular user login with Firebase (email login is disabled for now)
      setTimeout(() => {
        toast({
          title: "User Login",
          description: "Please use Google login for now",
        });
        setIsSubmitting(false);
      }, 1000);
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    setIsSubmitting(true);
    try {
      await firebaseRegister(values);
      toast({
        title: "Registration successful",
        description: "Welcome to EventZen!",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleGoogleLogin() {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Google login successful",
        description: "Welcome to EventZen!",
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Form Section */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">EventZen</h1>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Account Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="user" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                User
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="admin" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Admin
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                        {loginForm.watch("userType") === "admin" && (
                          <FormDescription>
                            Admin username: admin
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                        {loginForm.watch("userType") === "admin" && (
                          <FormDescription>
                            Admin password: admin123
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Sign In
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FcGoogle className="mr-2 h-4 w-4" />
                    )}
                    Sign in with Google
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormDescription>
                          At least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create Account
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or register with
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FcGoogle className="mr-2 h-4 w-4" />
                    )}
                    Register with Google
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-primary p-8 text-white">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Welcome to EventZen</h2>
          <p className="text-xl mb-8">
            The ultimate platform for event planning and venue booking.
          </p>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Discover and book amazing venues</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Create and manage your events</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Real-time updates and notifications</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Secure payment processing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}