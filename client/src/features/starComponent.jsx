import React, { useEffect, useRef } from 'react';

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let screenHeight = window.innerHeight;
    let screenWidth = window.innerWidth;
    let stars = [];
    let planets = [];
    const numStars = 150;

    canvas.width = screenWidth;
    canvas.height = screenHeight;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        size: Math.random() * 2,
        speed: Math.random() * 0.5,
        opacity: Math.random(),
        blinkSpeed: Math.random() * 0.02
      });
    }

    const planetColors = ['#4e5d6c', '#7b6d8d', '#a67d5d', '#556b2f'];
    for (let i = 0; i < 3; i++) {
      planets.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        radius: 20 + Math.random() * 40,
        color: planetColors[i % planetColors.length],
        speed: 0.1 + Math.random() * 0.2,
        hasRing: Math.random() > 0.5
      });
    }

    const drawMoon = (x, y, radius) => {
      const gradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius);
      gradient.addColorStop(0, '#e1e1e1');
      gradient.addColorStop(1, '#a1a1a1');
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.beginPath();
      ctx.arc(x - 15, y - 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 10, y + 15, 7, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlanet = (planet) => {
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      ctx.fillStyle = planet.color;
      ctx.fill();

      const grad = ctx.createRadialGradient(
        planet.x - planet.radius / 3, planet.y - planet.radius / 3, planet.radius / 4,
        planet.x, planet.y, planet.radius
      );
      grad.addColorStop(0, 'rgba(255,255,255,0.1)');
      grad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = grad;
      ctx.fill();

      if (planet.hasRing) {
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.radius * 2.2, planet.radius * 0.4, Math.PI / 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, screenWidth, screenHeight);
      ctx.fillStyle = '#000e2e';
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      drawMoon(screenWidth - 100, 100, 50);

      planets.forEach(planet => {
        planet.y += planet.speed;
        if (planet.y - planet.radius > screenHeight) planet.y = -planet.radius;
        drawPlanet(planet);
      });

      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > screenHeight) star.y = 0;

        star.opacity += star.blinkSpeed;
        if (star.opacity > 1 || star.opacity < 0) {
          star.blinkSpeed = -star.blinkSpeed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      screenWidth = canvas.width;
      screenHeight = canvas.height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default Starfield;