
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  gravity: number
  drag: number
  shrink: number
  element: HTMLDivElement
}

export const createParticleExplosion = (x: number, y: number, color: string, count = 20) => {
  const particles: Particle[] = []
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100%'
  container.style.height = '100%'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '9999'
  document.body.appendChild(container)

  // Create particles
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 3
    const size = 3 + Math.random() * 5

    const particle: Particle = {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color: `rgba(${color}, ${0.7 + Math.random() * 0.3})`,
      alpha: 1,
      gravity: 0.1,
      drag: 0.95,
      shrink: 0.96,
      element: document.createElement('div')
    }

    // Style the particle
    particle.element.style.position = 'absolute'
    particle.element.style.width = `${particle.size}px`
    particle.element.style.height = `${particle.size}px`
    particle.element.style.borderRadius = '50%'
    particle.element.style.backgroundColor = particle.color
    particle.element.style.boxShadow = `0 0 ${particle.size * 2}px rgba(${color}, 0.8)`
    particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`
    
    container.appendChild(particle.element)
    particles.push(particle)
  }

  // Animation loop
  let animationFrame: number
  const animate = () => {
    let allDead = true

    particles.forEach(particle => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Apply physics
      particle.vy += particle.gravity
      particle.vx *= particle.drag
      particle.vy *= particle.drag
      particle.size *= particle.shrink
      particle.alpha -= 0.01
      
      // Update element
      particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`
      particle.element.style.width = `${particle.size}px`
      particle.element.style.height = `${particle.size}px`
      particle.element.style.opacity = `${particle.alpha}`
      
      if (particle.alpha > 0.05 && particle.size > 0.5) {
        allDead = false
      }
    })

    if (allDead) {
      cancelAnimationFrame(animationFrame)
      container.remove()
    } else {
      animationFrame = requestAnimationFrame(animate)
    }
  }

  animationFrame = requestAnimationFrame(animate)
}

export const createLineClearEffect = (rowElement: HTMLElement, color: string) => {
  // Flash effect
  rowElement.style.transition = 'all 0.3s ease-in-out'
  rowElement.style.backgroundColor = `rgba(${color}, 0.5)`
  rowElement.style.boxShadow = `0 0 10px rgba(${color}, 0.8)`
  
  setTimeout(() => {
    rowElement.style.backgroundColor = 'transparent'
    rowElement.style.boxShadow = 'none'
  }, 300)
  
  // Particle effect
  const rect = rowElement.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  createParticleExplosion(centerX, centerY, color, 30)
}

export const createLevelUpEffect = () => {
  // Create a full-screen flash
  const flash = document.createElement('div')
  flash.style.position = 'fixed'
  flash.style.top = '0'
  flash.style.left = '0'
  flash.style.width = '100%'
  flash.style.height = '100%'
  flash.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
  flash.style.pointerEvents = 'none'
  flash.style.zIndex = '9999'
  flash.style.transition = 'opacity 0.5s ease-out'
  
  document.body.appendChild(flash)
  
  // Fade out
  setTimeout(() => {
    flash.style.opacity = '0'
    setTimeout(() => {
      flash.remove()
    }, 500)
  }, 100)
  
  // Create particles from the center
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  
  createParticleExplosion(centerX, centerY, '255, 215, 0', 50)
}