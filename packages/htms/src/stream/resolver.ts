import { TransformStream } from 'node:stream/web';

import type { TaskInfo, Token } from './tokenizer';

export type Task = () => Promise<string>;

export interface TaskToken extends TaskInfo {
  type: 'task';
  task: Task;
}

export type ResolverToken = Token | TaskToken;

export interface Resolver {
  resolve(info: TaskInfo): Task;
}

export function createTaskToken(info: TaskInfo, task: Task): TaskToken {
  return {
    type: 'task',
    ...info,
    task,
  };
}

export function createHtmsResolver(resolver: Resolver): TransformStream<Token, ResolverToken> {
  const taskTokens: TaskToken[] = [];

  return new TransformStream({
    transform(token, controller) {
      controller.enqueue(token);

      if (token.type === 'htmsTag') {
        try {
          const taskInfo = token.taskInfo;
          const task = resolver.resolve(taskInfo);

          if (typeof task === 'function') {
            taskTokens.push(createTaskToken(taskInfo, task));
          } else {
            controller.error(new TypeError(`the task '${taskInfo.name}' should be a function, got '${typeof task}'`));
          }
        } catch (error) {
          controller.error(error);
        }
      }
    },
    flush(controller) {
      for (const task of taskTokens) {
        controller.enqueue(task);
      }

      controller.terminate();
    },
  });
}
