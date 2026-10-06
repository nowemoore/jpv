import type { LayerId } from '../data/orgs';
import { publicUrl } from '../publicUrl';

/**
 * The pattern that marks each layer of the stack (images in public/layers):
 * dots for governance, rules for distribution, a grid for runtime, hatching
 * for the model, and checks (fine and finer) for cloud and hardware.
 */
export function LayerIcon({ id, size = 16 }: { id: LayerId; size?: number }) {
  return <img className="layer-icon" src={publicUrl(`layers/${id}.png`)} width={size} height={size} alt="" />;
}
