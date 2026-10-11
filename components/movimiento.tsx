"use client";
// Movimiento con Motion (motion.dev). Solo donde comunica algo: jerarquía al cargar, respuesta al tocar,
// cambio de estado. Con "reducir movimiento" del sistema queda solo el fundido (MotionConfig reducedMotion="user").
import { Children, type ReactNode } from "react";
import { MotionConfig, motion, type HTMLMotionProps } from "motion/react";

export const SALIDA = [0.23, 1, 0.32, 1] as const; // misma curva que --ease-out en globals.css
export const RESORTE = { type: "spring", stiffness: 520, damping: 32, mass: 0.6 } as const;

export function MovimientoGlobal({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Entrada en secuencia de los hijos directos (titular → bajada → buscador): marca el orden de lectura. */
export function Escalonar({ children, className, retraso = 0 }: { children: ReactNode; className?: string; retraso?: number }) {
  return (
    <motion.div className={className} initial="oculto" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: retraso } } }}>
      {Children.map(children, (hijo) => hijo && (
        <motion.div variants={{ oculto: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: SALIDA } } }}>{hijo}</motion.div>
      ))}
    </motion.div>
  );
}

/** Aparece al entrar en pantalla (una vez). */
export function Revelar({ children, retraso = 0, ...props }: HTMLMotionProps<"div"> & { retraso?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: retraso, ease: SALIDA }} {...props}>
      {children}
    </motion.div>
  );
}

/** Esqueleto de carga: aparece tras 150 ms (si la respuesta es rápida, no parpadea). */
export function AparecerCargando({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.3 }}>
      {children}
    </motion.div>
  );
}
