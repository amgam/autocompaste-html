var ACPToolKit = (function () {
    // ACPToolKit depends on DataStorage. Must be loaded after DataStorage.js.
    var module = {};

    module.setCurrentParticipantId = function (pid) {
        DataStorage.setItem('pid', pid);
    }

    module.getCurrentParticipantId = function () {
        var pid = DataStorage.getItem('pid');
        if (!pid) {
            alert('Current participant not set!');
            pid = prompt('Enter current participant ID:').toString();
            this.setCurrentParticipantId(pid);
        }
        return pid;
    }

    module.clearAllData = function () {
        ['pid', 'pretest', 'trials', 'posttest'].forEach(function (key) {
            DataStorage.removeItem(key);
        });
    }

    module.downloadFormData = function (formResponses, type) {
        var headers = [];
        var data = [];
        var pid = ACPToolKit.getCurrentParticipantId();
        formResponses.unshift({ name: 'pid', value: pid });
        formResponses.forEach(function (item) {
            headers.push(item.name);
            data.push(item.value);
        });
        arrayToCSV([headers, data], 'acp-' + pid + '-' + type);
    }

    module.downloadTrialResults = function (data) {
        var pid = ACPToolKit.getCurrentParticipantId();
        arrayToCSV(data, 'acp-' + pid + '-trials');
    }

    function arrayToCSV (twoDiArray, fileName) {
        //  http://stackoverflow.com/questions/17836273/export-javascript-data
        //  -to-csv-file-without-server-interaction
        var csvRows = [];
        for (var i = 0; i < twoDiArray.length; ++i) {
            for (var j = 0; j < twoDiArray[i].length; ++j) {
                twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"';
            }
            csvRows.push(twoDiArray[i].join(','));
        }

        var csvString = csvRows.join('\r\n');
        var $a = $('<a></a>', {
                href: 'data:attachment/csv;charset=utf-8,' + escape(csvString),
                target: '_blank',
                download: fileName + '.csv'
            });

        $('body').append($a[0]);
        $a.get(0).click();
        $a.remove();
    }

    $(function () {
        // Populate interface with current participant's ID
        var $pidEl = $('.js-pid');
        if ($pidEl.length > 0) {
           $pidEl.text(module.getCurrentParticipantId());
        }
    });

    if (window.location.pathname.indexOf('experiment') > -1) {
        var wm = new WindowManager('autocompaste-display');
        var currentTrialOptions = null;
        var startTime = null;

        module.presentTrial = function (options) {
            startTime = new Date().getTime();
            currentTrialOptions = options;

            var data_file = options.data_file;


            $('.js-expt-technique').text(options.technique);
            $('.js-expt-granularity').text(options.granularity);
            $('.js-expt-windows').text(options.windows);

            // Clean up DOM
            wm.destroyAllWindows();
            $('#autocompaste-completion').remove();
            $('#autocompaste-measure-num-wrapped-lines').remove();
            $('#autocompaste-measure-get-single-line-height').remove();
            $('#autocompaste-measure-text-length-in-pixels').remove();
            $('#autocompaste-completion').remove();

            switch (options.technique) {
                case 'TRADITIONAL':
                    var engine = null;
                    break;
                case 'ACP':
                default:
                    var engine = new AutoComPaste.Engine();
                    break;
            }

            var window_callback = function(windowData) {
              // debugger;
              var randomized_input = pickRandomProperty(windowData);
              var stimuli = "";

              switch (options.granularity){
                case 'phrase':
                  stimuli = extractPhrase(randomized_input);
                  break;
                case 'sentence':
                  stimuli = extractSentence(randomized_input);
                  break;
                case 'paragraph':
                  stimuli = extractParagraph(randomized_input);
                  break;
              }

              $('.js-expt-stimuli').text(stimuli);

              // Highlight the relevant text.
              iface.addEventListener('loaded', function () {
                // debugger;
                var lines_to_highlight = stimuli.split("\n\n");

                var windows = wm.getWindowList();
                for (var i = 0; i < windows.length; i++) {
                  if (windows[i] == 'text_editor') {
                    continue;
                  }

                  var win = wm.getWindowContent(windows[i]);
                  var content = $(win).find('pre').html();
                  lines_to_highlight.map (function (value, index, array) {
                    content = content.replace (value,
                      "<span class=\"highlighted\">" + value + "</span>");
                    });

                    $(win).find('pre').empty().append(content);
                  }
                });
            }
            // var numOfWindows = 4;
            var iface = new AutoComPaste.Interface(wm, engine, data_file, options.windows, window_callback);

        }

        module.getCurrentTrialState = function () {
            if (!currentTrialOptions) {
                console.error('There is no trial running right now!');
                return {};
            }
            var endTime = new Date().getTime();
            currentTrialOptions.start_time = startTime;
            currentTrialOptions.end_time = endTime;
            currentTrialOptions.duration = endTime - startTime;
            currentTrialOptions.user_response = $.trim($('.autocompaste-textarea').val());
            return currentTrialOptions;
        }
    }

    return module;
})();

function extractSentence(txt){ //Derived from stackoverflow
  sentences = txt.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
  return sentences[getRandomInt(0, sentences.length)];
}

function extractPhrase(txt){
  random_sentence = extractSentence(txt);
  words = random_sentence.split(/[ ,]+/);
  words.pop();
  var random_length = getRandomInt(3,4);
  var random_start = getRandomInt(0, words.length - random_length);
  words = words.slice(random_start, random_start + random_length);
  return words.join(' ');
}

function extractParagraph(txt){
  sentences = txt.split("\n\n");
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = obj[prop];
    return result;
}
