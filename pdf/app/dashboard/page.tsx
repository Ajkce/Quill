import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/libs/prismadb";
import Dashboard from "@/components/Dashboard";

const Page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const dbUser = prisma.user.findUnique({
    where: {
      email: session.user?.email!,
    },
  });

  return <Dashboard></Dashboard>;
};

export default Page;
