"use client";
import React from "react";
import { Button } from "./ui/button";
import { TrashIcon } from "lucide-react";
import axios from "axios";
import { trpc } from "@/app/_trpc/client";

const DeleteFile = ({ id }: { id: string }) => {
  
  return (
    <Button
      size="sm"
      className="w-full"
      variant="destructive"
      onClick={() => deleteFile({ id })}
    >
      <TrashIcon className="h-4 w-4"></TrashIcon>
    </Button>
  );
};

export default DeleteFile;
