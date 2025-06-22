import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BookOpen, List, BarChart3, Search, Settings, LogOut, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { View } from '@/components/dashboard'
import { cn } from '@/lib/utils'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, signOut } = useAuth()
  const menuItems = [
    { icon: BookOpen, label: 'Write', view: 'write' as View },
    { icon: List, label: 'Timeline', view: 'timeline' as View }, // Use List instead of Timeline
    { icon: BarChart3, label: 'Analytics', view: 'analytics' as View },
    { icon: Search, label: 'Search', view: 'search' as View },
  ]

  return (
    <div className={cn(
      "flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
            {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-primary" />
                <Heart className="h-4 w-4 text-accent absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  LifeBook
                </h1>
                <p className="text-xs text-muted-foreground">Your AI Journal</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Keep writing your story</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.view}
            variant={currentView === item.view ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              collapsed ? "px-2" : "px-4"
            )}
            onClick={() => onViewChange(item.view)}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* AI Insight */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Insight</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your recent entries show growing optimism. Keep reflecting on positive moments!
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            collapsed ? "px-2" : "px-4"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Settings</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive",
            collapsed ? "px-2" : "px-4"
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
