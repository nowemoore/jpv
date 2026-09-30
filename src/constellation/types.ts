/** An org, drawn as its label. Only clickable nodes can be selected. */
export interface GraphNode {
  id: string;
  label: string;
  clickable: boolean;
  /** URL of a logo image, drawn as a round badge leading the label. */
  logo?: string;
  /** Ids of other child nodes to join with a dashed secondary link. */
  links?: string[];
}

/** A group of orgs laid out together around an invisible centre, sharing a label colour. */
export interface GraphCluster {
  id: string;
  /** Name of the CSS custom property holding this group's colour, e.g. "--cluster-evals". */
  colorVar: string;
  children: GraphNode[];
}
