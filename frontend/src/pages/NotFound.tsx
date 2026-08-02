import { useEffect } from "react";
import { motion } from "framer-motion";
import { GitCommit, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const pathname = window.location.pathname;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname,
    );
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rotate-12 rounded-[3rem] border-2 border-foreground bg-secondary" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <span className="display-type text-[120px] leading-none text-primary sm:text-[180px]">
              404
            </span>
            {/* Decorative commit icon */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6"
            >
              <div className="flex h-12 w-12 rotate-6 items-center justify-center rounded-md border-2 border-foreground bg-accent shadow-[4px_4px_0_hsl(var(--foreground))] sm:h-16 sm:w-16">
                <GitCommit className="h-6 w-6 text-foreground sm:h-8 sm:w-8" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="display-type mb-3 text-3xl text-foreground sm:text-5xl">
            This square wandered off.
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto font-mono text-sm">
            <span className="text-primary">error:</span> The page at{" "}
            <span className="text-foreground bg-muted px-2 py-0.5 rounded">
              {pathname}
            </span>{" "}
            doesn't exist in this repository.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="hero" size="lg" asChild>
            <a href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </a>
          </Button>
          <Button
            variant="heroOutline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </motion.div>

        {/* Terminal-style hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 mx-auto max-w-sm"
        >
          <div className="-rotate-1 rounded-lg p-4 text-left font-mono text-xs quirky-panel-small">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="ml-2">terminal</span>
            </div>
            <p className="text-muted-foreground">
              <span className="text-primary">$</span> git checkout main
            </p>
            <p className="text-muted-foreground mt-1">
              <span className="text-primary">$</span> cd /home
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
