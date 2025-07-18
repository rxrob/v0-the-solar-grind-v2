"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
}

interface Triangle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
}

export default function AnimatedBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const trianglesRef = useRef<Triangle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: `hsl(${Math.random() * 60 + 15}, 100%, 60%)`, // Orange to yellow
          opacity: Math.random() * 0.5 + 0.2,
        })
      }

      particlesRef.current = particles
    }

    const createTriangles = () => {
      const triangles: Triangle[] = []
      const triangleCount = Math.floor((canvas.width * canvas.height) / 25000)

      for (let i = 0; i < triangleCount; i++) {
        triangles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          size: Math.random() * 8 + 4,
          opacity: Math.random() * 0.3 + 0.1,
        })
      }

      trianglesRef.current = triangles
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const drawTriangle = (triangle: Triangle) => {
      ctx.save()
      ctx.globalAlpha = triangle.opacity
      ctx.translate(triangle.x, triangle.y)
      ctx.rotate(triangle.rotation)
      ctx.fillStyle = `rgba(255, 107, 53, ${triangle.opacity})`
      ctx.beginPath()
      ctx.moveTo(0, -triangle.size)
      ctx.lineTo(-triangle.size * 0.866, triangle.size * 0.5)
      ctx.lineTo(triangle.size * 0.866, triangle.size * 0.5)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const drawConnections = () => {
      const particles = particlesRef.current
      const maxDistance = 100

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.2
            ctx.save()
            ctx.globalAlpha = opacity
            ctx.strokeStyle = "rgba(255, 107, 53, 0.5)"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
    }

    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))
      })
    }

    const updateTriangles = () => {
      trianglesRef.current.forEach((triangle) => {
        triangle.x += triangle.vx
        triangle.y += triangle.vy
        triangle.rotation += triangle.rotationSpeed

        // Bounce off edges
        if (triangle.x <= 0 || triangle.x >= canvas.width) triangle.vx *= -1
        if (triangle.y <= 0 || triangle.y >= canvas.height) triangle.vy *= -1

        // Keep triangles in bounds
        triangle.x = Math.max(0, Math.min(canvas.width, triangle.x))
        triangle.y = Math.max(0, Math.min(canvas.height, triangle.y))
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      updateParticles()
      updateTriangles()

      // Draw connections first (behind particles)
      drawConnections()

      // Draw particles
      particlesRef.current.forEach(drawParticle)

      // Draw triangles
      trianglesRef.current.forEach(drawTriangle)

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      createParticles()
      createTriangles()
    }

    // Initialize
    resizeCanvas()
    createParticles()
    createTriangles()
    animate()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: "transparent" }} />
  )
}
