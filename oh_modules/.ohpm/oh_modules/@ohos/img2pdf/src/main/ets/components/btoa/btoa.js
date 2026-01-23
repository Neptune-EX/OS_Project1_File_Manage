import Buffer from '@ohos.buffer';

function btoa(str) {
    var buffer;

    if (Buffer.isBuffer(str)) {
        buffer = str;
    } else {
        buffer = Buffer.from(str.toString(), 'binary');
    }

    return buffer.toString('base64');
}

export default btoa

