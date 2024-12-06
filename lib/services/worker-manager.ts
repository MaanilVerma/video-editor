type WorkerMessage = {
  type: string;
  payload: any;
};

type WorkerTask = {
  id: string;
  worker: Worker;
  onProgress?: (progress: number) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
};

export class WorkerManager {
  private tasks: Map<string, WorkerTask> = new Map();

  createTask(
    workerScript: string,
    options: {
      onProgress?: (progress: number) => void;
      onComplete?: (result: any) => void;
      onError?: (error: Error) => void;
    }
  ): string {
    const taskId = crypto.randomUUID();
    const worker = new Worker(workerScript);

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { type, payload } = e.data;
      switch (type) {
        case "progress":
          options.onProgress?.(payload);
          break;
        case "complete":
          options.onComplete?.(payload);
          this.terminateTask(taskId);
          break;
        case "error":
          options.onError?.(new Error(payload));
          this.terminateTask(taskId);
          break;
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      options.onError?.(new Error(event.message));
      this.terminateTask(taskId);
    };

    this.tasks.set(taskId, {
      id: taskId,
      worker,
      ...options,
    });

    return taskId;
  }

  terminateTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.worker.terminate();
      this.tasks.delete(taskId);
    }
  }

  terminateAll() {
    this.tasks.forEach((task) => this.terminateTask(task.id));
  }
}

export const workerManager = new WorkerManager();
