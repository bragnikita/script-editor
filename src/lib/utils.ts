export const processFormattedText = (src: string): string => {
    let s = src;

    let replacer1 = new Replacer('(', '\\(', '&:lbrake:');
    let replacer2 = new Replacer(')', '\\)', '&:rbrake:');
    s = replacer1.direct(s);
    s = replacer2.direct(s);
    s = s.replace(/(\((.+)\))/gm, '<span class="minds">$1</span>');
    s = replacer2.back(s);
    s = replacer1.back(s);

    let replacer = new Replacer('*', '\\*', '&:star:');
    s = replacer.direct(s);
    s = s.replace(/(\*(.+)\*)/gm, '<span class="emotions">$1</span>');
    s = replacer.back(s);

     replacer = new Replacer('_', '\\_', '&:underscore:');
    s = replacer.direct(s);
    s = s.replace(/(_(.+)_)/gm, '<span class="emphasis">$2</span>');
    s = replacer.back(s);

    return s;
};

class Replacer {
    private readonly sym: string;
    private readonly escaped: string;
    private readonly sub: string;
    constructor(sym: string, escaped: string, sub: string) {
        this.sub = sub;
        this.sym = sym;
        this.escaped = escaped;
    }
    direct(str: string) {
        return str.replace(this.escaped, this.sub);
    }
    back(str: string) {
        return str.replace(this.sub, this.sym);
    }
}