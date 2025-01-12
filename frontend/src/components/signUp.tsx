'use client'

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"
import { Apple, ChromeIcon as Google, Facebook } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"

import logo from '@/assets/form.svg'

export function SignUpForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const { toast } = useToast(); 

    const handleSubmit = async () => {
        try {
            if (!name || !email || !password) {
                toast({
                    title: "Missing information",
                    description: "Please fill in all fields",
                    variant: "destructive"
                })
                return;
            }

            toast({
                title: "Creating account",
                description: "Please wait...",
            })

            const response = await axios.post("http://localhost:3001/api/users/register", {
                name,
                email,
                password,
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                toast({
                    title: "Account created",
                    description: "You have successfully created an account",
                })
                const { token, userId } = response.data;
                Cookies.set('token', token, { expires: 7, secure: true });
                Cookies.set('user', userId, { expires: 7, secure: true });
                setUser(userId);
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to create account. Please try again.",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <div className={cn("flex flex-col gap-6", className)} {...props}>
                    <Card className="overflow-hidden bg-gray-800 border-gray-700">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col items-center text-center">
                                        <h1 className="text-2xl font-bold text-white">Create an account</h1>
                                        <p className="text-balance text-gray-400">
                                            Sign up for your Acme Inc account
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-gray-300">Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                    <Button onClick={handleSubmit} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        Create Account
                                    </Button>
                                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-600">
                                        <span className="relative z-10 bg-gray-800 px-2 text-gray-400">
                                            Or continue with
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                                            <Apple className="h-5 w-5" />
                                            <span className="sr-only">Sign up with Apple</span>
                                        </Button>
                                        <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                                            <Google className="h-5 w-5" />
                                            <span className="sr-only">Sign up with Google</span>
                                        </Button>
                                        <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                                            <Facebook className="h-5 w-5" />
                                            <span className="sr-only">Sign up with Facebook</span>
                                        </Button>
                                    </div>
                                    <div className="text-center text-sm text-gray-400">
                                        Already have an account?{" "}
                                        <Link to={'/signin'} className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                            Sign in
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="relative hidden bg-gray-700 md:block">
                                <img
                                    src={logo}
                                    alt="Sign up illustration"
                                    className="absolute inset-0 h-full w-full object-cover opacity-50 dark:brightness-[0.2] dark:grayscale"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="text-balance text-center text-xs text-gray-400 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-blue-400">
                        By clicking create account, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <a href="#">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    )
}

