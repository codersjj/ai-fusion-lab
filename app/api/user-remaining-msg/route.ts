import { aj } from "@/config/arcjet";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let token = 0; // 默认值

  try {
    const body = await req.json();
    token = body.token ?? 0;
    console.log("🚀 ~ POST ~ token:", token);
  } catch {
    console.log(
      "🚀 ~ POST ~ No JSON body provided, using default token:",
      token
    );
    // 如果 JSON 解析失败，使用默认值继续执行
  }

  const user = await currentUser();

  const decision = await aj.protect(req, {
    userId: user?.primaryEmailAddress?.emailAddress ?? "",
    requested: token,
  }); // Deduct {token} token from the bucket

  let remainingToken = 0;
  for (const { reason } of decision.results) {
    if (reason.isRateLimit()) {
      console.log("Requests remaining", reason.remaining);
      remainingToken = reason.remaining;
    }
  }

  if (decision.isDenied()) {
    return NextResponse.json({
      allowed: false,
      error: "Too Many Requests",
      reason: decision.reason,
      remainingToken,
    });
  }

  return NextResponse.json({
    message: "Hello world",
    allowed: true,
    remainingToken,
  });
}
