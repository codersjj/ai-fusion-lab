import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { parentModel, model, msg } = await req.json();

  const response = await axios.post(
    "https://kravixstudio.com/api/v1/chat",
    {
      message: msg,
      aiModel: model,
      outputType: "text",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KRAVIX_STUDIO_API_KEY}`,
      },
    }
  );

  console.log(response.data);

  // Make sure to update user tokens to Firebase here(api side) or on the client side

  return NextResponse.json({
    ...response.data,
    parentModel,
  });
}
