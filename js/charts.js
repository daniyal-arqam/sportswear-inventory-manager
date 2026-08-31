/**
 * Futuristic Holographic Sports-Tech HUD Gauge Engine (60 FPS)
 * Features:
 * - Orbiting energy particles with comet tails
 * - Rotating radar laser sweep beam with trailing luminescence
 * - Segmented digital micro-laser arcs (Formula 1 / Cyberpunk telemetric HUD)
 * - Idle breathing sine-wave energy pulses
 * - Real-time magnetic cursor physics & interactive slice expansion
 * - Holographic glass core with dynamic telemetry
 */

class DashboardCharts {
  static donutState = {
    hoveredIndex: -1,
    currentAngle: 0,
    radarAngle: 0,
    pulseTimer: 0,
    particles: [],
    canvas: null,
    data: null,
    initialized: false,
    animFrame: null
  };

  static categoryState = {
    hoveredIndex: -1,
    initialized: false
  };

  static initDonutEngine(canvas, data) {
    this.donutState.canvas = canvas;
    this.donutState.data = data;

    // Initialize 24 orbiting energy particles
    if (this.donutState.particles.length === 0) {
      for (let i = 0; i < 22; i++) {
        this.donutState.particles.push({
          angle: (i / 22) * Math.PI * 2,
          radiusOffset: (Math.random() - 0.5) * 16,
          speed: 0.015 + Math.random() * 0.015,
          size: 1.5 + Math.random() * 2.2,
          alpha: 0.3 + Math.random() * 0.7,
          color: i % 3 === 0 ? '#00F0FF' : (i % 3 === 1 ? '#CCFF00' : '#10B981')
        });
      }
    }

    if (!canvas._hudEngineAttached) {
      canvas._hudEngineAttached = true;
      canvas.style.cursor = 'pointer';

      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const centerX = width / 2;
        const centerY = height / 2 - 5;
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const outerR = Math.min(width, height) * 0.42;
        const innerR = outerR * 0.62;

        if (dist >= innerR - 10 && dist <= outerR + 20) {
          let angle = Math.atan2(dy, dx) + Math.PI / 2;
          if (angle < 0) angle += Math.PI * 2;

          const total = (data.inStock || 0) + (data.lowStock || 0) + (data.critical || 0);
          if (total > 0) {
            const inStockAngle = ((data.inStock || 0) / total) * (Math.PI * 2);
            const lowStockAngle = inStockAngle + ((data.lowStock || 0) / total) * (Math.PI * 2);

            if (angle <= inStockAngle) {
              this.donutState.hoveredIndex = 0;
            } else if (angle <= lowStockAngle) {
              this.donutState.hoveredIndex = 1;
            } else {
              this.donutState.hoveredIndex = 2;
            }
          }
        } else {
          this.donutState.hoveredIndex = -1;
        }
      });

      canvas.addEventListener('mouseleave', () => {
        this.donutState.hoveredIndex = -1;
      });

