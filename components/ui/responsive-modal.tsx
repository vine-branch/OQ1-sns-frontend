'use client';

import * as React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** max-h of the scrollable body on mobile (default: 60vh) */
  mobileMaxHeight?: string;
  /** Additional className for the desktop dialog content */
  dialogClassName?: string;
}

/**
 * ResponsiveModal
 * - Mobile (< 768px): shadcn Drawer → vaul bottom sheet
 * - Desktop (≥ 768px): shadcn Dialog → centered popup
 *
 * Only one is mounted at a time — no z-index conflicts.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  mobileMaxHeight = '60vh',
  dialogClassName,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          className={cn('max-h-[70vh] overflow-hidden', dialogClassName)}
        >
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}
          <div className="overflow-y-auto max-h-[calc(70vh-56px)]">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        {title && (
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
        )}
        <div className="overflow-y-auto" style={{ maxHeight: mobileMaxHeight }}>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Convenience sub-component for consistent body padding */
export function ResponsiveModalBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />;
}
