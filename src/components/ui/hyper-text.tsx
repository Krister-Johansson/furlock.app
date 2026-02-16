import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

interface SplitFlapCharProps {
  /** The target character to land on */
  target: string
  /** Delay in ms before this character starts flipping */
  delay: number
  /** How many intermediate flips before landing */
  flips?: number
  /** Duration of each individual flip in ms */
  flipDuration?: number
  className?: string
}

function SplitFlapChar({
  target,
  delay,
  flips = 6,
  flipDuration = 60,
  className,
}: SplitFlapCharProps) {
  const [currentChar, setCurrentChar] = useState<string>('\u00A0') // nbsp = blank
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipKey, setFlipKey] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (target === ' ') {
      setCurrentChar('\u00A0')
      setDone(true)
      return
    }

    const startTimeout = setTimeout(() => {
      setIsFlipping(true)
      let count = 0
      const totalFlips = flips

      const interval = setInterval(() => {
        count++
        if (count >= totalFlips) {
          // Final flip — land on target
          clearInterval(interval)
          setCurrentChar(target.toUpperCase())
          setFlipKey((k) => k + 1)
          // Small delay then mark done (let last flip animation finish)
          setTimeout(() => {
            setIsFlipping(false)
            setDone(true)
          }, flipDuration)
        } else {
          // Intermediate flip — random character
          const randomChar = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
          setCurrentChar(randomChar)
          setFlipKey((k) => k + 1)
        }
      }, flipDuration)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [target, delay, flips, flipDuration])

  return (
    <span
      className={cn(
        'relative inline-block overflow-hidden',
        target === ' ' ? 'w-[0.3em]' : '',
        className,
      )}
      style={{ perspective: '200px' }}
    >
      <motion.span
        key={flipKey}
        className="inline-block"
        initial={
          isFlipping || done
            ? { rotateX: -90, opacity: 0 }
            : { rotateX: 0, opacity: target === ' ' ? 1 : 0 }
        }
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{
          duration: isFlipping ? flipDuration / 1000 : 0.15,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: 'center bottom' }}
      >
        {currentChar}
      </motion.span>
    </span>
  )
}

interface SplitFlapTextProps {
  /** The text to reveal */
  children: string
  /** Optional className for the container */
  className?: string
  /** Component to render as */
  as?: React.ElementType
  /** Delay before the whole animation starts (ms) */
  delay?: number
  /** Stagger delay between each letter starting (ms) */
  stagger?: number
  /** Number of intermediate flips per character */
  flips?: number
  /** Duration of each flip (ms) */
  flipDuration?: number
  /** Whether to start animation when element comes into view */
  startOnView?: boolean
}

export function HyperText({
  children,
  className,
  as: Component = 'div',
  delay = 0,
  stagger = 50,
  flips = 7,
  flipDuration = 55,
  startOnView = false,
}: SplitFlapTextProps) {
  const letters = children.split('')
  const elementRef = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(!startOnView)

  useEffect(() => {
    if (!startOnView) {
      setTriggered(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [startOnView])

  return (
    <Component
      ref={elementRef}
      className={cn(
        'overflow-hidden py-2 text-4xl font-bold',
        className,
      )}
    >
      {letters.map((letter, index) => (
        <SplitFlapChar
          key={index}
          target={triggered ? letter : '\u00A0'}
          delay={triggered ? delay + index * stagger : 999999}
          flips={letter === ' ' ? 0 : flips}
          flipDuration={flipDuration}
        />
      ))}
    </Component>
  )
}