      canvas.addEventListener('click', () => {
        const h = this.donutState.hoveredIndex;
        if (h === 0) {
          window.InventoryController.currentStatus = 'IN STOCK';
          window.App.navigateTo('inventory');
        } else if (h === 1) {
          window.InventoryController.currentStatus = 'LOW STOCK';
          window.App.navigateTo('inventory');
        } else if (h === 2) {
          window.InventoryController.currentStatus = 'CRITICAL';
          window.App.navigateTo('inventory');
        } else {
          window.App.navigateTo('inventory');
        }
      });
    }

    // Start 60FPS Rendering Loop
    if (!this.donutState.animFrame) {
      this.runDonutAnimationLoop();
    }
  }

  static runDonutAnimationLoop() {
    const loop = () => {
      const { canvas, data } = this.donutState;
      if (canvas && data && document.body.contains(canvas)) {
        this.drawHolographicDonut(canvas, data);
      }
      this.donutState.animFrame = requestAnimationFrame(loop);
    };
    this.donutState.animFrame = requestAnimationFrame(loop);
  }

  static renderHealthDonut(canvas, data) {
    this.donutState.data = data;
    this.initDonutEngine(canvas, data);
  }

  /**
   * Main 60 FPS Render Routine for Holographic Futuristic HUD Gauge
   */
  static drawHolographicDonut(canvas, data) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth || 320;
    const height = 240;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const centerX = width / 2;
    const centerY = height / 2 - 5;
    const baseRadius = Math.min(width, height) * 0.38;
    const innerRadius = baseRadius * 0.68;

    const ds = this.donutState;
    ds.radarAngle += 0.035;
    ds.pulseTimer += 0.04;
    const breathPulse = Math.sin(ds.pulseTimer) * 2;

    const { inStock = 0, lowStock = 0, critical = 0 } = data;
    const total = inStock + lowStock + critical || 1;

    // 1. Futuristic Outer Cyber Ring (Telemetry Matrix)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius + 14 + breathPulse * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 2. High-Tech Precision Radial HUD Ticks (36 Notches)
    const numTicks = 36;
    ctx.save();
    for (let i = 0; i < numTicks; i++) {
      const a = (i / numTicks) * Math.PI * 2;
      const isMajor = i % 6 === 0;
      const r1 = baseRadius + 8;
      const r2 = isMajor ? baseRadius + 15 : baseRadius + 11;

      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(a) * r1, centerY + Math.sin(a) * r1);
      ctx.lineTo(centerX + Math.cos(a) * r2, centerY + Math.sin(a) * r2);
      ctx.strokeStyle = isMajor
        ? (isDark ? 'rgba(204, 255, 0, 0.45)' : 'rgba(0, 0, 0, 0.25)')
        : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)');
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Rotating Laser Radar Sweep Beam
    ctx.save();
    const sweepGrad = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, baseRadius + 16);
    sweepGrad.addColorStop(0, 'transparent');
    sweepGrad.addColorStop(0.7, isDark ? 'rgba(0, 240, 255, 0.04)' : 'rgba(0, 240, 255, 0.03)');
    sweepGrad.addColorStop(1, isDark ? 'rgba(0, 240, 255, 0.18)' : 'rgba(0, 240, 255, 0.12)');

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, baseRadius + 16, ds.radarAngle - 0.6, ds.radarAngle);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // Laser Edge Line
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(ds.radarAngle) * (innerRadius - 4), centerY + Math.sin(ds.radarAngle) * (innerRadius - 4));
    ctx.lineTo(centerX + Math.cos(ds.radarAngle) * (baseRadius + 16), centerY + Math.sin(ds.radarAngle) * (baseRadius + 16));
    ctx.strokeStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 4. Segmented Precision Micro-Bars (Formula 1 Cyber HUD)
    const segments = [
      {
        count: inStock,
        colorStart: '#00F5A0',
        colorEnd: '#00D070',
        glow: 'rgba(0, 245, 160, 0.6)',
        name: 'In Stock (> 5)'
      },
      {
        count: lowStock,
        colorStart: '#FFB800',
        colorEnd: '#E68A00',
        glow: 'rgba(255, 184, 0, 0.6)',
        name: 'Low Stock (3-5)'
      },
      {
        count: critical,
        colorStart: '#FF3366',
        colorEnd: '#D6002A',
        glow: 'rgba(255, 51, 102, 0.7)',
        name: 'Critical (0-2)'
      }
    ];

    let currentStartAngle = -Math.PI / 2;
    const totalSegments = 48; // Total digital LED micro-bars

    segments.forEach((seg, segIndex) => {
      if (seg.count === 0) return;
      const isHovered = ds.hoveredIndex === segIndex;
      const fraction = seg.count / total;
      const segBars = Math.max(Math.round(fraction * totalSegments), 1);
      const anglePerBar = (Math.PI * 2) / totalSegments;

      for (let b = 0; b < segBars; b++) {
        const barAngle = currentStartAngle + b * anglePerBar;
        const outerR = isHovered ? baseRadius + 8 + breathPulse : baseRadius + 3;
        const innerR = isHovered ? innerRadius - 4 : innerRadius;

        const x1 = centerX + Math.cos(barAngle) * innerR;
        const y1 = centerY + Math.sin(barAngle) * innerR;
        const x2 = centerX + Math.cos(barAngle) * outerR;
        const y2 = centerY + Math.sin(barAngle) * outerR;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        // Gradient for each bar
        const barGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        barGrad.addColorStop(0, seg.colorStart);
        barGrad.addColorStop(1, isHovered ? '#FFFFFF' : seg.colorEnd);

        ctx.strokeStyle = barGrad;
        ctx.lineWidth = isHovered ? 4.5 : 3.2;
        ctx.lineCap = 'round';
        ctx.shadowColor = seg.glow;
        ctx.shadowBlur = isHovered ? 20 : 8;
        ctx.stroke();

        ctx.restore();
      }

      currentStartAngle += fraction * (Math.PI * 2);
    });

    // 5. Orbiting Energy Particles (Comet Tails)
    ds.particles.forEach(p => {
      p.angle += p.speed;
      const pr = baseRadius + p.radiusOffset;
      const px = centerX + Math.cos(p.angle) * pr;
      const py = centerY + Math.sin(p.angle) * pr;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.restore();
    });

    // 6. Center Holographic Frosted Glass Disc
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 8, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#0B0E14' : '#FFFFFF';
    ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 24;
    ctx.fill();

    // Inner Glowing Ring Line
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 8, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 240, 255, 0.25)';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle Frequency Wave in Center
    ctx.beginPath();
    const wavePoints = 12;
    for (let w = 0; w <= wavePoints; w++) {
      const wx = centerX - 24 + (w / wavePoints) * 48;
      const wy = centerY + 24 + Math.sin(ds.pulseTimer * 2 + w * 0.8) * 3;
      if (w === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dynamic Telemetry Metrics
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const hIdx = ds.hoveredIndex;
    if (hIdx !== -1 && segments[hIdx] && segments[hIdx].count > 0) {
      const seg = segments[hIdx];
      const percent = Math.round((seg.count / total) * 100);

      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.fillStyle = seg.colorStart;
      ctx.fillText(`${seg.count} SKUs`, centerX, centerY - 8);

      ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isDark ? '#F8FAFC' : '#0F172A';
      ctx.fillText(`${percent}% â¢ ${seg.name.split(' ')[0]}`, centerX, centerY + 10);
    } else {
      const healthPercent = Math.round((inStock / total) * 100);

      ctx.font = '900 28px "Outfit", sans-serif';
      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.shadowColor = 'rgba(0, 245, 160, 0.4)';
      ctx.shadowBlur = 10;
      ctx.fillText(`${healthPercent}%`, centerX, centerY - 8);

      ctx.font = '800 10.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#00F5A0';
      ctx.fillText('OPTIMAL HEALTH', centerX, centerY + 10);
    }

    ctx.restore();
    ctx.restore();
  }

  /**
   * Render Category Distribution Bar Chart with 3D Cyber Tube Bars & Hover Glow
   */
  static renderCategoryBars(canvas, categoryCounts) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const width = canvas.parentElement.clientWidth || 400;
    const height = 240;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.cursor = 'pointer';
    ctx.scale(dpr, dpr);

    const categories = ['Footwear', 'Apparel', 'Accessories', 'Training Gear', 'Sports Equipment'];
    const maxVal = Math.max(...Object.values(categoryCounts), 1);
    const rowHeight = height / categories.length;
    const labelWidth = 130;
    const chartAreaWidth = width - labelWidth - 48;

    if (!canvas._barListenerAttached) {
      canvas._barListenerAttached = true;

      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const hoveredRow = Math.floor(mouseY / rowHeight);

        if (hoveredRow >= 0 && hoveredRow < categories.length) {
          if (this.categoryState.hoveredIndex !== hoveredRow) {
            this.categoryState.hoveredIndex = hoveredRow;
            this.renderCategoryBars(canvas, categoryCounts);
          }
        } else {
          if (this.categoryState.hoveredIndex !== -1) {
            this.categoryState.hoveredIndex = -1;
            this.renderCategoryBars(canvas, categoryCounts);
          }
        }
      });

      canvas.addEventListener('mouseleave', () => {
        if (this.categoryState.hoveredIndex !== -1) {
          this.categoryState.hoveredIndex = -1;
          this.renderCategoryBars(canvas, categoryCounts);
        }
      });

      canvas.addEventListener('click', () => {
        const h = this.categoryState.hoveredIndex;
        if (h >= 0 && h < categories.length) {
          const selectedCat = categories[h];
          window.InventoryController.currentCategory = selectedCat;
          window.App.navigateTo('inventory');
        }
      });
    }

    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    categories.forEach((cat, index) => {
      const count = categoryCounts[cat] || 0;
      const isHovered = this.categoryState.hoveredIndex === index;
      const y = index * rowHeight + 6;
      const barHeight = isHovered ? 18 : 14;
      const barWidth = Math.max((count / maxVal) * chartAreaWidth, 4);

      // Category Label
      ctx.font = isHovered ? '700 12.5px "Plus Jakarta Sans", sans-serif' : '600 11.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isHovered ? (isDark ? '#CCFF00' : '#8AB800') : (isDark ? '#94A3B8' : '#475569');
      ctx.fillText(cat, isHovered ? 4 : 0, y + barHeight / 2);

      // Bar Groove Track
      ctx.beginPath();
      ctx.roundRect(labelWidth, y, chartAreaWidth, barHeight, 8);
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      ctx.fill();

      // Bar Fill (3D Volumetric Metallic Gradient)
      if (count > 0) {
        ctx.save();
        const grad = ctx.createLinearGradient(labelWidth, y, labelWidth + barWidth, y + barHeight);
        if (isHovered) {
          grad.addColorStop(0, '#A3E600');
          grad.addColorStop(0.6, '#CCFF00');
          grad.addColorStop(1, '#E6FF66');
        } else {
          grad.addColorStop(0, '#7EA600');
          grad.addColorStop(0.7, '#CCFF00');
          grad.addColorStop(1, '#B8E600');
        }

        ctx.beginPath();
        ctx.roundRect(labelWidth, y, barWidth, barHeight, 8);
        ctx.fillStyle = grad;
        ctx.shadowColor = isHovered ? 'rgba(204, 255, 0, 0.65)' : 'rgba(204, 255, 0, 0.3)';
        ctx.shadowBlur = isHovered ? 20 : 10;
        ctx.fill();

        // 3D Top Specular Shine Strip
        ctx.beginPath();
        ctx.roundRect(labelWidth + 2, y + 1, barWidth - 4, barHeight * 0.35, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Metric Number
      ctx.font = isHovered ? '800 13px "JetBrains Mono", monospace' : '700 11.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isHovered ? (isDark ? '#CCFF00' : '#8AB800') : (isDark ? '#F8FAFC' : '#0F172A');
      ctx.fillText(`${count}`, width - 4, y + barHeight / 2);
    });
  }
}

window.DashboardCharts = DashboardCharts;
