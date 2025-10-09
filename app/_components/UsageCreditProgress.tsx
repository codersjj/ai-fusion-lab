import { Progress } from "@/components/ui/progress";
import { MAX_TOKEN_PER_DAY } from "@/constants";

function UsageCreditProgress({ remaining }: { remaining: number }) {
  return (
    <div className="flex flex-col gap-2 p-2 border rounded-xl">
      <h3 className="font-semibold text-lg">Free Plan</h3>
      <p className="text-neutral-500">
        {MAX_TOKEN_PER_DAY - remaining}/{MAX_TOKEN_PER_DAY} message used
      </p>
      <Progress
        value={((MAX_TOKEN_PER_DAY - remaining) / MAX_TOKEN_PER_DAY) * 100}
      />
    </div>
  );
}

export default UsageCreditProgress;
