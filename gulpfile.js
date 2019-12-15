const  {src, dest, parallel, series, watch} = require('gulp');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const babel = require('gulp-babel');

const OUTPUT_DIR = 'static_out';

function clean() {
    return del([OUTPUT_DIR]);
}

function html() {
    return src('static/**/*.html', {base: 'static'})
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            maxLineLength: 120
        }))
        .pipe(dest(OUTPUT_DIR));
}

function js() {
    return src('static/**/*.js', {base: 'static'})
        // I have this commented out in asherfoster/experiments. Please don't fucking break.
        .pipe(babel({
          presets: ['@babel/preset-env', 'minify']
        }))
        .pipe(dest(OUTPUT_DIR))
}

function assets() {
    return src(['static/**/*.png', 'static/**/*.css'], {base: 'static'})
        .pipe(dest(OUTPUT_DIR))
}

exports.default = series(clean, parallel(html, js, assets));

exports.watch = () => watch('static/**/*', exports.default);


