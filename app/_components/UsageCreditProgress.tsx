import { Progress } from "@/components/ui/progress";

function UsageCreditProgress() {
  return (
    <div className="flex flex-col gap-2 p-2 border rounded-xl">
      <h3 className="font-semibold text-lg">Free Plan</h3>
      <p className="text-neutral-500">0/15 message used</p>
      <Progress value={33} />
    </div>
  );
}

export default UsageCreditProgress;
