const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');
const Papa = require('papaparse');
const config = require('./config.js');

const { smsToMsg } = require('./lib/conversion');

const INPUT_DIR = './input';

const smsBuffer = fs.readFileSync(path.join(INPUT_DIR, '/sms/', config.smsInputFile));
const smsText = iconv.decode(smsBuffer, 'gbk');

const json = Papa.parse(smsText, { quotes: true });
// 需要手工检查 json.error

const data = json.data
    .filter((v, i) => v[0] && i !== 0)
    .map((row, i) => {
        return {
            body: row[0],
            name: row[1],
            address: row[2],
            time: row[3],
            type: row[4],
        };
    });

const result = smsToMsg(data).sort((a, b) => a.ms - b.ms);

console.log('数量', result.length);

if (!fs.existsSync('./dist/')) {
    fs.mkdirSync('./dist');
}

fs.writeFileSync('./input/sms/csvToJson.json', JSON.stringify(json, null, 4));
fs.writeFileSync('./dist/sms_ic_qq.com.json', JSON.stringify(result, null, 4));
