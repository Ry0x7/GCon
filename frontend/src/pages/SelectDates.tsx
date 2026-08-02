import { motion } from "framer-motion";
import { GitCommit, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MultiDateCalendar, {
  CommitCount,
  DateCommitMap,
} from "@/components/MultiDateCalendar";
import TemplateStudio from "@/components/TemplateStudio";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { setToken, getToken, clearToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { appPath } from "@/lib/navigation";

type CurrentUser = {
  username: string;
  avatar_url: string;
};

const readStoredUser = (): CurrentUser | null => {
  if (new URLSearchParams(window.location.search).has("token")) return null;
  const value = localStorage.getItem("current_user");
  return value ? JSON.parse(value) : null;
};

const SelectDates = () => {
  const [tokenFromUrl] = useState(() =>
    new URLSearchParams(window.location.search).get("token"),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authReady, setAuthReady] = useState(
    () => readStoredUser() !== null,
  );
  const [selectedDates, setSelectedDates] = useState<DateCommitMap>(new Map());
  const [calendarFocusDate, setCalendarFocusDate] = useState<string>();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    readStoredUser,
  );

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      localStorage.removeItem("current_user");
      window.history.replaceState({}, "", appPath("/select-dates"));
    }

    if (!getToken()) {
      window.location.href = appPath("/");
      return;
    }

    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        const response = await apiFetch("/api/user");
        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem("current_user", JSON.stringify(data.user));
          setCurrentUser(data.user);
        } else {
          console.error("Failed to fetch user details:", data);
          toast({
            title: "❌ Error",
            description: "Failed to load user details.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast({
          title: "❌ Error",
          description: "Could not load user information.",
          variant: "destructive",
        });
      } finally {
        setAuthReady(true);
      }
    };

    if (localStorage.getItem("current_user") === null) {
      fetchUserDetails();
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (
    entries: Array<{ date: string; count: CommitCount }>,
  ) => {
    setIsSubmitting(true);
    const totalCommits = entries.reduce((total, entry) => total + entry.count, 0);

    try {
      // Call Flask API
      const response = await apiFetch("/api/submit-dates", {
        method: "POST",
        body: JSON.stringify({ entries }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success
        toast({
          title: "✅ Success!",
          description: `Created ${totalCommits} commits across ${entries.length} date(s).`,
          variant: "default",
        });

        clearAllDates();
        // console.log("API Response:", data);
      } else {
        // Error from API
        toast({
          title: "❌ Error",
          description:
            data.error || "Failed to submit dates. Please try again.",
          variant: "destructive",
        });

        console.error("API Error:", data);
      }
    } catch (error) {
      // Network or other error
      console.error("Error submitting dates:", error);

      toast({
        title: "❌ Connection Error",
        description:
          "Could not connect to the server. Make sure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAllDates = () => {
    if (selectedDates.size === 0) return;
    setSelectedDates(new Map());
  };

  const applyTemplate = (dates: DateCommitMap, focusDate: string) => {
    setSelectedDates(dates);
    setCalendarFocusDate(focusDate);
    window.setTimeout(() => {
      document.getElementById("calendar-editor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiFetch("/api/logout", { method: "POST" });
    } finally {
      clearToken();
      setTimeout(() => {
        window.location.href = appPath("/");
      }, 800);
    }
  };

  if (!authReady) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Checking authentication…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="pointer-events-none absolute -right-20 top-32 h-60 w-60 rotate-12 rounded-full border-2 border-foreground bg-accent/60" />

      {/* Header */}
      <header className="relative z-10 border-b-2 border-foreground bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href={appPath("/")} className="flex items-center gap-2">
            <div className="flex h-9 w-9 -rotate-3 items-center justify-center rounded-md border-2 border-foreground bg-primary shadow-[3px_3px_0_hsl(var(--foreground))]">
              <GitCommit className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold text-foreground">
              GCon<span className="text-primary">!</span>
            </span>
          </a>

          {/* User Profile Banner */}
          <div className="flex items-center gap-2 sm:gap-4">
            {currentUser ? (
              <>
                <a href={`https://github.com/${currentUser.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border-2 border-foreground bg-secondary px-2 py-1 shadow-[2px_2px_0_hsl(var(--foreground))] sm:gap-3 sm:px-4">
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                    <AvatarImage
                      src={currentUser.avatar_url}
                      alt={currentUser.username}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {currentUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {currentUser.username}
                    </span>
                  </div>
                </a>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="px-2 sm:px-3" disabled={isLoggingOut}>
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                </Button>
              </>
            ) : (
              <div className="h-9 w-32 animate-pulse rounded-full bg-muted" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="sticker mb-5 bg-secondary">The square painter</span>
            <h1 className="display-type mb-4 text-5xl text-foreground sm:text-6xl">
              Make some noise.
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Stamp a pattern or paint one square at a time. Everything stays editable.
            </p>
          </motion.div>

          <TemplateStudio onApply={applyTemplate} />

          {/* Calendar */}
          <motion.div
            id="calendar-editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MultiDateCalendar
              key={calendarFocusDate ?? "calendar"}
              selectedDates={selectedDates}
              onSelectedDatesChange={setSelectedDates}
              clearAllDates={clearAllDates}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              focusDate={calendarFocusDate}
            />
          </motion.div>

          {/* Info Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-10 max-w-lg"
          >
            <div className="-rotate-1 rounded-lg bg-secondary p-4 text-center quirky-panel-small">
              <p className="text-sm text-muted-foreground">
                <span className="font-extrabold text-foreground">Hot tip:</span>{" "}
                Click a date repeatedly to increase its intensity, or use the
                preset controls in the selected dates list.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SelectDates;
