export default {
  extends: ['stylelint-config-standard-less', 'stylelint-config-recess-order'],
  rules: {
    'custom-property-empty-line-before': [
      'always',
      {
        except: ['after-comment', 'after-custom-property', 'first-nested'],
        ignore: ['after-comment', 'first-nested'],
      },
    ],
    'rule-empty-line-before': null,
    'no-descending-specificity': null,
    'declaration-property-value-no-unknown': null,
    // 'rule-empty-line-before': [
    //   'always',
    //   {
    //     except: ['after-rule', 'after-single-line-comment', 'inside-block-and-after-rule', 'first-nested'],
    //     ignore: ['after-comment', 'first-nested', 'inside-block'],
    //   },
    // ],
  },
}
