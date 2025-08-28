import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account on HostelPadi?",
          answer: "Creating an account is easy! Click the 'Sign Up' button on our homepage, choose whether you're a student or landlord, fill in your details, and verify your email address. You'll be ready to start using HostelPadi right away!"
        },
        {
          question: "Is HostelPadi free to use?",
          answer: "Yes! Creating an account and browsing hostels is completely free for students. We only charge a small booking fee when you successfully reserve a hostel room."
        },
        {
          question: "What universities does HostelPadi serve?",
          answer: "We currently serve major universities across Ghana including University of Ghana (Legon), KNUST, UCC, GIMPA, and many others. We're constantly expanding to new universities!"
        }
      ]
    },
    {
      category: "Booking & Payments",
      questions: [
        {
          question: "How do I book a hostel room?",
          answer: "Browse available hostels, select your preferred room, choose your dates, and click 'Book Now'. You'll need to provide some basic information and make a payment to secure your booking."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), Visa/Mastercard, and bank transfers. All payments are processed securely through our payment partners."
        },
        {
          question: "Can I cancel my booking?",
          answer: "Cancellation policies vary by hostel. Most allow free cancellation up to 48 hours before your check-in date. Check the specific policy when booking."
        },
        {
          question: "When do I pay for my booking?",
          answer: "You can either pay the full amount upfront or use our 'Hold & Pay' feature to reserve with a deposit and pay the balance later."
        }
      ]
    },
    {
      category: "Safety & Security",
      questions: [
        {
          question: "How do you verify hostels?",
          answer: "All hostels on HostelPadi undergo a thorough verification process including physical inspections, document verification, and background checks on landlords."
        },
        {
          question: "What if I have issues with my hostel?",
          answer: "Contact our support team immediately. We have a 24/7 emergency hotline for urgent safety issues and regular support for other concerns."
        },
        {
          question: "Are the reviews on HostelPadi real?",
          answer: "Yes! All reviews are from verified students who have actually stayed at the hostels. We have strict policies against fake reviews."
        }
      ]
    },
    {
      category: "For Landlords",
      questions: [
        {
          question: "How do I list my property on HostelPadi?",
          answer: "Create a landlord account, complete the verification process, and use our property listing form to add your hostel details, photos, and pricing."
        },
        {
          question: "How much does it cost to list my property?",
          answer: "Listing your property is free! We only take a small commission when you receive bookings through our platform."
        },
        {
          question: "How do I get paid?",
          answer: "Payments are automatically transferred to your registered bank account or Mobile Money wallet within 24 hours of a successful booking."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "I forgot my password. How do I reset it?",
          answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link."
        },
        {
          question: "The website is not working properly. What should I do?",
          answer: "Try refreshing the page or clearing your browser cache. If the problem persists, contact our technical support team."
        },
        {
          question: "Can I use HostelPadi on my mobile phone?",
          answer: "Yes! Our website is fully mobile-responsive. We're also working on dedicated mobile apps for iOS and Android."
        }
      ]
    }
  ];

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about HostelPadi
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQs..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {filteredFAQs.length === 0 && searchQuery ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try different keywords or browse our categories below.
                  </p>
                  <Button onClick={() => setSearchQuery("")} variant="outline">
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Still need help? */}
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" onClick={() => {
                  alert("Chat feature coming soon! For now, please use our contact form or email support@hostelpadi.com");
                }}>
                  Start Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
