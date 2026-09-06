import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const StatCounter = ({ endValue, prefix = "", suffix = "", label, icon: Icon, color = "indigo", duration = 1.5 }) => {
  const [count, setCount] = useState(0);

  // Parse numeric portion if endValue is a string with non-numbers like "248" or "18.4"
  const numericValue = typeof endValue === 'number' ? endValue : parseFloat(endValue.toString().replace(/[^0-9.]/g, '')) || 0;
  const hasDecimal = endValue.toString().includes('.');

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * numericValue;
      setCount(hasDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [numericValue, duration, hasDecimal]);

  const colorVariants = {
    indigo: 'from-indigo-500/20 to-indigo-900/10 border-indigo-500/30 text-indigo-400',
    emerald: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400',
    cyan: 'from-cyan-500/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400',
    rose: 'from-rose-500/20 to-rose-900/10 border-rose-500/30 text-rose-400',
    purple: 'from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400'
  };

  const selectedColor = colorVariants[color] || colorVariants.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedColor} border backdrop-blur-xl p-5 shadow-lg group hover:border-indigo-400/50 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-white font-sans">
              {prefix}{count.toLocaleString()}{suffix}
            </span>
          </div>
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400 font-medium">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live Verified on Jharkhand Ledger</span>
      </div>
    </motion.div>
  );
};
