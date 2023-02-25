#!/usr/bin/env node



import { Command } from 'commander';
import glob from 'glob';
import cliui from 'cliui';
import path from 'path';
import chalkAnimation from 'chalk-animation';

const program = new Command();

program
  .arguments('<directory>')
  .option('-e, --exclude <types>', 'Exclude file types (comma-separated)')
  .action(async (directory, options) => {
    const { exclude } = options;
    const files = await getFiles(directory, exclude);
    const types = countTypes(files);
    const chart = createBarChart(types);
    const borderAnimation = chalkAnimation.rainbow(createBorder(chart));
    setTimeout(() => {
      borderAnimation.stop();
    }, 5000);
  });

async function getFiles(directory, exclude) {
  const pattern = `${directory}/**/*.*`;
  const options = { nodir: true };
  if (exclude) {
    const excludes = exclude.split(',').map(type => `**/*.${type.trim()}`);
    options.ignore = excludes;
  }
  return new Promise((resolve, reject) => {
    glob(pattern, options, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}

function countTypes(files) {
  const types = {};
  files.forEach(file => {
    const extension = path.extname(file).toLowerCase();
    if (extension) {
      types[extension] = (types[extension] || 0) + 1;
    }
  });
  return types;
}

function createBarChart(types) {
  const ui = cliui();
  const maxCount = Math.max(...Object.values(types));
  Object.entries(types).forEach(([type, count]) => {
    const bar = '#'.repeat(Math.round(count / maxCount * 40));
    ui.div({
      text: `${bar} ${type}: ${count.toString().padStart(4)}`
    });
  });
  return ui.toString();
}




function createBorder(text) {
  const width = cliui().width;
  const borderChars = ['-', '|', '-', '|'];
  const border = borderChars.join('').repeat(width / 4);
  return `${border}\n${text}\n${border}`;
}

program.parse(process.argv);



