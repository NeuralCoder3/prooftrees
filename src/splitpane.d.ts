// my-project/types/split-pane.d.ts
declare module 'react-split-pane' {
  declare class SplitPane extends React.Component<
    SplitPaneProps & {
      children?: ReactNode;
    },
    SplitPaneState
  > { }

  export default SplitPane;
}
