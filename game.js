
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'clutch.data';
    var REMOTE_PACKAGE_BASE = 'clutch.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'fonts', true, true);
Module['FS_createPath']('/', 'sprites', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_clutch.data');

    };
    Module['addRunDependency']('datafile_clutch.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 67372, "filename": "/main.lua"}, {"audio": 0, "start": 67372, "crunched": 0, "end": 109824, "filename": "/fonts/FredokaOne-Regular.ttf"}, {"audio": 0, "start": 109824, "crunched": 0, "end": 114316, "filename": "/fonts/OFL.txt"}, {"audio": 0, "start": 114316, "crunched": 0, "end": 115723, "filename": "/sprites/arrow.png"}, {"audio": 0, "start": 115723, "crunched": 0, "end": 119271, "filename": "/sprites/backButton.png"}, {"audio": 0, "start": 119271, "crunched": 0, "end": 122678, "filename": "/sprites/backButton2.png"}, {"audio": 0, "start": 122678, "crunched": 0, "end": 126621, "filename": "/sprites/bee.png"}, {"audio": 0, "start": 126621, "crunched": 0, "end": 130986, "filename": "/sprites/bug.png"}, {"audio": 0, "start": 130986, "crunched": 0, "end": 134794, "filename": "/sprites/chick.png"}, {"audio": 0, "start": 134794, "crunched": 0, "end": 136763, "filename": "/sprites/coin.png"}, {"audio": 0, "start": 136763, "crunched": 0, "end": 187246, "filename": "/sprites/deathMenu.png"}, {"audio": 0, "start": 187246, "crunched": 0, "end": 192371, "filename": "/sprites/endlessButton.png"}, {"audio": 0, "start": 192371, "crunched": 0, "end": 197099, "filename": "/sprites/endlessButton2.png"}, {"audio": 0, "start": 197099, "crunched": 0, "end": 201765, "filename": "/sprites/frog.png"}, {"audio": 0, "start": 201765, "crunched": 0, "end": 204799, "filename": "/sprites/icon.png"}, {"audio": 0, "start": 204799, "crunched": 0, "end": 205703, "filename": "/sprites/lava.png"}, {"audio": 0, "start": 205703, "crunched": 0, "end": 207334, "filename": "/sprites/load.png"}, {"audio": 0, "start": 207334, "crunched": 0, "end": 207957, "filename": "/sprites/lock.png"}, {"audio": 0, "start": 207957, "crunched": 0, "end": 211429, "filename": "/sprites/mannash.png"}, {"audio": 0, "start": 211429, "crunched": 0, "end": 247088, "filename": "/sprites/menu.png"}, {"audio": 0, "start": 247088, "crunched": 0, "end": 249423, "filename": "/sprites/missile.png"}, {"audio": 0, "start": 249423, "crunched": 0, "end": 254949, "filename": "/sprites/modeButton.png"}, {"audio": 0, "start": 254949, "crunched": 0, "end": 260309, "filename": "/sprites/modeButton2.png"}, {"audio": 0, "start": 260309, "crunched": 0, "end": 264690, "filename": "/sprites/msr.png"}, {"audio": 0, "start": 264690, "crunched": 0, "end": 268569, "filename": "/sprites/ninja.png"}, {"audio": 0, "start": 268569, "crunched": 0, "end": 285406, "filename": "/sprites/pause.png"}, {"audio": 0, "start": 285406, "crunched": 0, "end": 290130, "filename": "/sprites/person.png"}, {"audio": 0, "start": 290130, "crunched": 0, "end": 291042, "filename": "/sprites/platform.png"}, {"audio": 0, "start": 291042, "crunched": 0, "end": 295066, "filename": "/sprites/platformBroken.png"}, {"audio": 0, "start": 295066, "crunched": 0, "end": 296563, "filename": "/sprites/player.png"}, {"audio": 0, "start": 296563, "crunched": 0, "end": 300274, "filename": "/sprites/red.png"}, {"audio": 0, "start": 300274, "crunched": 0, "end": 302088, "filename": "/sprites/save.png"}, {"audio": 0, "start": 302088, "crunched": 0, "end": 338382, "filename": "/sprites/skins.png"}, {"audio": 0, "start": 338382, "crunched": 0, "end": 340628, "filename": "/sprites/skinsButton.png"}, {"audio": 0, "start": 340628, "crunched": 0, "end": 343971, "filename": "/sprites/snowman.png"}, {"audio": 0, "start": 343971, "crunched": 0, "end": 347902, "filename": "/sprites/spikes.png"}, {"audio": 0, "start": 347902, "crunched": 0, "end": 352340, "filename": "/sprites/steve.png"}, {"audio": 0, "start": 352340, "crunched": 0, "end": 353781, "filename": "/sprites/warning.png"}, {"audio": 0, "start": 353781, "crunched": 0, "end": 357670, "filename": "/sprites/zombie.png"}], "remote_package_size": 357670, "package_uuid": "1d4db819-1f55-48fa-9cc2-dec8b133ee86"});

})();
