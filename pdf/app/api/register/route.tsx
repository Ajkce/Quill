import bcrypt from "bcrypt";
import prisma from "../../../libs/prismadb";
import { NextRequest, NextResponse } from "next/server";

interface Response {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  const body: Response = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  });

  return NextResponse.json(user);
}
