import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ContributionGraph from "@/components/ContributionGraph";
import FeatureCard from "@/components/FeatureCard";
import StepCard from "@/components/StepCard";
import {
  Calendar,
  GitCommit,
  Zap,
  Shield,
  Clock,
  Github,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";


const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: "Pick Any Date",
      description:
        "Select dates and choose one of four commit intensity levels for each day.",
    },
    {
      icon: GitCommit,
      title: "Real Commits",
      description:
        "Creates real, uniquely dated commits in a dedicated repository you control.",
    },
    {
      icon: Zap,
      title: "Instant Updates",
      description:
        "Generate an entire contribution pattern in one carefully limited batch.",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description:
        "Uses GitHub OAuth and encrypts access tokens before database storage.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Your GitHub",
      description:
        "Securely authenticate with your GitHub account using OAuth.",
    },
    {
      number: "02",
      title: "Select Your Dates",
      description:
        "Cycle each date through 1, 3, 6, or 10 commits.",
    },
    {
      number: "03",
      title: "Generate Commits",
      description: "Review the total, then create and push the selected commits.",
    },
  ];

  const [currentStats, setCurrentStats] = useState<{
    total_commits: number;
    total_users: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch("/api/stats");
        const stats_data = await response.json();

        if (response.ok) {
          setCurrentStats(stats_data);
        } else {
          console.error("Failed to fetch stats:", stats_data);
          toast({
            title: "❌ Error",
            description: "Failed to load stats.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "❌ Error",
          description: "Could not load stats.",
          variant: "destructive",
        });
      }
    }

    fetchStats();

    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval); 

  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rotate-12 rounded-[3rem] border-2 border-foreground bg-secondary/50" />

      {/* Header */}
      <header className="relative z-10 border-b-2 border-foreground bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 -rotate-3 items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[3px_3px_0_hsl(var(--foreground))]">
              <GitCommit className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              GCon<span className="text-primary">!</span>
            </span>
          </div>
          {isAuthenticated() ? (
            <Button variant="heroOutline" size="sm" asChild>
              <a href="/select-dates">
                <GitCommit className="h-4 w-4" />
                Dashboard
              </a>
            </Button>
          ) : (
            <Button variant="heroOutline" size="sm" asChild>
              <a href="/login">
                <Github className="h-4 w-4" />
                Sign In
              </a>
            </Button>
          )}
        </div>
      </header>

      <div className="relative z-10 overflow-hidden border-b-2 border-foreground bg-accent py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground sm:text-xs">
        <div className="flex min-w-max items-center justify-center gap-8 px-4">
          <span>four levels</span><span>✦</span><span>one very green graph</span><span>✦</span><span>zero spreadsheets</span><span>✦</span><span>maximum tiny squares</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pb-20 pt-20 sm:pt-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sticker mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span>graph gardening, but digital</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="display-type mb-8 text-5xl text-foreground sm:text-7xl md:text-8xl"
            >
              Paint your graph.{" "}
              <span className="inline-block rotate-1 border-2 border-foreground bg-secondary px-3 pb-2 text-primary shadow-[6px_6px_0_hsl(var(--foreground))]">
                Pixel by pixel.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-10 max-w-2xl text-lg font-medium text-muted-foreground sm:text-xl"
            >
              Pick a day, turn the dial from one to ten, and make your
              contribution calendar look a little less beige.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {isAuthenticated() ? (
                <Button variant="hero" size="xl" asChild>
                  <a href="/select-dates">
                    <GitCommit className="h-4 w-4" />
                    Dashboard
                  </a>
                </Button>
              ) : (
                <Button variant="hero" size="xl" asChild>
                  <a href="/login">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              )}
              <Button variant="heroOutline" size="xl" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mt-14 grid max-w-xl grid-cols-2 gap-4 sm:gap-6"
            >
              {[
                {
                  value: "" + (currentStats ? currentStats.total_commits : "—"),
                  label: "Commits Generated",
                  icon: GitCommit,
                },
                { value: "" + (currentStats ? currentStats.total_users : "—"), label: "Active Users", icon: Sparkles },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className={`group relative overflow-hidden rounded-lg p-3 quirky-panel-small transition-transform hover:-translate-y-1 sm:p-5 ${index === 0 ? "-rotate-1" : "rotate-1 bg-secondary"}`}
                >
                  <div className="relative flex flex-col items-center text-center">
                    <stat.icon className="mb-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="font-mono text-xl font-bold text-primary sm:text-3xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Contribution Graph Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mx-auto mt-16 max-w-4xl -rotate-1 px-1"
          >
            <ContributionGraph />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative z-10 border-y-2 border-foreground bg-secondary py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-left"
            >
              <span className="sticker mb-5 bg-card">No magic, just Git</span>
              <h2 className="display-type mb-4 text-4xl text-foreground sm:text-6xl">
                Three clicks-ish.
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose your pixels. We handle the fiddly bits.
              </p>
            </motion.div>

            <div className="space-y-5">
              {steps.map((step, index) => (
                <StepCard key={step.number} {...step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <span className="sticker mb-5 bg-accent">Small tool, loud personality</span>
            <h2 className="display-type mb-4 text-4xl text-foreground sm:text-6xl">
              The useful stuff.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              No dashboards inside dashboards. Just the knobs that matter.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 border-t-2 border-foreground py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-2xl rotate-1 overflow-hidden rounded-xl bg-accent p-8 text-center quirky-panel sm:p-12"
          >
            <div className="relative">
              <Clock className="mx-auto mb-6 h-12 w-12 -rotate-12 text-foreground" />
              <h2 className="display-type mb-4 text-4xl text-foreground sm:text-5xl">
                Your graph called. It wants color.
              </h2>
              <p className="mb-8 text-muted-foreground">
                Give it a pattern, a pulse, or just one suspiciously productive Tuesday.
              </p>

              {isAuthenticated() ? (
                <Button
                  variant="hero"
                  size="lg"
                  className="sm:h-14 sm:px-10 sm:text-lg"
                  asChild
                >
                  <a href="/select-dates">
                    <GitCommit className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </a>
                </Button>
              ) : (
                <Button
                  variant="hero"
                  size="lg"
                  className="sm:h-14 sm:px-10 sm:text-lg"
                  asChild
                >
                  <a href="/login">
                    <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">
                      Connect with GitHub
                    </span>
                    <span className="sm:hidden">Connect GitHub</span>
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
