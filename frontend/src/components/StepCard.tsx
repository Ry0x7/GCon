import { motion } from "framer-motion";

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  index: number;
}

const StepCard = ({ number, title, description, index }: StepCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative flex gap-5 rounded-xl p-5 quirky-panel-small ${
        index === 1 ? "sm:translate-x-8" : ""
      }`}
    >
      {/* Number bubble */}
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-md border-2 border-foreground bg-secondary font-mono text-lg font-bold text-foreground shadow-[3px_3px_0_hsl(var(--foreground))]">
          {number}
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-xl font-extrabold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};

export default StepCard;
