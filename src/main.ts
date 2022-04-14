import * as dumper from './dumper'
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { exit } from 'process';

(
    async () => {
        if (isMainThread) {
            await dumper.clearPreviousDump().catch(console.error);
            const workers = [
                new Worker(__filename, { workerData: 0 }),
                new Worker(__filename, { workerData: 1 }),
                new Worker(__filename, { workerData: 2 })
            ];
            let finishCount = 0;
            workers.forEach(w => {
                w.on('exit', (code) => {
                    if (code !== 0)
                      console.error(new Error(`=> Worker stopped with exit code ${code}`));
                    finishCount++;
                });
            });

            setInterval(() => {
                if (finishCount >= 3) {
                    console.log('=> finished dumping');
                    exit(0);
                }
            }, 1000)
        } else {
            switch (workerData) {
                case 0:
                    await dumper.dumpOtherItems();
                    break;
                case 1:
                    await dumper.dumpClothes(true);
                    break;
                case 2:
                    await dumper.dumpClothes(false);
                    break;
                default:
                    break;
            } 
        }
    }
)();