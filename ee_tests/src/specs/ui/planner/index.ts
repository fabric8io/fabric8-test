export * from './workitem-list';
export * from './workitem-quickadd';


type WorkItemType = 'task' | 'feature' | 'bug';

export interface WorkItem {
  title: string;
  description?: string;
  type?: WorkItemType;
}
