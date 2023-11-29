import { foldInside, foldNodeProp, indentNodeProp, LanguageSupport, LRLanguage } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
// @ts-ignore
import { parser } from './parser.js';

const moshellParser = parser.configure({
  props: [
    styleTags({
      BooleanLiteral: t.bool,
      Number: t.number,
      LineComment: t.lineComment,
      BlockComment: t.blockComment,
      'for while if else match return break continue': t.controlKeyword,
      'in': t.operatorKeyword,
      'val var use fun': t.definitionKeyword,
      ', ;': t.separator,
      ArithOp: t.arithmeticOperator,
      LogicOp: t.logicOperator,
      CompareOp: t.compareOperator,
      AssignOp: t.definitionOperator,
      Redir: t.definitionOperator,
      '( )': t.paren,
      '[ ]': t.squareBracket,
      '{ }': t.brace,
      '.': t.derefOperator,
      PrefixOp: t.logicOperator,
      TemplateString: t.special(t.string),
      RawString: t.string,
      Identifier: t.variableName,
      Variable: t.variableName,
    }),
    indentNodeProp.add({
      Application: context => context.column(context.node.from) + context.unit,
    }),
    foldNodeProp.add({
      Application: foldInside,
    }),
  ],
});
const moshellLanguage = LRLanguage.define({
  name: 'moshell',
  parser: moshellParser,
  languageData: {
    commentTokens: { line: '//', multiline: { open: '/**', close: '*/' } },
  },
});

export const moshell = () => new LanguageSupport(moshellLanguage);
