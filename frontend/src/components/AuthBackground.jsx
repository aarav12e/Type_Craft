import React, { useEffect, useRef } from 'react';

// Characters that float in the background — typing-themed
const CHARS = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z',
  '0','1','2','3','4','5','6','7','8','9',
  '{','}','[',']','(',')','<','>','/','\\','|',
  ';',':','"',"'",'`','~','#','@','!','?',
  'fn','++','//','{}','[]','()','->','=>','::',
];

const AuthBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    // Read accent color from CSS variable
    const getAccent = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim() || '#e2b714';
      return raw;
    };

    // Parse hex/rgb to r,g,b components
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
      return result
        ? { r: parseInt(result[1],16), g: parseInt(result[2],16), b: parseInt(result[3],16) }
        : { r: 226, g: 183, b: 20 };
    };

    class Particle {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * this.w;
        this.y = initial ? Math.random() * this.h : this.h + 20;
        this.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        this.speed = 0.25 + Math.random() * 0.55;      // slow drift upward
        this.drift = (Math.random() - 0.5) * 0.3;      // slight sideways wobble
        this.size = 10 + Math.floor(Math.random() * 14);
        this.opacity = 0.04 + Math.random() * 0.14;    // very subtle
        this.life = 0;
        this.maxLife = 200 + Math.random() * 400;
        this.fadeIn = 60;
        this.fadeOut = 80;
        this.rotation = (Math.random() - 0.5) * 0.4;
        this.rotationSpeed = (Math.random() - 0.5) * 0.002;
      }

      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.rotation += this.rotationSpeed;
        this.life++;
        if (this.y < -30 || this.life > this.maxLife) this.reset();
      }

      draw(ctx, rgb) {
        // Fade in/out
        let alpha = this.opacity;
        if (this.life < this.fadeIn)  alpha *= this.life / this.fadeIn;
        if (this.life > this.maxLife - this.fadeOut)
          alpha *= (this.maxLife - this.life) / this.fadeOut;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
      }
    }

    // Glowing orbs in the background
    class Orb {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
      }
      reset() {
        this.x = Math.random() * this.w;
        this.y = Math.random() * this.h;
        this.r = 80 + Math.random() * 160;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = 0.03 + Math.random() * 0.06;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -this.r || this.x > this.w + this.r) this.speedX *= -1;
        if (this.y < -this.r || this.y > this.h + this.r) this.speedY *= -1;
      }
      draw(ctx, rgb) {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${this.opacity})`);
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let particles = [];
    let orbs = [];

    const init = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;

      const count = Math.floor((W * H) / 14000);
      particles = Array.from({ length: Math.min(count, 70) }, () => new Particle(W, H));
      orbs      = Array.from({ length: 6 }, () => new Orb(W, H));
    };

    const draw = () => {
      const accent = getAccent();
      const rgb    = hexToRgb(accent);

      ctx.clearRect(0, 0, W, H);

      // Draw orbs first (background layer)
      orbs.forEach(o => { o.update(); o.draw(ctx, rgb); });

      // Draw particles
      particles.forEach(p => { p.update(); p.draw(ctx, rgb); });

      animId = requestAnimationFrame(draw);
    };

    init();
    draw();

    const onResize = () => {
      cancelAnimationFrame(animId);
      init();
      draw();
    };

    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-canvas" />;
};

export default AuthBackground;
