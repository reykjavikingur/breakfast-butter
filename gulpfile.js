/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
const assembler      = require('butter-assemble');
const beautify       = require('js-beautify').js_beautify;
const browsersync    = require('browser-sync');
const concat         = require('gulp-concat');
const csso           = require('gulp-csso');
const del            = require('del');
const dna            = require('fabricator-dna');
const exc            = require('butter-assemble-exclude');
const fs             = require('fs');
const gulp           = require('gulp');
const gulpif         = require('gulp-if');
const gutil          = require('gulp-util');
const path           = require('path');
const prefix         = require('gulp-autoprefixer');
const reload         = browsersync.reload;
const rename         = require('gulp-rename');
const runSequence    = require('run-sequence');
const sass           = require('gulp-sass');
const slugify        = require('slugify');
const source         = require('vinyl-source-stream');
const sourcemaps     = require('gulp-sourcemaps');
const webpack        = require('webpack');
const nodemon        = require('nodemon');


/**
 * configuration
 */
const config = {
	dev: gutil.env.dev,
	materials: ['src/materials/**/*'],
	views: ['src/views/**/*', '!src/views/+(layouts)/**'],
	dna: 'src/data/dependencies.json',
    port: {
        browsersync    : 3000,
        proxy          : 3030
    },
	styles: {
		browsers: 'last 1 version',
		fabricator: {
			src: 'src/assets/fabricator/styles/fabricator.scss',
			dest: 'dist/assets/fabricator/styles',
			watch: 'src/assets/fabricator/styles/**/*.scss',
		},
		toolkit: {
			src: 'src/assets/toolkit/styles/toolkit.scss',
			dest: 'dist/assets/toolkit/styles',
			watch: 'src/assets/toolkit/styles/**/*.scss',
		}
	},
	scripts: {
		fabricator: {
			src: './src/assets/fabricator/scripts/fabricator.js',
			dest: 'dist/assets/fabricator/scripts',
			watch: 'src/assets/fabricator/scripts/**/*',
		},
		toolkit: {
			src: './src/assets/toolkit/scripts/toolkit.js',
			dest: 'dist/assets/toolkit/scripts',
			watch: 'src/assets/toolkit/scripts/**/*',
		},
		vendor: {
			dest: 'dist/assets/toolkit/scripts',
			watch: 'src/assets/toolkit/scripts/vendor/**/*'
		},
		helpers: {
			"cond": require('handlebars-cond').cond,
			"lipsum": require('handlebars-lipsum'),
			"loop": require('handlebars-loop'),
			"dependencies": dna.dependencies,
			"dependents": dna.dependents,
			"hasDependencies": dna.hasDependencies,
			"hasDependents": dna.hasDependents
		}
	},
	images: {
		fabricator: {
			src: ['src/assets/fabricator/images/**/*', 'src/favicon.ico'],
			dest: 'dist/assets/fabricator/images',
			watch: 'src/assets/fabricator/images/**/*',
		},
		toolkit: {
			src: ['src/assets/toolkit/images/**/*', 'src/favicon.ico'],
			dest: 'dist/assets/toolkit/images',
			watch: 'src/assets/toolkit/images/**/*',
		}
	},
	fonts: {
		src: './src/assets/toolkit/fonts/**/*',
		dest: 'dist/assets/toolkit/fonts',
		watch: 'src/assets/toolkit/fonts/**/*'
	},
	templates: {
		watch: ['src/**/*.{html,md,json,yml}', '!src/data/dependencies.json'],
	},
	tasks: [
		'dna',
		'styles',
		'vendor',
		'scripts',
		'images',
		'fonts',
		'assembler'
	],
	dest: 'dist',
	src: 'src',
	hooks: {
		beforeMaterials: exc,
		beforeViews: exc
	}
};

// Webpack
const webpackConfig = require('./webpack.config')(config);


// clean
gulp.task('clean', del.bind(null, [config.dest]));

