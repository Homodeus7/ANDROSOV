import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/shared/lib";

type ContainerProps<T extends ElementType> = {
  as?: T;
  grid?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Container<T extends ElementType = "div">({
  as,
  grid = false,
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[100rem] px-4 md:px-8",
        grid && "grid-page",
        className,
      )}
      {...props}
    />
  );
}
