import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await getServerSession(authOptions);
  if (!user) redirect("/auth-callback?origin=dashboard");
  return <div>{JSON.stringify(user)}</div>;
};

export default Dashboard;
