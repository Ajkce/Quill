"use client";

import React from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";

import { ArrowRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import UserAccountNav from "./UserAccountNav";
import { userAgent } from "next/server";
import MobileNav from "./MobileNav";

const Navbar = () => {
  const { data, status } = useSession();
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>quill.</span>
          </Link>

          {/* Add mobile navbar */}
          <MobileNav isAuth={!!data}></MobileNav>

          <div className="hidden items-center space-x-4 sm:flex">
            {status !== "authenticated" ? (
              <>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href="/pricing"
                >
                  Pricing
                </Link>
                {status === "unauthenticated" && (
                  <Link
                    href="/login"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    Sign In
                  </Link>
                )}

                {/* {status === "authenticated" && (
                <button
                  onClick={() => signOut()}
                  className={buttonVariants({
                    variant: "destructive",
                    size: "sm",
                  })}
                >
                  Sign Out
                </button>
              )} */}
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Get started <ArrowRight className="ml-2 h-5 w-5"></ArrowRight>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  name={!data.user.name ? "Your Account" : data.user.name}
                  email={data.user.email ?? ""}
                  imageUrl={data.user.image ?? ""}
                ></UserAccountNav>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
