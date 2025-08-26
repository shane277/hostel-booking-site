import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const institutions = [
  { value: 'university_of_ghana', label: 'University of Ghana' },
  { value: 'kwame_nkrumah_university', label: 'Kwame Nkrumah University of Science and Technology' },
  { value: 'university_of_cape_coast', label: 'University of Cape Coast' },
  { value: 'ghana_institute_of_management', label: 'Ghana Institute of Management and Public Administration' },
  { value: 'university_of_professional_studies', label: 'University of Professional Studies, Accra' },
  { value: 'central_university', label: 'Central University' },
  { value: 'ashesi_university', label: 'Ashesi University' },
  { value: 'other', label: 'Other' }
];

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [userType, setUserType] = useState<'student' | 'landlord'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [institution, setInstitution] = useState('');
  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setActiveTab('signup');
    } else if (mode === 'reset') {
      setActiveTab('reset');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (!error) {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      user_type: userType,
      full_name: fullName,
      phone_number: phoneNumber,
      ...(userType === 'student' && {
        institution,
        student_id: studentId,
        program
      }),
      ...(userType === 'landlord' && {
        business_name: businessName
      })
    };

    const { error } = await signUp(email, password, userData);
    
    if (!error) {
      setActiveTab('login');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await resetPassword(resetEmail);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="backdrop-blur-sm bg-card/95 border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HostelPadi
            </CardTitle>
            <CardDescription>
              Your trusted student accommodation platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your.email@edu.gh"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-3">
                    <Label>I am a:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={userType === 'student' ? 'default' : 'outline'}
                        onClick={() => setUserType('student')}
                        className="text-sm"
                      >
                        Student
                      </Button>
                      <Button
                        type="button"
                        variant={userType === 'landlord' ? 'default' : 'outline'}
                        onClick={() => setUserType('landlord')}
                        className="text-sm"
                      >
                        Landlord
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input
                        id="full-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+233 XX XXX XXXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={userType === 'student' ? "your.email@edu.gh" : "your.email@domain.com"}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {userType === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Select value={institution} onValueChange={setInstitution} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your institution" />
                          </SelectTrigger>
                          <SelectContent>
                            {institutions.map((inst) => (
                              <SelectItem key={inst.value} value={inst.value}>
                                {inst.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-id">Student ID</Label>
                          <Input
                            id="student-id"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="e.g. 10123456"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="program">Program</Label>
                          <Input
                            id="program"
                            value={program}
                            onChange={(e) => setProgram(e.target.value)}
                            placeholder="e.g. Computer Science"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {userType === 'landlord' && (
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your business/property name"
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your.email@edu.gh"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('login')}
                      className="text-sm"
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}