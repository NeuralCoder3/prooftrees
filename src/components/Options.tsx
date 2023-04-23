

export let default_options = {
  highlight: true,
  showSideConditions: true,
  scale: 1.0,
  goal: (undefined as undefined | string),
  tree: (undefined as undefined | string),
}

export type Options = typeof default_options;


  // if (window.location.search) {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const goal = urlParams.get('goal');
  //   if (goal) {
  //     init_tree = goal_tree(valuePremise(parse(goal)));
  //   }
  //   const tree = urlParams.get('tree');
  //   if (tree) {
  //     init_tree = stringTreeToTree(JSON.parse(tree) as StringTree);
  //   }
  // }
  // if (!init_tree) {
  //   init_tree = typeof props.init === "string" ? goal_tree(valuePremise(parse(props.init))) : props.init;
  // }
