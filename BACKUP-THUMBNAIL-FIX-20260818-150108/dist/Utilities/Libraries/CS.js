import chalk from "chalk";
import chalkTemplate from "chalk-template";
import Config from "./Config.js";
export function IsNullOrEmpty(value) {
    return !value || value.trim().length === 0;
}
export function Delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
export class Console {
    static Log(str) {
        console.log(chalkTemplate `{bold.greenBright [INFO]} ${ChalkedColorCodes(str)}`);
    }
    static Warn(str) {
        console.log(chalkTemplate `{bold.orange [WARNING]} ${ChalkedColorCodes(str)}`);
    }
    static Error(str) {
        console.log(chalkTemplate `{bold.red [ERROR]} ${ChalkedColorCodes(str)}`);
    }
    static Debug(str) {
        if (!Config.Debug)
            return;
        console.log(chalkTemplate `{bold.yellow [DEBUG]} ${ChalkedColorCodes(str)}`);
    }
}
export class List {
    list = [];
    constructor(listData) {
        if (listData)
            this.list = listData;
    }
    Contains(item) {
        return this.list.includes(item);
    }
    Add(item) {
        this.list.push(item);
    }
    AddMultiple(item) {
        this.list.push(...item);
    }
    Insert(item, index) {
        this.list.splice(index, 0, item);
    }
    Remove(item) {
        const i = this.list.indexOf(item);
        if (i === -1)
            return false;
        this.list.splice(i, 1);
        return true;
    }
    IndexOf(item) {
        return this.list.indexOf(item);
    }
    Get(i) {
        if (i >= 0 && i < this.list.length) {
            return this.list[i];
        }
        throw new Error("Out of bounds in Array, Array size is " + this.list.length + ", requested is " + i);
    }
    GetOrDefault(i) {
        if (i >= 0 && i < this.list.length) {
            return this.list[i];
        }
        return null;
    }
    Clear() {
        this.list = [];
    }
    Count() {
        return this.list.length;
    }
    Empty() {
        return this.list.length === 0;
    }
    First() {
        return this.list[0];
    }
    FirstOrDefault() {
        if (this.list.length < 1)
            return null;
        return this.list[0];
    }
    Last() {
        return this.list[this.list.length - 1];
    }
    LastOrDefault() {
        if (this.list.length < 1)
            return null;
        return this.list[this.list.length - 1] ?? null;
    }
    Exists(predicate) {
        return this.list.some(predicate);
    }
    ToArray() {
        return this.list;
    }
}
// chat gptd cuz i dont carw
export function ChalkedColorCodes(input) {
    const regex = /[§&]([0-9a-grlomn])/gi;
    let result = "";
    let currentStyles = [];
    let bgMode = false;
    let lastIndex = 0;
    const flush = (text) => {
        if (!text)
            return "";
        let styledText = text;
        for (const style of currentStyles) {
            styledText = style(styledText);
        }
        return styledText;
    };
    let match;
    while ((match = regex.exec(input)) !== null) {
        const code = match[1].toLowerCase();
        const plainText = input.slice(lastIndex, match.index);
        result += flush(plainText);
        if (code === "r") {
            currentStyles = [];
            bgMode = false;
        }
        else if (code === "g") {
            bgMode = true;
        }
        else {
            const styleFn = getStyleFunction(code, bgMode);
            if (styleFn)
                currentStyles.push(styleFn);
        }
        lastIndex = regex.lastIndex;
    }
    result += flush(input.slice(lastIndex));
    return result;
}
function getStyleFunction(code, bg) {
    const colorMap = {
        "0": "black",
        "1": "blue",
        "2": "green",
        "3": "cyan",
        "4": "red",
        "5": "magenta",
        "6": "yellow",
        "7": "white",
        "8": "gray",
        "9": "blueBright",
        a: "greenBright",
        b: "cyanBright",
        c: "redBright",
        d: "magentaBright",
        e: "yellowBright",
        f: "whiteBright",
    };
    if (code in colorMap) {
        const color = colorMap[code];
        // @ts-ignore
        return bg ? chalk[`bg${capitalize(color)}`] : chalk[color];
    }
    const styleMap = {
        l: chalk.bold,
        m: chalk.strikethrough,
        n: chalk.underline,
        o: chalk.italic,
    };
    return styleMap[code];
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
