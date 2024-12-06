declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

interface WorkerResponse {
  type: "progress" | "complete" | "error" | "preview";
  payload: any;
}
