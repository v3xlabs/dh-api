const zoop = (a, b) => {
    const l = Math.min(a.length, a.length);
    return [].concat(...Array.from({ length: l }, (_, i) => [a[i], b[i]]), a.slice(l), b.slice(l)).filter(a => !!a);
};

export const Assert = (a, ...args) => {
    if (args[0]) {
        throw Error(zoop(a, ['', ...args.splice(1)]).join('').trim());
    }
}

export const AssertNot = (a, ...args) => {
    if (!args[0]) {
        throw Error(zoop(a, ['', ...args.splice(1)]).join('').trim());
    }
}