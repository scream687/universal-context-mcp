const chalk = require('chalk');

let isDebug = false;
let isSilent = false;

function setDebug(val) { isDebug = val; }
function setSilent(val) { isSilent = val; }

const logger = {
    info: (msg) => { if (!isSilent) console.log(chalk.blue(msg)); },
    success: (msg) => { if (!isSilent) console.log(chalk.green(msg)); },
    warn: (msg) => { if (!isSilent) console.log(chalk.yellow(msg)); },
    error: (msg, err) => { 
        if (!isSilent) console.error(chalk.red(msg), err || ''); 
    },
    debug: (msg, data = '') => {
        if (isDebug && !isSilent) {
            console.log(chalk.gray(`[DEBUG] ${msg}`), data ? data : '');
        }
    }
};

module.exports = { logger, setDebug, setSilent };
