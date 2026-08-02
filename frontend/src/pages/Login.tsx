import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GitCommit, ArrowLeft, Loader2 } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { appPath } from "@/lib/navigation";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = () => {
    setIsLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_URL;

    setTimeout(() => {
      window.location.href = `${apiBaseUrl}/auth/github`;
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-20">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="pointer-events-none absolute -left-20 top-24 h-52 w-52 -rotate-12 rounded-[2rem] border-2 border-foreground bg-secondary" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-44 w-44 rotate-12 rounded-full border-2 border-foreground bg-accent" />

      {/* Back to home */}
      <a
        href={appPath("/")}
        className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-md border-2 border-foreground bg-card px-3 py-2 font-mono text-xs font-bold uppercase shadow-[3px_3px_0_hsl(var(--foreground))] transition-transform hover:-translate-y-0.5 sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </a>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative rotate-1 rounded-xl p-7 text-center quirky-panel sm:p-9">
          <span className="sticker absolute -right-4 -top-5 rotate-3 bg-secondary">members only-ish</span>
          {/* Logo */}
          <div className="mx-auto mb-7 flex h-16 w-16 -rotate-6 items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[5px_5px_0_hsl(var(--foreground))]">
            <GitCommit className="h-8 w-8 text-primary-foreground" />
          </div>

          <h1 className="display-type mb-3 text-4xl text-foreground">
            Knock knock, GitHub.
          </h1>
          <p className="mb-8 text-muted-foreground">
            Connect once. Then start coloring outside the lines.
          </p>

          {/* GitHub Login Button */}
          <Button
            variant="hero"
            size="xl"
            className="w-full mb-4"
            onClick={handleGitHubLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GithubIcon className="h-5 w-5" />
            )}
            {isLoading ? "Connecting..." : "Continue with GitHub"}
          </Button>

          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            We only request access to create commits in a dedicated repository.
            <br />
            Your existing repos remain untouched.
          </p>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-0.5 flex-1 bg-foreground" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">the sensible bit</span>
            <div className="h-0.5 flex-1 bg-foreground" />
          </div>

          {/* Benefits */}
          <div className="space-y-3 text-left">
            {[
              "Secure OAuth authentication",
              "No password stored on our servers",
              "Revoke access anytime from GitHub",
            ].map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 rounded-md border-2 border-foreground bg-background px-3 py-2 text-sm font-semibold text-foreground"
              >
                <div className="h-2.5 w-2.5 rotate-45 border border-foreground bg-secondary" />
                {benefit}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-7 -rotate-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Tiny print: GitHub will ask you to approve access.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
