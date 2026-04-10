import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    q: "How do I book a table?",
    a: "Browse restaurants, tap 'Reserve a table', pick your date, time and party size, then confirm. You'll receive a confirmation by email."
  },
  {
    q: "How does the rewards programme work?",
    a: "You earn 10 points for every £1 spent on completed orders. Points unlock tiers: Bronze → Silver (500 pts) → Gold (2,000 pts) → Platinum (5,000 pts)."
  },
  {
    q: "Can I cancel or modify a booking?",
    a: "Go to My Bookings, tap the booking you'd like to change, and select 'Cancel'. Modifications are coming soon."
  },
  {
    q: "What is Outa?",
    a: "Outa is your AI dining assistant. It learns your taste preferences and recommends restaurants, dishes and experiences personalised to you."
  },
  {
    q: "How do I list my restaurant on Chups?",
    a: "Tap 'Own a restaurant? Join Chups' on your profile page, or go to /restaurant/onboarding to start the free setup process."
  },
];

const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Help & Support</SheetTitle>
        </SheetHeader>
        <Accordion type="single" collapsible className="py-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;
