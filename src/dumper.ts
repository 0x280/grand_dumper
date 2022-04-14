import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export const CONFIG = {
    DUMP_PATH: process.env.INIT_CWD + '/dump',
    ITEM_ITERATION: 500,
    COLOR_ITERATION: 30
};

const CLOTHES_NAME_MAP = new Map([
    [ 1, 'masks' ],
    [ 4, 'pants' ],
    [ 5, 'backpacks' ],
    [ 6, 'shoes' ],
    [ 7, 'accessories' ],
    [ 8, 'undershirts' ],
    [ 9, 'vests' ],
    [ 11, 'tops' ],
    [ 12, 'hats' ],
    [ 13, 'glasses' ],
    [ 14, 'watches' ],
    [ 15, 'earpieces' ],
    [ 16, 'gloves' ]
]);

async function dumpFile(url: string, filePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const dirname = path.dirname(filePath);
        fs.mkdir(dirname, {recursive: true}, (err) => {
            axios({ url: url, method: 'GET', responseType: 'stream' })
                .catch(reason => {
                    if (reason && reason.response && reason.response.status == 404) {
                        resolve();
                    } else resolve();
                })
                .then(async res => {
                    if (res) {
                        const writeStream = fs.createWriteStream(filePath);
                        res.data.pipe(writeStream);

                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                    }
                }
            );
        })
        
    })
}

export async function dumpClothes(isMale: boolean = true): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const gender = (isMale ? 'male' : 'female');

        CLOTHES_NAME_MAP.forEach(async (name, id) => {
            for (let i = 0; i < CONFIG.ITEM_ITERATION; i++) {
                for (let n = 0; n < CONFIG.COLOR_ITERATION; n++) {
                    await dumpFile(`https://launcher.gta5grand.com/game/images/${gender}/${id}/${i}_${n}.png`, `${CONFIG.DUMP_PATH}\\clothes\\${gender}\\${name}\\${i}_${n}.png`)
                        .catch(console.error);
                }
            }
        })

        resolve();
    })
}

export async function dumpOtherItems() {
    return new Promise<void>(async (resolve, reject) => {
        for (let i = 0; i < CONFIG.ITEM_ITERATION; i++) {
            await dumpFile(`https://launcher.gta5grand.com/game/images/other_items/${i}.png`, `${CONFIG.DUMP_PATH}\\other_items\\${i}.png`)
                    .catch(reject);
        }
        resolve();
    })
}

export async function clearPreviousDump(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rm(CONFIG.DUMP_PATH, {recursive: true}, (err) => {
            if (err && err.errno != -4058) {
                reject(err);
            } else {
                fs.mkdir(CONFIG.DUMP_PATH, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            }
        });
    });
}
