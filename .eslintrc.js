module.exports = {
    parser: '@typescript-eslint/parser',
    root: true,
    extends: ['airbnb', 'next/core-web-vitals', 'plugin:@typescript-eslint/eslint-recommended', 'prettier'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
    },
    plugins: ['react-hooks', 'prettier', '@typescript-eslint/eslint-plugin'],
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/jsx-props-no-spreading': 'off',
        'react/jsx-filename-extension': 'off',
        'react/jsx-wrap-multilines': [
            1,
            {
                assignment: 'parens-new-line'
            }
        ],
        'react/require-default-props': 'off',
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': ['off'],
        'react/function-component-definition': [
            2,
            {
                namedComponents: 'arrow-function',
                unnamedComponents: 'arrow-function'
            }
        ],
        'import/extensions': 'off',
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': 'off',
        'import/prefer-default-export': 'off',
        'import/order': [
            1,
            {
                groups: [['external', 'builtin'], 'type', 'internal', 'sibling', 'parent', 'index'],
                pathGroups: [
                    {
                        pattern: 'components|hooks|helpers|utils|store|types|constants|contexts|api',
                        group: 'internal'
                    }
                ],
                pathGroupsExcludedImportTypes: ['internal'],
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true
                },
                'newlines-between': 'always'
            }
        ],
        'no-param-reassign': [
            2,
            {
                props: false
            }
        ],
        'arrow-parens': ['error', 'always'],
        'object-curly-newline': [
            'error',
            {
                consistent: true,
                multiline: true
            }
        ],
        'no-case-declarations': 'off',
        'no-control-regex': 'off',
        'implicit-arrow-linebreak': 'off',
        semi: 'off',
        'quote-props': [2, 'as-needed'],
        'comma-dangle': 'off',
        'linebreak-style': 'off',
        'function-paren-newline': 'off',
        indent: 'off',
        'no-undef': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        'max-len': ['off', { ignoreComments: true, code: 100 }],
        '@typescript-eslint/ban-ts-comment': 'warn',
        'operator-linebreak': ['off'],
        indent: 'off',
        '@typescript-eslint/indent': 'off',
        'react/no-unstable-nested-components': 'warn',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
                printWidth: 120,
                semi: true
            }
        ],
        'react/jsx-indent': 'off',
        'react/jsx-indent-props': 'off',
        camelcase: 'off',
        'no-underscore-dangle': [
            'error',
            {
                enforceInMethodNames: true,
                enforceInClassFields: false,
                allowAfterThis: true
            }
        ]
    },
    settings: {
        'import/resolver': {
            node: {
                paths: ['.'],
                extensions: ['.js', '.jsx', '.ts', '.tsx']
            },
            typescript: {
                project: '.'
            }
        }
    }
};
