import * as React from "react"
import { cn } from "@/lib/utils"

// Card
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl glass p-6 text-card-foreground", className)} {...props} />
))
Card.displayName = "Card"

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
        primary: "bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20",
        secondary: "glass-button",
        ghost: "hover:bg-white/10 text-white",
        danger: "bg-destructive hover:bg-destructive/80 text-white",
    }
    return (
        <button
            ref={ref}
            className={cn("inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95", variants[variant], className)}
            {...props}
        />
    )
})
Button.displayName = "Button"

// Input
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn("flex h-10 w-full rounded-lg glass-input px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className)}
        {...props}
    />
))
Input.displayName = "Input"

// Progress
const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: number }>(({ className, value, ...props }, ref) => (
    <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
        <div
            className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-out"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
))
Progress.displayName = "Progress"

export { Card, Button, Input, Progress }
