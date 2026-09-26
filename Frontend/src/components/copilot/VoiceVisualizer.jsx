import React, { useEffect, useRef } from 'react';

export const VoiceVisualizer = ({
  analyser,
  outputAnalyser,
  isActive = false,
  status = 'idle',
  mode = 'orb'
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let phase = 0;

    const dataArray = new Uint8Array(64);
    const outputDataArray = new Uint8Array(64);

    let smoothedLevel = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      let inputLevel = 0;
      if (analyser && isActive) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        inputLevel = sum / dataArray.length / 255;
      }

      let outputLevel = 0;
      if (outputAnalyser && isActive) {
        outputAnalyser.getByteFrequencyData(outputDataArray);
        let sum = 0;
        for (let i = 0; i < outputDataArray.length; i++) {
          sum += outputDataArray[i];
        }
        outputLevel = sum / outputDataArray.length / 255;
      }

      const targetLevel = Math.max(inputLevel * 1.5, outputLevel * 2.2);
      // Smooth interpolation for silky fluid response
      smoothedLevel += (targetLevel - smoothedLevel) * 0.18;
      phase += 0.025 + smoothedLevel * 0.05;

      if (mode === 'orb') {
        // ── 1. Gemini Glowing Multi-Layer Orb ─────────────────────────────
        const baseRadius = Math.min(width, height) * 0.22;
        const dynamicRadius = baseRadius * (1 + smoothedLevel * 0.45);

        // Ambient Outer Glow
        const outerGlow = ctx.createRadialGradient(
          centerX, centerY, baseRadius * 0.4,
          centerX, centerY, dynamicRadius * 2.2
        );

        if (status === 'speaking') {
          // Gemini Blue-Teal-Emerald speaking glow
          outerGlow.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
          outerGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.3)');
          outerGlow.addColorStop(0.7, 'rgba(99, 102, 241, 0.15)');
          outerGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else if (status === 'listening') {
          // Gemini Cyan-Mint listening glow
          outerGlow.addColorStop(0, 'rgba(45, 212, 191, 0.5)');
          outerGlow.addColorStop(0.45, 'rgba(14, 165, 233, 0.3)');
          outerGlow.addColorStop(0.8, 'rgba(168, 85, 247, 0.12)');
          outerGlow.addColorStop(1, 'rgba(45, 212, 191, 0)');
        } else if (status === 'processing') {
          // Amber-Gold connection pulse
          outerGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
          outerGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
          outerGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          // Idle ambient breath
          outerGlow.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
          outerGlow.addColorStop(0.6, 'rgba(56, 189, 248, 0.1)');
          outerGlow.addColorStop(1, 'rgba(52, 211, 153, 0)');
        }

        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 3 Smooth Fluid Morphing Wave Lobes
        const lobeCount = 3;
        for (let l = 0; l < lobeCount; l++) {
          ctx.beginPath();
          const points = 64;
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wave =
              Math.sin(angle * 3 + phase + l * 1.6) * (8 + smoothedLevel * 24) +
              Math.cos(angle * 2 - phase * 0.8 + l) * (5 + smoothedLevel * 16);
            const r = dynamicRadius + wave - l * 8;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const lobeGrad = ctx.createLinearGradient(
            centerX - dynamicRadius, centerY - dynamicRadius,
            centerX + dynamicRadius, centerY + dynamicRadius
          );

          if (status === 'speaking') {
            lobeGrad.addColorStop(0, `rgba(52, 211, 153, ${0.75 - l * 0.18})`);
            lobeGrad.addColorStop(0.5, `rgba(56, 189, 248, ${0.65 - l * 0.15})`);
            lobeGrad.addColorStop(1, `rgba(129, 140, 248, ${0.55 - l * 0.12})`);
          } else if (status === 'listening') {
            lobeGrad.addColorStop(0, `rgba(45, 212, 191, ${0.8 - l * 0.2})`);
            lobeGrad.addColorStop(0.5, `rgba(14, 165, 233, ${0.7 - l * 0.18})`);
            lobeGrad.addColorStop(1, `rgba(167, 139, 250, ${0.6 - l * 0.15})`);
          } else {
            lobeGrad.addColorStop(0, `rgba(52, 211, 153, ${0.45 - l * 0.1})`);
            lobeGrad.addColorStop(1, `rgba(56, 189, 248, ${0.35 - l * 0.08})`);
          }

          ctx.fillStyle = lobeGrad;
          ctx.fill();
        }

        // Inner Core Spherical Light Reflection
        const innerCore = ctx.createRadialGradient(
          centerX - dynamicRadius * 0.25, centerY - dynamicRadius * 0.25, 0,
          centerX, centerY, dynamicRadius * 0.95
        );
        innerCore.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        innerCore.addColorStop(0.3, 'rgba(207, 250, 254, 0.85)');
        innerCore.addColorStop(0.7, 'rgba(52, 211, 153, 0.5)');
        innerCore.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = innerCore;
        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // ── 2. Gemini Minimalist Harmonic Spectrum Wave ────────────────────
        const barCount = 32;
        const totalWidth = width * 0.75;
        const barWidth = (totalWidth / barCount) * 0.55;
        const startX = (width - totalWidth) / 2;

        for (let i = 0; i < barCount; i++) {
          const freqValue = dataArray[i % dataArray.length] || 0;
          const outputFreq = outputDataArray[i % outputDataArray.length] || 0;
          const barLevel = Math.max(freqValue / 255, outputFreq / 255, 0.08);

          const sineModifier = Math.sin((i / barCount) * Math.PI) * (1 + smoothedLevel * 1.5);
          const barHeight = Math.max(8, barLevel * height * 0.35 * sineModifier);

          const x = startX + i * (totalWidth / barCount);
          const y = centerY - barHeight / 2;

          const barGrad = ctx.createLinearGradient(x, y, x, y + barHeight);
          barGrad.addColorStop(0, '#38bdf8');
          barGrad.addColorStop(0.5, '#34d399');
          barGrad.addColorStop(1, '#818cf8');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2]);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, outputAnalyser, isActive, status, mode]);

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full max-w-[320px] max-h-[320px] sm:max-w-[380px] sm:max-h-[380px] object-contain drop-shadow-[0_0_35px_rgba(52,211,153,0.25)] transition-all duration-300"
      />
    </div>
  );
};

export default VoiceVisualizer;
