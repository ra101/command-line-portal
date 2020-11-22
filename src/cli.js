/* global $, localStorage, Shell */
let ipAddr = "127.0.0.1"
$(function () {
  $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
    function (json) {
      ipAddr = json.ip;
      rootPath = 'ra101/users/' + ipAddr;
    }
  );
});

const errors = {
  invalidDirectory: 'Error: not a valid directory',
  noWriteAccess: 'Error: you do not have write access to this directory',
  fileNotFound: 'Error: file not found in current directory',
  fileNotSpecified: 'Error: you did not specify a file',
  invalidFile: 'Error: not a valid file',
};

const struct = {
  root: ['about', 'resume', 'contact'],
  skills: ['languages', 'frameworks', 'databases', 'tools', 'others'],
};

const commands = {};
let systemData = {};
const title = ["🕸️ https://ra101.github.io/cli/", "🕸️ ra101://cli"];
let rootPath = 'ra101/users/127.0.0.1';

const getDirectory = () => localStorage.directory;
const setDirectory = (dir) => {
  localStorage.directory = dir;
};

// Turn on fullscreen.
const registerFullscreenToggle = () => {
  $('.button.green').click(() => {
    $('.terminal-window').removeClass('minimized');
    $('.terminal-window').toggleClass('fullscreen');
    $('.terminal-title').html(title[0])
  });
};
const registerMinimizedToggle = () => {
  $('.button.yellow').click(() => {
    $('.terminal-window').removeClass('fullscreen');
    $('.terminal-window').toggleClass('minimized');
    let flag = $('.terminal-window').hasClass('minimized') ? 1 : 0;;
    $('.terminal-title').html(title[flag]);
  });
};

const registerCross = () => {
  $('.button.red').click(() => {
    $(location).attr('href', 'http://ra101.github.io');
  });
};

// noWriteAccess commands.
commands.mkdir = () => errors.noWriteAccess;
commands.touch = () => errors.noWriteAccess;
commands.rm = () => errors.noWriteAccess;
commands.rmdir = () => errors.noWriteAccess;
commands.cp = () => errors.noWriteAccess;
commands.mv = () => errors.noWriteAccess;
commands.chmod = () => errors.noWriteAccess;
commands.chown = () => errors.noWriteAccess;

commands.ls = (directory) => {
  console.log(systemData);
  if (directory === '..' || directory === '~') {
    return systemData['root'];
  }

  if (directory in struct) {
    return systemData[directory];
  }

  return systemData[getDirectory()];
};

commands.dir = commands.ls

// View list of possible commands.
commands.help = () => systemData.help;
commands.all_commands = () => systemData.all_commands;

// A simple Echo.
commands.echo = (sampleText) => { return sampleText };
commands.printf = commands.echo


// Few additionals.
commands.hostname = () => { return ipAddr };
commands.uname = () => {
  if (navigator.userAgent.indexOf("Chrome") > -1) {
    return "V8"
  } else if (navigator.userAgent.indexOf("WebKit") > -1) {
    return "JavaScriptCore"
  } else {
    return "SpiderMonkey"
  }
}

// Glowing 〈 RA 〉 text
commands.ra = () => systemData.ra;
commands.ra101 = commands.ra

// a lil codebytere tribute
commands.codebytere = () => systemData.codebytere;

// Display current path.
commands.pwd = () => {
  const dir = getDirectory();
  return dir === 'root' ? rootPath : `${rootPath}/${dir}`;
};

// See command history.
commands.history = () => {
  let history = localStorage.history;
  history = history ? Object.values(JSON.parse(history)) : [];
  return `<p>${history.join('<br>')}</p>`;
};

// Move into specified directory.
commands.cd = (newDirectory) => {
  const currDir = getDirectory();
  const dirs = Object.keys(struct);
  const newDir = newDirectory ? newDirectory.trim() : '';

  if (dirs.includes(newDir) && currDir !== newDir) {
    setDirectory(newDir);
  } else if (newDir === '' || newDir === '~' || (newDir === '..' && dirs.includes(currDir))) {
    setDirectory('root');
  } else {
    return errors.invalidDirectory;
  }
  return null;
};

// Display contents of specified file.
commands.cat = (filename) => {
  if (!filename) return errors.fileNotSpecified;

  const isADirectory = (filename) => struct.hasOwnProperty(filename);
  const hasValidFileExtension = (filename, extension) => filename.includes(extension);
  const isFileInDirectory = (filename) => (filename.split('/').length === 1 ? false : true);
  const isFileInSubdirectory = (filename, directory) => struct[directory].includes(filename);

  if (isADirectory(filename)) return errors.invalidFile;

  if (!isFileInDirectory(filename)) {
    const fileKey = filename.split('.')[0];
    const isValidFile = (filename) => systemData.hasOwnProperty(filename);

    if (isValidFile(fileKey) && hasValidFileExtension(filename, '.txt')) {
      return systemData[fileKey];
    }
  }

  if (isFileInDirectory(filename)) {
    if (hasValidFileExtension(filename, '.txt')) {
      const directories = filename.split('/');
      const directory = directories.slice(0, 1).join(',');
      const fileKey = directories.slice(1, directories.length).join(',').split('.')[0];
      if (directory === 'root' || !struct.hasOwnProperty(directory))
        return errors.noSuchFileOrDirectory;

      return isFileInSubdirectory(fileKey, directory)
        ? systemData[fileKey]
        : errors.noSuchFileOrDirectory;
    }

    return errors.noSuchFileOrDirectory;
  }

  return errors.fileNotFound;
};

//shutdown command
commands.quit = commands.shutdown = commands.exit = () => { $(location).attr('href', 'http://ra101.github.io'); }

//restart command
commands.reboot = commands.restart = commands.reload = () => { location.reload(); }


// Initialize cli.
$(() => {
  registerFullscreenToggle();
  registerMinimizedToggle();
  registerCross();
  const cmd = document.getElementById('terminal');

  $.ajaxSetup({ cache: false });
  const pages = [];
  pages.push($.get('pages/about.html'));
  pages.push($.get('pages/contact.html'));
  pages.push($.get('pages/help.html'));
  pages.push($.get('pages/all_commands.html'));
  pages.push($.get('pages/ra.html'));
  pages.push($.get('pages/codebytere.html'));
  pages.push($.get('pages/resume.html'));
  pages.push($.get('pages/root.html'));
  pages.push($.get('pages/skills.html'));
  pages.push($.get('pages/languages.html'));
  pages.push($.get('pages/frameworks.html'));
  pages.push($.get('pages/databases.html'));
  pages.push($.get('pages/tools.html'));
  pages.push($.get('pages/others.html'));
  $.when
    .apply($, pages)
    .done(
      (
        aboutData,
        contactData,
        helpData,
        all_commandsData,
        raData,
        codebytereData,
        resumeData,
        rootData,
        skillsData,
        languagesData,
        frameworksData,
        databasesData,
        toolsData,
        othersData,
      ) => {
        systemData['about'] = aboutData[0];
        systemData['contact'] = contactData[0];
        systemData['help'] = helpData[0];
        systemData['all_commands'] = all_commandsData[0]
        systemData['ra'] = raData[0];
        systemData['codebytere'] = codebytereData[0];
        systemData['resume'] = resumeData[0];
        systemData['root'] = rootData[0];
        systemData['skills'] = skillsData[0];
        systemData['languages'] = languagesData[0];
        systemData['frameworks'] = frameworksData[0];
        systemData['databases'] = databasesData[0];
        systemData['tools'] = toolsData[0];
        systemData['others'] = othersData[0];
      },
    );

  const terminal = new Shell(cmd, commands);
});
