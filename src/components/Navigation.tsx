import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Home, Search, User, MessageCircle, Bell, LogOut, Users, Ghost, BarChart3, Plus, LayoutDashboard } from "lucide-react";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '@/components/NotificationCenter';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, getDashboardUrl } = useAuth();
  // Temporarily disable messaging to prevent login errors
  // const { unreadCount } = useMessaging();
  const unreadCount = 0; // Placeholder until messaging is properly implemented

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-ghana rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-ghana bg-clip-text text-transparent">
              HostelPadi
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Show Home, Find Hostels, and Quiz only for non-landlords */}
            {(!user || profile?.user_type !== 'landlord') && (
              <>
                <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
                  Home
                </Link>
                <Link to="/search" className="text-foreground hover:text-primary transition-colors font-medium">
                  Find Hostels
                </Link>
              </>
            )}
            {user && (
              <Link 
                to={getDashboardUrl()} 
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
            {(!user || profile?.user_type !== 'landlord') && (
              <Link to="/personality-quiz" className="text-foreground hover:text-primary transition-colors font-medium">
                Quiz
              </Link>
            )}
            <Link to="/list-property" className="text-foreground hover:text-primary transition-colors font-medium">
              List Property
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {profile?.full_name || user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {profile?.user_type === 'student' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard">My Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/buddy-system" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Buddy System
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/messages" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Messages
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1 flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {profile?.user_type === 'landlord' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/landlord-dashboard">My Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/my-properties" className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            My Properties
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/list-property" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            List Property
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {profile?.user_type === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin-analytics" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">
                    Log In
                  </Link>
                </Button>
                <Button variant="ghana" asChild>
                  <Link to="/auth?mode=signup">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-white/95 backdrop-blur-md">
            <div className="space-y-4">
              {/* Show Home, Find Hostels, and Quiz only for non-landlords */}
              {(!user || profile?.user_type !== 'landlord') && (
                <>
                  <Link to="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                  <Link to="/search" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                    <Search className="h-4 w-4" />
                    <span>Find Hostels</span>
                  </Link>
                </>
              )}
              {user && (
                <Link 
                  to={getDashboardUrl()} 
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2" 
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              {(!user || profile?.user_type !== 'landlord') && (
                <Link to="/personality-quiz" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                  <User className="h-4 w-4" />
                  <span>Personality Quiz</span>
                </Link>
              )}
              <Link to="/horror-stories" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                <Ghost className="h-4 w-4" />
                <span>Horror Stories</span>
              </Link>
              <Link to="/list-property" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                <User className="h-4 w-4" />
                <span>List Property</span>
              </Link>
              <Link to="/about" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                <MessageCircle className="h-4 w-4" />
                <span>About</span>
              </Link>
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-foreground/60">
                      Welcome, {profile?.full_name || user.email}
                    </div>
                    {profile?.user_type === 'student' && (
                      <>
                        <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                          <Link to="/dashboard">
                            <User className="h-4 w-4 mr-2" />
                            My Dashboard
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                          <Link to="/buddy-system">
                            <Users className="h-4 w-4 mr-2" />
                            Buddy System
                          </Link>
                        </Button>
                      </>
                    )}
                    {profile?.user_type === 'landlord' && (
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link to="/landlord-dashboard">
                          <User className="h-4 w-4 mr-2" />
                          My Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/auth">
                        Log In
                      </Link>
                    </Button>
                    <Button variant="ghana" className="w-full" asChild>
                      <Link to="/auth?mode=signup">
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;