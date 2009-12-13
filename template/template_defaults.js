"use strict";
/*jslint laxbreak: true, eqeqeq: true, undef: true, regexp: false */
/*global require, process, exports */

var sys = require('sys')

var template = require('./template');
var utils = require('../utils/utils');

/* TODO: Missing filters

    Don't know how:
        iriencode

    Autoescaping:
        escape
        safe
        safeseq

    Not implemented (yet):
        slugify
        stringformat
        striptags
        time
        timesince
        timeuntil
        title
        truncatewords
        truncatewords_html
        unordered_list
        upper
        urlencode
        urlize
        urlizetrunc
        wordcount
        wordwrap
        yesno
    
*/

var filters = exports.filters = {
    add: function (value, arg) {
        value = value - 0, arg = arg - 0;
        return (isNaN(value) || isNaN(arg)) ? '' : (value + arg);
    },
    addslashes: function (value, arg) { return utils.string.add_slashes("" + value); },
    capfirst: function (value, arg) { return utils.string.cap_first("" + value); },
    center: function (value, arg) { return utils.string.center("" + value, arg); },
    cut: function (value, arg) { return ("" + value).replace(new RegExp(arg, 'g'), ""); },
    date: function (value, arg) { return (value instanceof Date) ? utils.date.date(arg, value) : ''; },
    'default': function (value, arg) { return value ? value : arg; },
    default_if_none: function (value, arg) { return (value === null || value === undefined) ? arg : value; },

    dictsort: function (value, arg) {
        var clone = value.slice(0);
        clone.sort(function (a, b) { return a[arg] < b[arg] ? -1 : a[arg] > b[arg] ? 1 : 0; });
        return clone;
    },

    dictsortreversed: function (value, arg) {
        var tmp = filters.dictsort(value, arg);
        tmp.reverse();
        return tmp;
    },
    divisibleby: function (value, arg) { return value % arg === 0; },

    escape: function (value, arg) {
        // TODO: Implement escaping/autoescaping correctly
        throw "escape() filter is not implemented";
    },
    escapejs: function (value, arg) { return escape(value || ''); },
    filesizeformat: function (value, arg) {
        var bytes = value - 0;
        if (isNaN(bytes)) { return "0 bytes"; }
        if (bytes <= 1) { return '1 byte'; }
        if (bytes < 1024) { return bytes.toFixed(0) + ' bytes'; }
        if (bytes < 1024 * 1024) { return (bytes / 1024).toFixed(1) + 'KB'; }
        if (bytes < 1024 * 1024 * 1024) { return (bytes / (1024 * 1024)).toFixed(1) + 'MB'; }
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
    },
    first: function (value, arg) { return (value instanceof Array) ? value[0] : ""; },
    fix_ampersands: function (value, arg) { return ("" + value).replace('&', '&amp;'); },

    floatformat: function (value, arg) {
        arg = arg || -1;
        var num = value - 0,
            show_zeroes = arg > 0,
            fix = Math.abs(arg);
        if (isNaN(num)) {
            return '';
        }
        var s = num.toFixed(fix);
        if (!show_zeroes && s % 1 === 0) {
            return num.toFixed(0);
        }
        return s;
    },
    force_escape: function (value, arg) { return utils.html.escape("" + value); },
    get_digit: function (value, arg) {
        if (typeof value !== 'number' || typeof arg !== 'number' || typeof arg < 1) { return value; }
        var s = "" + value;
        return s[s.length - arg] - 0;
    },
    iriencode: function (value, arg) {
        // TODO: implement iriencode filter
        throw "iri encoding is not implemented";
    },
    join: function (value, arg) { return (value instanceof Array) ? value.join(arg) : '' },
    last: function (value, arg) { return (value instanceof Array && value.length) ? value[value.length - 1] : ''; },
    length: function (value, arg) { return value.hasOwnProperty('length') ? value.length : 0; },
    length_is: function (value, arg) { return value.hasOwnProperty('length') && value.length === arg; },
    linebreaks: function (value, arg) { return utils.html.linebreaks("" + value); },
    linebreaksbr: function (value, arg) { return "" + value.replace(/\n/g, '<br />'); },
    linenumbers: function (value, arg) {
        var lines = ("" + value).split('\n');
        var zeroes = "", len = ("" + lines.length).length;
        while (len--) { zeroes += "0"; }

        lines = lines.map( function (s, idx) {
            var num = "" + (idx + 1);
            return zeroes.slice(0, zeroes.length - num.length) + num + '. ' + s;
        });
        return lines.join('\n');
    },
    ljust: function (value, arg) {
        if (typeof arg !== 'number') { return ''; }
        if (arg <= value.length) { return value.slice(0, arg); }

        var spaces = "", len = arg - value.length;
        while (len--) { spaces += ' '; }
        return value + spaces;
    },
    lower: function (value, arg) { return typeof value === 'string' ? value.toLowerCase() : ''; },
    make_list: function (value, arg) { return String(value).split(''); },
    phone2numeric: function (value, arg) {
        value = String(value).toLowerCase();
        return value.replace(/[a-pr-y]/g, function (x) {
            var code = x.charCodeAt(0) - 91;
            if (code > 22) { code = code - 1; }
            return Math.floor(code / 3);
        });
    },
    pluralize: function (value, arg) {
        value = Number(value);
        var plural = arg ? String(arg).split(',') : ['', 's'];
        if (plural.length === 1) { plural.unshift(''); }
        if (isNaN(value)) { return ''; }
        return value === 1 ? plural[0] : plural[1];
    },
    pprint: function (value, arg) { return JSON.stringify(value); },
    random: function (value, arg) {
        return (value instanceof Array) ? value[ Math.floor( Math.random() * 4 ) ] : '';
    },
    removetags: function (value, arg) {
        return String(value).replace(/<(.|\n)*?>/g, '');
    },
    rjust: function (value, arg) {
        if (typeof arg !== 'number') { return ''; }
        if (arg <= value.length) { return value.slice(0, arg); }

        var spaces = "", len = arg - value.length;
        while (len--) { spaces += ' '; }
        return spaces + value;
    },
    safe: function (value, arg) {
        // TODO: implement autoescaping
        throw "safe is not implemented";
    },
    safeseq: function (value, arg) {
        // TODO: implement autoescaping
        throw "safeseq is not implemented";
    },
    slice: function (value, arg) {
        if (!(value instanceof Array)) { return []; }
        var parts = (arg || '').split(/:/g);
        
        if (parts[1] === '') {
            parts[1] = value.length;
        }
        parts = parts.map(Number);

        if (!parts[2]) {
            return value.slice(parts[0], parts[1]);
        }
        var out = [], i = parts[0], end = parts[1];
        for (;i < end; i += parts[2]) {
            out.push(value[i]);
        }
        return out;

    },
    title: function (value, arg) {
        throw "Not implemented"; /* http://ejohn.org/blog/title-capitalization-in-javascript/ */
    }

};


