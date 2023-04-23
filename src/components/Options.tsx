export let default_options = {
  highlight: true,
  showSideConditions: true,
  scale: 1.0,
  goal: (undefined as undefined | string),
  tree: (undefined as undefined | string),
  offset: ("center" as "0,0" | "center"),
}

export type Options = typeof default_options;
