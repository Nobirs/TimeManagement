import { TaskStatus } from "@time-management/shared-types";
import { TaskStatus as prismaTaskStatus } from "@prisma/client";

export const parseTaskStatus = (
  value: string
): prismaTaskStatus | undefined => {
  switch (value) {
    case TaskStatus.todo:
      return prismaTaskStatus.todo;
    case TaskStatus.in_progress:
      return prismaTaskStatus.in_progress;
    case TaskStatus.completed:
      return prismaTaskStatus.completed;
    default:
      return undefined;
  }
};
