import { motion } from "framer-motion";

export function DecorativeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Soft gradient blurs */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-gold/5 dark:from-primary/10 dark:to-gold/10" />
    </div>
  );
}

export function Lanterns() {
  return (
    <div className="fixed top-0 left-0 w-full flex justify-between px-8 md:px-24 z-0 pointer-events-none">
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 md:w-32 lg:w-40 opacity-80"
      >
        <img src={`${import.meta.env.BASE_URL}images/lantern.png`} alt="" className="w-full h-auto drop-shadow-xl" />
      </motion.div>
      
      <motion.div
        animate={{ y: [10, 0, 10], rotate: [2, -2, 2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="w-20 md:w-28 lg:w-32 opacity-70 mt-8"
      >
        <img src={`${import.meta.env.BASE_URL}images/lantern.png`} alt="" className="w-full h-auto drop-shadow-xl" />
      </motion.div>
    </div>
  );
}
