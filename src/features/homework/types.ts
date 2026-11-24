export type HomeworkStatus = "NEW" | "DUE_SOON" | "OVERDUE";

export type HomeworkItem = {
  id: string;
  groupId: string;
  groupName: string;
  courseName: string;
  title: string;
  description: string;
  attachmentUrl: string | null;
  dueDate: string;
  createdAt: string;
  status: HomeworkStatus;
};

export type HomeworkGroup = {
  id: string;
  name: string;
};

export type HomeworkActionResult = {
  error?: string;
  success?: boolean;
};
