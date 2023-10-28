import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/libs/stripe";
import React from "react";

const Page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <BillingForm subscriptionPlan={subscriptionPlan}></BillingForm>;
};

export default Page;
