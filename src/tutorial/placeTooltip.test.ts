import { placeTooltip, type PlacementInput } from './placeTooltip';

const base: PlacementInput = {
  target: { x: 100, y: 200, width: 120, height: 60 },
  tooltipWidth: 300,
  tooltipHeight: 160,
  windowWidth: 400,
  windowHeight: 800,
  insetTop: 40,
  insetBottom: 20,
  gutter: 16,
  gap: 20,
  cornerRadius: 20,
  preferred: 'auto',
};

describe('placeTooltip', () => {
  test('prefers below the target when it fits', () => {
    const p = placeTooltip(base);
    expect(p.side).toBe('below');
    expect(p.y).toBe(200 + 60 + 20);
  });

  test('flips above when below would clip the bottom', () => {
    const p = placeTooltip({ ...base, target: { x: 100, y: 650, width: 120, height: 60 } });
    expect(p.side).toBe('above');
    expect(p.y).toBe(650 - 20 - 160);
  });

  test('clamps horizontally to the gutters', () => {
    const left = placeTooltip({ ...base, target: { x: 0, y: 200, width: 40, height: 40 } });
    expect(left.x).toBe(16);
    const right = placeTooltip({ ...base, target: { x: 380, y: 200, width: 20, height: 40 } });
    expect(right.x).toBe(400 - 16 - 300);
  });

  test('arrow stays clear of rounded corners and points at target center', () => {
    const p = placeTooltip({ ...base, target: { x: 0, y: 200, width: 40, height: 40 } });
    // Target center (20) is left of the clamped card — arrow clamps at radius + 8.
    expect(p.arrowX).toBe(20 + 8);
    const centered = placeTooltip(base);
    // Target center 160; card at x=16 (clamped from -10? center 160-150=10 → clamp 16).
    expect(centered.arrowX).toBe(160 - centered.x);
  });

  test('honors an explicit above preference when it fits', () => {
    const p = placeTooltip({ ...base, target: { x: 100, y: 400, width: 100, height: 50 }, preferred: 'above' });
    expect(p.side).toBe('above');
  });

  test('centers with no target and no arrow', () => {
    const p = placeTooltip({ ...base, target: null });
    expect(p.side).toBe('center');
    expect(p.arrowX).toBeNull();
    expect(p.x).toBe((400 - 300) / 2);
  });

  test('never places above the top inset', () => {
    const p = placeTooltip({
      ...base,
      target: { x: 100, y: 45, width: 100, height: 30 },
      preferred: 'above',
    });
    expect(p.y).toBeGreaterThanOrEqual(40 + 16);
  });
});