var nodes = exports.nodes = {

    TextNode: function (text) {
        return function () { return text; };
    },


    VariableNode: function (filterexpression) {
        return function (context) {
            return filterexpression.resolve(context);
        };
    },

    ForNode: function (itemname, listname, node_list, isReversed) {

        return function (context) {
            var forloop = { parentloop: context.get('forloop') },
                list = context.get(listname),
                out = '';

            if (! list instanceof Array) { return nodes.TextNode(''); }
            if (isReversed) { list = list.slice(0).reverse(); }

            context.push();
            context.set('forloop', forloop);

            list.forEach( function (o, idx, iter) {
                process.mixin(forloop, {
                    counter: idx + 1,
                    counter0: idx,
                    revcounter: iter.length - idx,
                    revcounter0: iter.length - (idx + 1),
                    first: idx === 0,
                    last: idx === iter.length - 1
                });
                context.set(itemname, o);

                out += template.evaluate_node_list( node_list, context );
            });

            context.pop();

            return out;
        };
    },

    IfNode: function (item_names, not_item_names, operator, if_node_list, else_node_list) {

        return function (context) {

            function not(x) { return !x; }
            function and(p,c) { return p && c; }
            function or(p,c) { return p || c; }

            var items = item_names.map( context.get, context ).concat(
                not_item_names.map( context.get, context ).map( not )
            );

            var isTrue = items.reduce( operator === 'and' ? and : or, true );

            if (isTrue) {
                return template.evaluate_node_list( if_node_list, context );
            } else if (else_node_list.length) {
                return template.evaluate_node_list( else_node_list, context );
            } else {
                return '';
            }
        };
    }

};

var callbacks = exports.callbacks = {
    'text': function (parser, token) { return nodes.TextNode(token.contents); },

    'variable': function (parser, token) {
        return nodes.VariableNode( new template.FilterExpression(token.contents) );
    },

    'for': function (parser, token) {
        
        var parts = template.split_token(token.contents);

        if (parts[0] !== 'for' || parts[2] !== 'in' || (parts[4] && parts[4] !== 'reversed')) {
            throw 'unexpected syntax in "for" tag: ' + token.contents;
        }
        
        var itemname = parts[1],
            listname = parts[3],
            isReversed = (parts[4] === 'reversed'),
            node_list = parser.parse('endfor');

        parser.delete_first_token();

        return nodes.ForNode(itemname, listname, node_list, isReversed);
    },
    
    'if': function (parser, token) {

        var parts = template.split_token( token.contents );

        if (parts[0] !== 'if') { throw 'unexpected syntax in "if" tag'; }

        // get rid of if keyword
        parts.shift();

        var operator = '',
            item_names = [],
            not_item_names = [];

        var p, next_should_be_item = true;

        while (p = parts.shift()) {
            if (next_should_be_item) {
                if (p === 'not') {
                    p = parts.shift();
                    if (!p) { throw 'unexpected syntax in "if" tag. Expected item name after not'; }
                    not_item_names.push( p );
                } else {
                    item_names.push( p );
                }
                next_should_be_item = false;
            } else {
                if (p !== 'and' && p !== 'or') { throw 'unexpected syntax in "if" tag. Expected "and" or "or"'; }
                if (operator && p !== operator) { throw 'unexpected syntax in "if" tag. Cannot mix "and" and "or"'; }
                operator = p;
                next_should_be_item = true;
            }
        }

        var node_list, else_list = [];
        
        node_list = parser.parse('else', 'endif');
        if (parser.next_token().type === 'else') {
            else_list = parser.parse('endif');
            parser.delete_first_token();
        }

        return nodes.IfNode(item_names, not_item_names, operator, node_list, else_list);
    }
};
