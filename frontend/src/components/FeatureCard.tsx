import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-xl p-6 quirky-panel transition-all duration-200 hover:-translate-y-1 ${
        index % 2 === 0 ? "sm:-rotate-1" : "sm:rotate-1"
      }`}
    >
      {/* Subtle gradient overlay */}
      <div className={`absolute right-0 top-0 h-20 w-20 rounded-bl-full ${
        index % 2 === 0 ? "bg-secondary" : "bg-accent"
      } opacity-70 transition-transform duration-200 group-hover:scale-125`} />

      <div className="relative">
        <div className="mb-5 inline-flex rotate-2 rounded-md border-2 border-foreground bg-primary p-3 shadow-[3px_3px_0_hsl(var(--foreground))]">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-extrabold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
