import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// locale-aware wrappers around next/navigation and next/link
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
