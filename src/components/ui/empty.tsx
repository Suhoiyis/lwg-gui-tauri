import { cva, type VariantProps } from "class-variance-authority";
import { Ghost, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12",
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className,
      )}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};

export function EmptyState() {
  const workshopPath = useAppStore((state) => state.settings?.workshopPath);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setHighlightSettingField = useAppStore(
    (state) => state.setHighlightSettingField,
  );

  const handleConfigurePath = () => {
    setActiveTab("settings");
    setHighlightSettingField("workshopPath");
  };

  return (
    <Empty>
      <EmptyMedia>
        <Ghost className="size-12 text-muted-foreground/50" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No Wallpapers Found</EmptyTitle>
        <EmptyDescription>
          The wallpaper library appears to be empty.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* Display current path */}
        <div className="text-sm text-muted-foreground space-y-2">
          <span className="font-medium">Current Library Path:</span>
          <code className="block px-3 py-2 bg-muted rounded text-xs break-all">
            {workshopPath || "Not configured"}
          </code>
        </div>

        {/* Configure button */}
        <Button
          onClick={handleConfigurePath}
          size="sm"
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure Library Path
        </Button>
      </EmptyContent>
    </Empty>
  );
}
