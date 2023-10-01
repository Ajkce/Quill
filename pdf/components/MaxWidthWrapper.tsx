import { cn } from "@/libs/utils";
import React, { ReactNode } from "react";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      // THe utility funcion that we just created is being used to merge the classname that we provide here and the other one we provide while using the component together
      className={cn(
        "mx-auto w-full max-w-screen-xl px-2.5 md:px-20 text-center",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
