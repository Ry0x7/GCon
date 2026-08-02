import { GitCommit } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { appPath } from "@/lib/navigation";

interface FooterProps {
  variant?: "full" | "minimal";
}

const Footer = ({ variant = "full" }: FooterProps) => {
  if (variant === "minimal") {
    return (
      <footer className="relative z-10 border-t-2 border-foreground bg-secondary py-4">
        <p className="text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} GCon
        </p>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 border-t-2 border-foreground bg-secondary py-8">
      <div className="container mx-auto flex flex-col items-center gap-5 px-4 text-center">
        <a href={appPath("/")} className="flex items-center gap-2">
          <span className="flex h-7 w-7 -rotate-3 items-center justify-center rounded border-2 border-foreground bg-primary shadow-[2px_2px_0_hsl(var(--foreground))]">
            <GitCommit className="h-3 w-3 text-primary-foreground" />
          </span>
          <span className="font-mono font-medium text-foreground">GCon</span>
        </a>
        <p className="max-w-lg text-sm text-muted-foreground">
          Built for learning and experimentation. Contribution counts are not a measure of productivity.
        </p>
        <a
          href="https://github.com/kamalkoranga/commitfill"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <GithubIcon className="h-4 w-4" />
          Based on the MIT-licensed CommitFill project
        </a>
      </div>
    </footer>
  );
};

export default Footer;
