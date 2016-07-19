// SystemJS configuration file, see links for more information
// https://github.com/systemjs/systemjs
// https://github.com/systemjs/systemjs/blob/master/docs/config-api.md

/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
const map: any = {
  'firebase': 'vendor/firebase/firebase.js',
  'angularfire2': 'vendor/angularfire2',
  '@angular2-material': 'vendor/@angularr2-material',
  '@ngrx': 'vendor/@ngrx'
};

function createPackageConfFor(main: string): any {
  return {
    format: 'cjs',
    defaultExtension: 'js',
    main: main
  }
}

/** User packages configuration. */
const packages: any = {
  angularfire2: {
    defaultExtension: 'js',
    main: 'angularfire2.js'
  },
  '@angular2-material/core': createPackageConfFor('core.js'),
  '@angular2-material/checkbox': createPackageConfFor('checkbox.js'),
  '@angular2-material/button': createPackageConfFor('button.js'),
  '@angular2-material/grid-list': createPackageConfFor('grid-list.js'),
  '@angular2-material/icon': createPackageConfFor('icon.js'),
  '@angular2-material/input': createPackageConfFor('input.js'),
  '@angular2-material/list': createPackageConfFor('list.js'),
  '@angular2-material/progress-bar': createPackageConfFor('progress-bar.js'),
  '@angular2-material/progress-circle': createPackageConfFor('progress-circle.js'),
  '@angular2-material/radio': createPackageConfFor('radio.js'),
  '@angular2-material/sidenav': createPackageConfFor('sidenav.js'),
  '@angular2-material/slide-toggle': createPackageConfFor('slide-toggle.js'),
  '@angular2-material/tabs': createPackageConfFor('tabs.js'),
  '@angular2-material/toolbar': createPackageConfFor('toolbar.js'),
  '@ngrx/core': createPackageConfFor('index.js'),
  '@ngrx/store': createPackageConfFor('index.js'),
};

////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels: string[] = [
  // Angular specific barrels.
  '@angular/core',
  '@angular/common',
  '@angular/compiler',
  '@angular/forms',
  '@angular/http',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/app-shell',

  // Thirdparty barrels.
  'rxjs',

  // App specific barrels.
  'app',
  'app/shared',
  'app/board/focus',
  'app/board',
  /** @cli-barrel */
];

const cliSystemConfigPackages: any = {};
barrels.forEach((barrelName: string) => {
  cliSystemConfigPackages[barrelName] = { main: 'index' };
});

/** Type declaration for ambient System. */
declare var System: any;

// Apply the CLI SystemJS configuration.
System.config({
  map: {
    '@angular': 'vendor/@angular',
    'rxjs': 'vendor/rxjs',
    'main': 'main.js'
  },
  packages: cliSystemConfigPackages
});

// Apply the user's configuration.
System.config({ map, packages });
