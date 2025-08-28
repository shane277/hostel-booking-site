import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, ArrowLeft, Mail, Sparkles, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import ResendConfirmation from '@/components/ResendConfirmation';

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

const countryCodes = [
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+1', country: 'US/Canada', flag: '🇺🇸🇨🇦' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' }
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
  const [countryCode, setCountryCode] = useState('+233');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [institution, setInstitution] = useState('');
  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  
  // UI state
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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
      phone_number: `${countryCode} ${phoneNumber}`,
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
      setSignupSuccess(true);
      // Don't automatically switch tabs - let user see success message
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await resetPassword(resetEmail);
    
    if (!error) {
      setResetSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                HostelPadi
              </CardTitle>
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardDescription className="text-lg">
              Your trusted student accommodation platform 🇬🇭
            </CardDescription>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
              <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Trusted
              </Badge>
            </div>
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
                {signupSuccess ? (
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-100 p-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-green-900">Account Created Successfully! 🎉</h3>
                      <p className="text-muted-foreground">
                        We've sent a confirmation email to <strong>{email}</strong>
                      </p>
                    </div>

                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        Please check your email and click the confirmation link to activate your account.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <Button
                        onClick={() => setActiveTab('login')}
                        className="w-full"
                      >
                        Go to Login
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowResendConfirmation(true)}
                        className="w-full"
                      >
                        Didn't receive email?
                      </Button>
                    </div>
                  </div>
                ) : (
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
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24">
                            <SelectValue>
                              <span className="flex items-center gap-1">
                                <span className="text-sm">{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                                <span className="text-xs">{countryCode}</span>
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem key={country.code + country.country} value={country.code}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span>{country.code}</span>
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {country.country}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="24 123 4567"
                          className="flex-1"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Full number: {countryCode} {phoneNumber || '24 123 4567'}
                      </p>
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
                  
                  <div className="text-center text-sm text-muted-foreground">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                  </div>
                </form>
                )}
              </TabsContent>

              <TabsContent value="reset">
                {resetSuccess ? (
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-blue-100 p-4">
                        <Mail className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-blue-900">Reset Link Sent! 📧</h3>
                      <p className="text-muted-foreground">
                        We've sent password reset instructions to <strong>{resetEmail}</strong>
                      </p>
                    </div>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Check your email and follow the instructions to reset your password.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <Button
                        onClick={() => setActiveTab('login')}
                        className="w-full"
                      >
                        Back to Login
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setResetSuccess(false);
                          setResetEmail('');
                        }}
                        className="w-full"
                      >
                        Send Another Reset Link
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Enter the email address associated with your account and we'll send you a link to reset your password.
                      </AlertDescription>
                    </Alert>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Sending Reset Link..." : "Send Reset Link"}
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
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Resend Confirmation Modal */}
        {showResendConfirmation && (
          <ResendConfirmation 
            onSuccess={() => {
              setShowResendConfirmation(false);
            }}
          />
        )}
      </div>
    </div>
  );
}