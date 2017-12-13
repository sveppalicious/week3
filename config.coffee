exports.config =
  modules:
    definition: false
    wrapper: false
  paths:
    public: 'public'
    watched: ['client']
  notifications: true
  files:
    stylesheets:
      joinTo:
        'css/app.css': /^(client|vendor|bower_components)/
      order:
        before: ['client/app.sass']
    templates:
      joinTo:
        'js/templates.js': /^client/
    javascripts:
      joinTo:
        'js/app.js': /^client/
        'js/vendor.js': /^bower_components/
      order:
        before: ['client/app.js']
  server:
    path: 'server.js'
    port: 8000
  watcher:
    usePolling: true
  plugins:
    sass:
      mode: 'ruby'
    autoprefixer:
      browsers: ["last 1 version", "> 1%", "ie 8", "ie 7"]
      cascade: false
  minify: true
