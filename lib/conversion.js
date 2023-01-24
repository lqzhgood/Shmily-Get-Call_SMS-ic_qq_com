const dayjs = require('dayjs');
const config = require('../config');
const cheerio = require('cheerio');

// body: "{{name、: T^T::>_<:: 肚子好痛"
// name: "name"
// address: "1252015212341234"
// time: "2012/04/18 16:54:57"
// type: "收件箱"

exports.smsToMsg = function (arr) {
    return arr
        .filter(v => v.type !== '草稿箱')
        .map(v => {
            const send = {};
            const receive = {};
            const direction = v.type == '发件箱' ? 'go' : 'come';

            if (direction === 'go') {
                send.sender = config.rightNum;
                send.senderName = config.rightName;

                receive.receiver = v.address;
                receive.receiverName = v.name;
            }

            if (direction === 'come') {
                send.sender = v.address;
                send.senderName = v.name;

                receive.receiver = config.rightNum;
                receive.receiverName = config.rightName;
            }
            const $ = cheerio.load(v.body, { decodeEntities: false });

            const msg = {
                source: 'SMS',
                device: 'Phone',
                type: smsType(v.address, $),

                direction,

                ...send,
                ...receive,

                day: dayjs(v.time).format('YYYY-MM-DD'),
                time: dayjs(v.time).format('HH:mm:ss'),
                ms: dayjs(v.time).valueOf(),

                content: $.text(),
                html: v.body.replace(/\n/g, '<br/>'),

                $Dev: {
                    msAccuracy: false,
                },
            };
            return msg;
        });
};

function smsType(num, $dom) {
    if (isFeiXin(num)) {
        return '飞信';
    } else if (isCaiXin($dom)) {
        return '彩信';
    } else {
        return '短信';
    }
}

function isFeiXin(num) {
    if (String(num).trim().startsWith('12520')) {
        return true;
    } else if (String(num).trim().startsWith('161')) {
        return true;
    } else {
        return false;
    }
}

function isCaiXin($dom) {
    return $dom('img').length !== 0;
}
