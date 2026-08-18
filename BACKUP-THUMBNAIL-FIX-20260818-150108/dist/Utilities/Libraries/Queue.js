import { Console, List } from "./CS.js";
// simple queue, requires port
export class Queue {
    pending = new List();
    isProcessing = false;
    port = 0;
    boxId = "";
    constructor(boxId, port) {
        this.port = port;
        this.boxId = boxId;
    }
    async Process() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        Console.Debug(`Beginning to process queue on port ${this.port}`);
        while (!this.pending.Empty()) {
            const item = this.pending.First();
            this.pending.Remove(item);
            try {
                Console.Debug(`Processing item on port ${this.port}`);
                const time = new Date().getTime();
                const result = await item.task(this.port);
                const afterTime = new Date().getTime();
                item.resolve(result);
                Console.Debug(`Resolved item on port ${this.port}. Time to render: ${afterTime - time}ms`);
            }
            catch (e) {
                Console.Error(`Error while processing item on queue &c&l${this.port}&r in box &c&l${this.boxId}&r.\n &c&lMessage:&r \n ${e?.message} \n&c&lFull Error:&r \n ${e}\n`);
                item.reject(e);
            }
        }
        Console.Debug(`Done Processing items on port ${this.port}`);
        this.isProcessing = false;
    }
    Add(item) {
        this.pending.Add(item);
    }
}
// queue box: does load balancing between queues
export class QueueBox {
    Queues = new List();
    BoxId;
    constructor(boxId, ports) {
        this.BoxId = boxId;
        ports.forEach(port => this.Queues.Add(new Queue(boxId, port)));
    }
    async Enqueue(task) {
        const queue = this.Queues.ToArray().reduce((shortest, current) => {
            return current.pending.Count() < shortest.pending.Count() ? current : shortest;
        });
        return new Promise((res, rej) => {
            queue.Add({ task, resolve: res, reject: rej });
            Console.Debug(`Processing queue... Queue: ${queue.port}, Pending: ${queue.pending.Count()}`);
            queue.Process();
        });
    }
}
