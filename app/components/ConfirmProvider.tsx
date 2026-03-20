"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ConfirmState {
  open: boolean;
  message: string;
}

const ConfirmContext = createContext<(message: string) => Promise<boolean>>(
  () => Promise.resolve(false),
);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    message: "",
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, message });
    });
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState({ open: false, message: "" });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState({ open: false, message: "" });
  }, []);

  return (
    <ConfirmContext.Provider value={showConfirm}>
      {children}
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <div className="px-5 pt-5 pb-4 text-center">
            <AlertDialogTitle className="sr-only">확인</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-gray-800 leading-relaxed">
              {state.message}
            </AlertDialogDescription>
          </div>
          <div className="border-t border-gray-200/80 grid grid-cols-2">
            <AlertDialogCancel
              onClick={handleCancel}
              className="border-r border-gray-200/80"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="text-red-500"
            >
              확인
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
