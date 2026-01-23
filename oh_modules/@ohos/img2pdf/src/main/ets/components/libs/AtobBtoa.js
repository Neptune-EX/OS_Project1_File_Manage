import btoa from "../btoa/btoa";

var atob;

(function() {
  // @if MODULE_FORMAT!='cjs'
//  atob = globalObject.atob.bind(globalObject);
//  btoa = globalObject.btoa.bind(globalObject);
//  return;
  // @endif

  // @if MODULE_FORMAT='cjs'
  atob = function (input) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var str = (String (input)).replace (/[=]+$/, ''); // #31: ExtendScript bad parse of /=
        if (str.length % 4 === 1) {
            return "";
        }
        for (
        // initialize result and counters
            var bc = 0, bs, buffer, idx = 0, output = '';
        // get next character
            buffer = str.charAt (idx++); // eslint-disable-line no-cond-assign
        // character found in table? initialize bit storage and add its ascii value;
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
            bc++ % 4) ? output += String.fromCharCode (255 & bs >> (-2 * bc & 6)) : 0
        ) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf (buffer);
        }
        return output;
    }
  // @endif
})();

export { atob, btoa };
