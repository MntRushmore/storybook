export type RootStackParamList = {
  Home: undefined;
  StoryDetail: { storyId: string };
  StoryReveal: { storyId: string };
  JoinSession: undefined;
  Memories: undefined;
  Settings: undefined;
  TemplateSelection: undefined;
  BranchComparison: { parentPromptId: string };
};
