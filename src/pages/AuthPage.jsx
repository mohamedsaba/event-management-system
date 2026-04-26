import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

import { signInSchema, signUpSchema } from "@/lib/schemas";

const tabAnimation = {
  initial: { opacity: 0, y: 15, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.3, ease: "easeOut" }
}

export default function AuthPage() {
  const [attempts, setAttempts] = useState(() => {
    return Number(localStorage.getItem("login_attempts")) || 0;
  });
  const [isLocked, setIsLocked] = useState(() => {
    const lockUntil = localStorage.getItem("login_lock_until");
    if (lockUntil && new Date(lockUntil) > new Date()) {
      return true;
    }
    return false;
  });
  const { login, signup, user } = useAuth();
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const fallbackMap = {
        'admin': '/admin/dashboard',
        'organizer': '/organizer/dashboard',
        'attendee': '/dashboard'
      };
      const from = location.state?.from?.pathname || fallbackMap[user.role] || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  useEffect(() => {
    if (isLocked) {
      const lockUntil = localStorage.getItem("login_lock_until");
      if (lockUntil) {
        const remaining = new Date(lockUntil).getTime() - new Date().getTime();
        if (remaining > 0) {
          const timer = setTimeout(() => {
            setIsLocked(false);
            localStorage.removeItem("login_lock_until");
            localStorage.setItem("login_attempts", "0");
            setAttempts(0);
          }, remaining);
          return () => clearTimeout(timer);
        } else {
          setIsLocked(false);
          localStorage.removeItem("login_lock_until");
          localStorage.setItem("login_attempts", "0");
          setAttempts(0);
        }
      }
    }
  }, [isLocked]);

  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  })

  const onSignInSubmit = async (data) => {
    if (isLocked) {
      toast.error("Too many attempts. Please wait 5 minutes.");
      return;
    }

    const toastId = toast.loading("Verifying credentials...");

    try {
      const response = await login(data.email, data.password);
      const user = response.user;
      
      setAttempts(0); 
      localStorage.setItem("login_attempts", "0");
      localStorage.removeItem("login_lock_until");
      
      toast.success(`Welcome back, ${user.username || user.email}!`, { id: toastId });

      const fallbackMap = {
        'admin': '/admin/dashboard',
        'organizer': '/organizer/dashboard',
        'attendee': '/dashboard'
      };
      const from = location.state?.from?.pathname || fallbackMap[user.role] || "/dashboard";
      
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 150);

    } catch (error) {
      toast.error("Invalid credentials", { id: toastId });
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("login_attempts", newAttempts.toString());

      if (newAttempts >= 5) {
        setIsLocked(true);
        const lockDuration = 5 * 60 * 1000;
        const lockUntil = new Date(Date.now() + lockDuration).toISOString();
        localStorage.setItem("login_lock_until", lockUntil);
        toast.error("Security Lock: Too many attempts. Try again in 5 minutes.");
      }
    }
  };

  const onSignUpSubmit = async (data) => {
    const toastId = toast.loading("Creating your account...");
    try {
      const response = await signup({
        username: data.username,
        email: data.email,
        password: data.password
      });
      toast.success("Account created successfully!", { id: toastId });
      
      const user = response.user;
      const fallbackMap = {
        'admin': '/admin/dashboard',
        'organizer': '/organizer/dashboard',
        'attendee': '/dashboard'
      };
      const from = location.state?.from?.pathname || fallbackMap[user.role] || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Signup failed. " + (error.response?.data?.message || ""), { id: toastId });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Venuva</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Secure your spot at the best events.</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-4">
            <motion.div {...tabAnimation}>
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signInForm}>
                    <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
                      <FormField
                        control={signInForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signInForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full mt-2">Sign In</Button>
                    </form>
                  </Form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Test Accounts</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Button variant="outline" type="button" size="sm" className="text-xs font-bold" onClick={() => {
                      signInForm.setValue('email', 'admin@test.com');
                      signInForm.setValue('password', 'admin123');
                    }}>
                      Admin
                    </Button>
                    <Button variant="outline" type="button" size="sm" className="text-xs font-bold" onClick={() => {
                      signInForm.setValue('email', 'organizer@test.com');
                      signInForm.setValue('password', 'organizer123');
                    }}>
                      Organizer
                    </Button>
                    <Button variant="outline" type="button" size="sm" className="text-xs font-bold" onClick={() => {
                      signInForm.setValue('email', 'attendee@test.com');
                      signInForm.setValue('password', 'attendee123');
                    }}>
                      Attendee
                    </Button>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" type="button" onClick={() => toast.info('Google login coming soon')} className="w-full flex-1">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" onClick={() => toast.info('Facebook login coming soon')} className="w-full flex-1">
                      <svg className="w-4 h-4 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <motion.div {...tabAnimation}>
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Enter your details below to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                      <FormField
                        control={signUpForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl><Input placeholder="johndoe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full mt-2">Create Account</Button>
                    </form>
                  </Form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" type="button" onClick={() => toast.info('Google signup coming soon')} className="w-full flex-1">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" onClick={() => toast.info('Facebook signup coming soon')} className="w-full flex-1">
                      <svg className="w-4 h-4 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

      </motion.div>
    </div>
  )
}