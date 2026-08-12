import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const reqBody = (await request.json()) as { token: string };
  const idToken = reqBody.token;

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  if (idToken) {
    (await cookies()).set("session", idToken, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } else {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
}

export async function DELETE() {
  (await cookies()).delete("session");
  return NextResponse.json({ status: "success" }, { status: 200 });
}
