<script lang="ts">
  /**
   * A single WebGL mesh gradient (Paper Shaders) used as an ambient, brand-lime
   * backdrop. Decorative only. The shader module is dynamically imported inside
   * onMount so it never loads during SSR, holds still under
   * prefers-reduced-motion, and frees its GL context on unmount.
   */
  import { onMount } from 'svelte';

  let {
    colors,
    speed = 0.16,
    distortion = 0.8,
    swirl = 0.6,
    class: className = '',
    style = '',
  }: {
    colors: string[];
    speed?: number;
    distortion?: number;
    swirl?: number;
    class?: string;
    style?: string;
  } = $props();

  let host: HTMLDivElement;

  onMount(() => {
    let mount: { dispose: () => void } | null = null;
    let cancelled = false;

    void import('@paper-design/shaders').then(
      ({ ShaderMount, meshGradientFragmentShader, getShaderColorFromString }) => {
        if (cancelled || !host) return;
        const reduce = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

        mount = new ShaderMount(
          host,
          meshGradientFragmentShader,
          {
            u_colors: colors.map((c) => getShaderColorFromString(c)),
            u_colorsCount: colors.length,
            u_distortion: distortion,
            u_swirl: swirl,
            u_grainMixer: 0,
            u_grainOverlay: 0,
            // Sizing uniforms the React wrapper normally supplies (cover fit,
            // centered, full-bleed) — required when driving ShaderMount directly.
            u_fit: 2,
            u_scale: 1,
            u_rotation: 0,
            u_originX: 0.5,
            u_originY: 0.5,
            u_offsetX: 0,
            u_offsetY: 0,
            u_worldWidth: 0,
            u_worldHeight: 0,
          },
          undefined,
          reduce ? 0 : speed,
        );
      },
    );

    return () => {
      cancelled = true;
      mount?.dispose();
    };
  });
</script>

<div bind:this={host} aria-hidden="true" class={className} {style}></div>
