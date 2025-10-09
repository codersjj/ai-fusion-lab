import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PricingTable } from "@clerk/nextjs";

function PricingModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>Select your plan</DialogTitle>
        </DialogHeader>
        <PricingTable ctaPosition="bottom" />
      </DialogContent>
    </Dialog>
  );
}

export default PricingModal;
