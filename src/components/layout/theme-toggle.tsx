
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useSidebar } from "../ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const [theme, setThemeState] = React.useState<"theme-light" | "dark" | "system">("theme-light")
  const { state, isMobile } = useSidebar();

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setThemeState(isDarkMode ? "dark" : "theme-light")
  }, [])

  React.useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
  }, [theme])
  
  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'dark' ? 'theme-light' : 'dark')
  }

  const isCollapsed = state === 'collapsed' && !isMobile;

  return (
    <Button variant="outline" className={cn("w-full justify-start", isCollapsed && "justify-center")} size={isCollapsed ? 'icon' : 'default'} onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {!isCollapsed && <span className="ml-2">Toggle theme</span>}
    </Button>
  )
}
