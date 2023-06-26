export let default_options = {
  highlight: true,
  showSideConditions: false,
  scale: 1.0,
  goal: (undefined as undefined | string),
  tree: (undefined as undefined | string),
  offset: ("center" as "0,0" | "center"),
  plainRenderer: false,
  showAlias: true,
  minimalStyle: false,
}

export type Options = typeof default_options;
