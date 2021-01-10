const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { exec } = require('child_process');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env, argv) {
  const DEV_MODE = argv.mode !== 'production';
  const DIST_DIR = path.resolve(__dirname, 'dist');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmdirSync(DIST_DIR, { recursive: true });
  }
  return [
    {
      name: 'lib',
      mode: DEV_MODE ? 'development' : 'production',
      devtool: 'source-map',
      watchOptions: {
        ignored: /node_modules/
      },
      context: path.resolve(__dirname, 'src'),
      entry: {
        libux: 'index.js'
      },
      output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: DIST_DIR,
        library: 'libux',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== "undefined" ? self : this'
      },
      module: {
        rules: [
          {
            test: /\.js(\?|$)/,
            exclude: [/node_modules/],
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      resolve: {
        extensions: ['.js'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules']
      },
      optimization: {
        minimize: !DEV_MODE,
        minimizer: [new TerserPlugin({})],
        splitChunks: {
          cacheGroups: {
            chunks: 'all'
          }
        }
      }
    },
    {
      name: 'doc',
      mode: DEV_MODE ? 'development' : 'production',
      devtool: 'source-map',
      watchOptions: {
        ignored: /node_modules/
      },
      context: path.resolve(__dirname, 'doc/example'),
      entry: {
        app: 'app.js'
      },
      output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: DIST_DIR
      },
      module: {
        rules: [
          {
            test: /\.js($|\?)/,
            exclude: [/node_modules/],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            ]
          },
          {
            test: /\.css(\?|$)/,
            use: [
              {
                loader: 'style-loader'
              },
              {
                loader: 'css-loader',
                options: {
                  import: true,
                  modules: true
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: [
                      ['postcss-preset-env'],
                      [
                        'cssnano',
                        {
                          preset: [
                            'default',
                            { discardComments: { removeAll: true } }
                          ]
                        }
                      ]
                    ]
                  }
                }
              }
            ]
          }
        ]
      },
      resolve: {
        extensions: ['.js'],
        modules: [path.resolve(__dirname, 'doc/example'), 'node_modules'],
        alias: {
          libux: path.resolve(__dirname, 'src/index')
        }
      },
      optimization: {
        minimize: !DEV_MODE,
        minimizer: [
          new TerserPlugin({
            parallel: true,
            extractComments: false,
            terserOptions: {
              output: {
                comments: false
              }
            }
          })
        ],
        splitChunks: {
          cacheGroups: {
            chunks: 'all'
          }
        }
      },
      plugins: [
        new HtmlWebpackPlugin({
          filename: 'todo-app.html',
          title: 'TodoMVC',
          inject: 'head'
        }),
        new webpack.ProgressPlugin({
          handler: percentage => {
            if (percentage !== 1) return;
            exec(`jsdoc -d ${DIST_DIR} -u doc/tutorials -R README.md -r src`);
          }
        })
      ],
      devServer: {
        contentBase: DIST_DIR,
        compress: true,
        port: 8080
      }
    }
  ];
};