// styles
gulp.task('styles:fabricator', () => {
	gulp.src(config.styles.fabricator.src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(rename('f.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.styles.fabricator.dest))
		.pipe(gulpif(config.dev, reload({stream: true})));
});

gulp.task('styles:toolkit', () => {
	gulp.src(config.styles.toolkit.src)
		.pipe(gulpif(config.dev, sourcemaps.init()))
		.pipe(sass({
			includePaths: './node_modules',
		}).on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(gulpif(config.dev, sourcemaps.write()))
		.pipe(gulp.dest(config.styles.toolkit.dest))
		.pipe(gulpif(config.dev, reload({stream: true})));
});

gulp.task('styles', ['styles:fabricator', 'styles:toolkit']);

// scripts
gulp.task('scripts', (done) => {
	webpack(webpackConfig, (err, stats) => {
		if (err) {
			gutil.log(gutil.colors.red(err()));
		}
		const result = stats.toJson();
		if (result.errors.length) {
			result.errors.forEach((error) => {
				gutil.log(gutil.colors.red(error));
			});
		}
		done();
	});
});

// images
gulp.task('images:fabricator', ['favicon'], () => {
	return gulp.src(config.images.fabricator.src)
		.pipe(gulp.dest(config.images.fabricator.dest));
});

gulp.task('images:toolkit', ['favicon'], () => {
	return gulp.src(config.images.toolkit.src)
		.pipe(gulp.dest(config.images.toolkit.dest));
});

gulp.task('images', ['images:fabricator', 'images:toolkit']);


gulp.task('favicon', () => {
	return gulp.src('src/favicon.ico')
		.pipe(gulp.dest(config.dest));
});


/**
 * ------------------------------------------------------------------------
 * CUSTOM TASKS
 * ------------------------------------------------------------------------
 */
/**
 * @name vendor
 * @description CAM: Added the vendor task which concats all the vendor .js
 * files into a single file. This is useful when you need to include a minified
 * .js file (typically name like: myscript.min.js).
 */
gulp.task('vendor', (done) => {
	gulp.src(config.scripts.vendor.watch)
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(config.scripts.vendor.dest));

	done();
});

/**
 * @name font
 * @description CAM: Added the font task which copies the fonts directory to the
 * config.dest directory
 */
gulp.task('fonts', () => {
	return gulp.src(config.fonts.src)
		.pipe(gulp.dest(config.fonts.dest));
});

/**
 * @name dna
 * @description CAM: Added the dna task which generates the dependencies.json file
 */
gulp.task('dna', (done) => {
	dna.scan(config);
	done();
});


// assembler
/**
 * CAM: Added custom helpers from config.scripts.helpers object
 */
gulp.task('assembler', (done) => {
	assembler({
		logErrors: config.dev,
		dest: config.dest,
		helpers: config.scripts.helpers,
		hooks: config.hooks
	});
	done();
});

// nodemon -> start server and reload on change
gulp.task('nodemon', (done) => {
    if (!config.dev) { done(); return; }

    let callbackCalled = false;
    nodemon({
        watch : config.dest,
        script: __dirname + '/index.js',
        ext: 'js ejs json jsx html css scss'
    }).on('start', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            done();
        }
    }).on('restart', function () {
        browsersync.reload();
    });
});

// server
gulp.task('serve', () => {

    browsersync({
        notify            : false,
        timestamps        : true,
        reloadDelay       : 2000,
        reloadDebounce    : 2000,
        logPrefix         : '00:00:00',
        port              : config.port.browsersync,
        ui                : {port: config.port.browsersync+1},
        proxy             : 'localhost:'+config.port.proxy
    });

	gulp.task('styles:watch', ['styles']);
	gulp.watch([config.styles.fabricator.watch, config.styles.toolkit.watch], ['styles:watch']);

	gulp.task('scripts:watch', ['scripts'], browsersync.reload);
	gulp.watch([config.scripts.fabricator.watch, config.scripts.toolkit.watch], ['scripts:watch']);

	gulp.task('images:watch', ['images'], browsersync.reload);
	gulp.watch(config.images.toolkit.watch, ['images:watch']);

	/**
	 * CAM: Added the 'dna' task to the assembler's watch so that when a file is
	 * changed, it regens the dependencies.json file
	 */
	gulp.task('assembler:watch', ['dna', 'assembler'], browsersync.reload);
	gulp.watch(config.templates.watch, ['assembler:watch']);

	/**
	 * CAM: Added so that we can get an uncompiled js file with vendor scripts
	 */
	gulp.task('vendor:watch', ['vendor'], browsersync.reload);
	gulp.watch(config.scripts.vendor.watch, ['vendor:watch']);

	/**
	 * CAM: Added so that we can get the fonts copied into the dist directory
	 */
	gulp.task('fonts:watch', ['fonts'], browsersync.reload);
	gulp.watch(config.fonts.watch, ['fonts:watch']);

});

/**
 *
 * create:material
 *
 * @author Cam Tullos cam@tullos.ninja
 * @since 1.0.1
 *
 * @description Creates a new ~/src/materials/*.html file
 * and the cooresponding ~/src/views/*.html file.
 *
 * @param params {Object} The configuration object.
 * @property --name The name of the material. The name will be slugified before file creation.
 * @property --type The atomic design type (atom, molecule, organism).
 * @property --dna The DNA ID used for dependency checking.
 */
const create_material = (params) => {
    let name = params['name'];
    if (!name) { return; }

    let type = params['type'] || 'TYPE';
    let dna = params['dna'] || 'DNA-ID';

    let id = slugify(String(name).toLowerCase());

    let mname = (dna !== 'DNA-ID') ? dna : id;

    // Create the material file
    let dir = (params.hasOwnProperty('dir')) ? slugify(String(params.dir).toLowerCase()) : id;
    let mpath = __dirname + '/' + config.src + '/materials/' + dir;

    if (!fs.existsSync(mpath)) { fs.mkdirSync(mpath); }

    let mfile = mpath + '/' + mname +'.html';
    let mat = `---
		{
		  "atomic": "${type}",
		  "dna": "${dna}"
		}
		---
		<div data-dna="${dna}"></div>`;

    mat = mat.replace(/\t/g, '');

    fs.writeFileSync(mfile, mat);

    // Create the view file
    let vfile = __dirname + '/' + config.src + '/views/' + dir + '.html';
    if (!fs.existsSync(vfile)) {
        let view = `---
			fabricator: true
			title: "${dir}"
			---

			<h1 data-f-toggle="labels" class="mt-4">{{title}}</h1>

			{{#each materials.${dir}.items}}

			{{> f-item this}}

			{{/each}}`;

        view = view.replace(/\t/g, '');

        fs.writeFileSync(vfile, view);
    }
};

gulp.task('create:material', () => {

	if (!gutil.env.name) { return; }

	let name = gutil.env.name;
	let dna = gutil.env.dna;
	let type = gutil.env.type;

    return create_material({name: name, type: type, dna: dna});
});

/**
 *
 * create:template
 *
 * @author Cam Tullos cam@tullos.ninja
 * @since 1.0.1
 *
 * @description Creates a new ~/src/views/templates/*.html file
 */
gulp.task('create:template', () => {
	if (!gutil.env.name) { return; }

	let name = gutil.env.name || Date.now();
	let id = slugify(String(name).toLowerCase());

	let file = __dirname + '/' + config.src + '/views/templates/' + id + '.html';

	// Exit if the file already exists;
	if (fs.existsSync(file)) {
		console.log(`[00:00:00] [NOTICE] 'create:template' ${file} already exists.`);
		return;
	}


	let tmp = `---
		title: "${name}"
		---`;

	tmp = tmp.replace(/\t/g, '');

	fs.writeFileSync(file, tmp);

});


/**
 *
 * create:helper
 *
 * @author Cam Tullos cam@tullos.ninja
 * @since 1.0.1
 *
 * @description Creates a new ~/src/views/templates/*.html file
 */
gulp.task('create:helper', () => {
	if (!gutil.env.name) { return; }

	let name = gutil.env.name || Date.now();
	let id = slugify(String(name).toLowerCase());

	let file = __dirname + '/' + config.src + '/views/helpers/' + id + '.html';

	// Exit if the file already exists;
	if (fs.existsSync(file)) {
		console.log(`[00:00:00] [NOTICE] 'create:helper' ${file} already exists.`);
		return;
	}


	let tmp = `---
		title: "${name}"
		fabricator: true
		---
		<header class="mb-3">
		  <h1>{{title}}</h1>
		</header>`;

	tmp = tmp.replace(/\t/g, '');

	fs.writeFileSync(file, tmp);

});

// default build task
gulp.task('default', (done) => {
	// run build
    if (config.dev) {
        runSequence(['clean'], config.tasks, ['nodemon'], () => {
            gulp.start('serve');
            done();
        });
    } else {
        runSequence(['clean'], config.tasks, () => {
            done();
        });
    }
});
