import React from "react";
import { useEffect, useRef } from 'react';

const Starfield = ({ theme = 'teal' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let screenHeight = window.innerHeight;
    let screenWidth = window.innerWidth;
    let stars = [];
    let planets = [];
    let meteors = [];
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

    const isVioletTheme = theme === 'violet';
    const isNavyGoldTheme = theme === 'navy-gold';
    const isWineRoseTheme = theme === 'wine-rose';
    const isBurntOrangeTheme = theme === 'burnt-orange';
    const isIcySilverTheme = theme === 'icy-silver';
    const isOliveLimeTheme = theme === 'olive-lime';
    const isCharcoalCoralTheme = theme === 'charcoal-coral';
    const isNavyAmberTheme = theme === 'navy-amber';
    const isGraphiteTurquoiseTheme = theme === 'graphite-turquoise';
    const isForestGoldTheme = theme === 'forest-gold';
    const isMidnightLavenderTheme = theme === 'midnight-lavender';
    const isSmokyCoralTheme = theme === 'smoky-coral';
    const isCharcoalNeonPinkTheme = theme === 'charcoal-neon-pink';
    const planetColors = isVioletTheme
      ? ['#6d5a91', '#8d5f82', '#a67d9b', '#4c477d']
      : isNavyGoldTheme
        ? ['#456477', '#8d7447', '#6f8791', '#a88b55']
        : isWineRoseTheme
          ? ['#75445a', '#9a536d', '#70465e', '#a36b7c']
          : isBurntOrangeTheme
            ? ['#8b5b3e', '#a9784c', '#6f4935', '#b28a5c']
            : isIcySilverTheme
              ? ['#52738a', '#7899aa', '#a6bbc4', '#4b6275']
                : isOliveLimeTheme
                  ? ['#596b48', '#788754', '#9aa66b', '#43543b']
                  : isCharcoalCoralTheme
                    ? ['#603c43', '#8f4d50', '#70414a', '#3e343d']
                    : isNavyAmberTheme
                      ? ['#405b78', '#a9783f', '#61758e', '#85633f']
                      : isGraphiteTurquoiseTheme
                        ? ['#3d6e76', '#4d9a9a', '#527d86', '#344d58']
                        : isForestGoldTheme
                          ? ['#42624b', '#9a8245', '#5c7658', '#aa9250']
                          : isMidnightLavenderTheme
                            ? ['#3e527d', '#7e6ca8', '#536b94', '#51416f']
                            : isSmokyCoralTheme
                              ? ['#765047', '#b56a53', '#856052', '#4f4c4e']
                              : isCharcoalNeonPinkTheme
                                ? ['#583b59', '#9b477d', '#4d4669', '#713c61']
                                : ['#4e5d6c', '#7b6d8d', '#a67d5d', '#556b2f'];
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

    // --- Meteors (shooting stars) ---
    const spawnMeteor = () => {
      const angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15); // ~45deg, slight variation
      meteors.push({
        x: Math.random() * screenWidth * 1.2 - screenWidth * 0.1,
        y: -40,
        length: 90 + Math.random() * 140,
        speed: 7 + Math.random() * 6,
        angle,
        opacity: 1
      });
    };

    const drawMeteor = (m) => {
      const dx = Math.cos(m.angle) * m.length;
      const dy = Math.sin(m.angle) * m.length;
      const tailX = m.x - dx;
      const tailY = m.y - dy;

      const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
      gradient.addColorStop(0.4, `rgba(200, 220, 255, ${m.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // bright head
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const updateMeteors = () => {
      // occasionally spawn a new meteor, keep a small cap
      if (meteors.length < 6 && Math.random() < 0.035) {
        spawnMeteor();
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        drawMeteor(m);

        if (m.x - m.length > screenWidth || m.y - m.length > screenHeight) {
          meteors.splice(i, 1);
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, screenWidth, screenHeight);

      const bgGradient = ctx.createRadialGradient(
        screenWidth * 0.5, screenHeight * 0.38, 0,
        screenWidth * 0.5, screenHeight * 0.38, Math.max(screenWidth, screenHeight) * 1.1
      );
      if (isVioletTheme) {
        bgGradient.addColorStop(0, '#3b245c');
        bgGradient.addColorStop(0.45, '#17142f');
        bgGradient.addColorStop(1, '#090713');
      } else if (isNavyGoldTheme) {
        bgGradient.addColorStop(0, '#1d4352');
        bgGradient.addColorStop(0.45, '#0d2734');
        bgGradient.addColorStop(1, '#061119');
      } else if (isWineRoseTheme) {
        bgGradient.addColorStop(0, '#542b42');
        bgGradient.addColorStop(0.45, '#291727');
        bgGradient.addColorStop(1, '#100910');
      } else if (isBurntOrangeTheme) {
        bgGradient.addColorStop(0, '#68422d');
        bgGradient.addColorStop(0.45, '#332016');
        bgGradient.addColorStop(1, '#120b08');
      } else if (isIcySilverTheme) {
        bgGradient.addColorStop(0, '#294b60');
        bgGradient.addColorStop(0.45, '#162d3d');
        bgGradient.addColorStop(1, '#08131d');
      } else if (isOliveLimeTheme) {
        bgGradient.addColorStop(0, '#354a35');
        bgGradient.addColorStop(0.45, '#1c2a20');
        bgGradient.addColorStop(1, '#0a110c');
      } else if (isCharcoalCoralTheme) {
        bgGradient.addColorStop(0, '#351e25');
        bgGradient.addColorStop(0.45, '#171317');
        bgGradient.addColorStop(1, '#050506');
      } else if (isNavyAmberTheme) {
        bgGradient.addColorStop(0, '#1f405c');
        bgGradient.addColorStop(0.45, '#102437');
        bgGradient.addColorStop(1, '#060d18');
      } else if (isGraphiteTurquoiseTheme) {
        bgGradient.addColorStop(0, '#29464d');
        bgGradient.addColorStop(0.45, '#18272d');
        bgGradient.addColorStop(1, '#080d10');
      } else if (isForestGoldTheme) {
        bgGradient.addColorStop(0, '#294836');
        bgGradient.addColorStop(0.45, '#172a20');
        bgGradient.addColorStop(1, '#080d0a');
      } else if (isMidnightLavenderTheme) {
        bgGradient.addColorStop(0, '#263b67');
        bgGradient.addColorStop(0.45, '#121c38');
        bgGradient.addColorStop(1, '#070b18');
      } else if (isSmokyCoralTheme) {
        bgGradient.addColorStop(0, '#40352f');
        bgGradient.addColorStop(0.45, '#211d1c');
        bgGradient.addColorStop(1, '#0b0b0b');
      } else if (isCharcoalNeonPinkTheme) {
        bgGradient.addColorStop(0, '#30233d');
        bgGradient.addColorStop(0.45, '#171522');
        bgGradient.addColorStop(1, '#050509');
      } else {
        bgGradient.addColorStop(0, '#123832');
        bgGradient.addColorStop(0.45, '#051a18');
        bgGradient.addColorStop(1, '#00050a');
      }
      ctx.fillStyle = bgGradient;
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

      updateMeteors();

      requestAnimationFrame(animate);
    };

    animate();

    // Rescale existing star/planet/meteor positions on resize so a
    // bigger window doesn't reveal an empty area.
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const scaleX = newWidth / screenWidth;
      const scaleY = newHeight / screenHeight;

      stars.forEach(star => {
        star.x *= scaleX;
        star.y *= scaleY;
      });

      planets.forEach(planet => {
        planet.x *= scaleX;
        planet.y *= scaleY;
      });

      meteors.forEach(meteor => {
        meteor.x *= scaleX;
        meteor.y *= scaleY;
      });

      canvas.width = newWidth;
      canvas.height = newHeight;
      screenWidth = newWidth;
      screenHeight = newHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default Starfield;