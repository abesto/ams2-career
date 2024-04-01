/**
 * Container Generator
 */

import inquirer from 'inquirer';
import inquirerDirectory from 'inquirer-directory';
import { Actions, PlopGeneratorConfig } from 'node-plop';
import path from 'path';

import { baseGeneratorPath } from '../paths';
import { pathExists } from '../utils';

inquirer.registerPrompt('directory', inquirerDirectory);

export enum SliceProptNames {
  'sliceName' = 'sliceName',
  'path' = 'path',
}

type Answers = { [P in SliceProptNames]: string };

export const rootStatePath = path.join(
  __dirname,
  '../../../src/types/RootState.ts',
);

export const sliceGenerator: PlopGeneratorConfig = {
  description: 'Add a redux toolkit slice',
  prompts: [
    {
      type: 'input',
      name: SliceProptNames.sliceName,
      message: 'What should it be called (automatically adds ...Slice postfix)',
    },
    {
      type: 'directory',
      name: SliceProptNames.path,
      message: 'Where do you want it to be created?',
      // @ts-expect-error "Object literal may only specify known properties, and 'basePath' does not exist in type 'Question<Answers>'.ts(2353)"
      // A quick Google doesn't turn up anythign about this, don't really care
      basePath: `${baseGeneratorPath}`,
    },
  ],
  actions: data => {
    const answers = data as Answers;

    const slicePath = `${baseGeneratorPath}/${answers.path}/slice`;

    if (pathExists(slicePath)) {
      throw new Error(`Slice '${answers.sliceName}' already exists`);
    }
    const actions: Actions = [];

    actions.push({
      type: 'add',
      path: `${slicePath}/index.ts`,
      templateFile: './slice/index.ts.hbs',
      abortOnFail: true,
    });
    actions.push({
      type: 'add',
      path: `${slicePath}/initialState.ts`,
      templateFile: './slice/initialState.ts.hbs',
      abortOnFail: true,
    });
    actions.push({
      type: 'add',
      path: `${slicePath}/selectors.ts`,
      templateFile: './slice/selectors.ts.hbs',
      abortOnFail: true,
    });
    actions.push({
      type: 'add',
      path: `${slicePath}/types.ts`,
      templateFile: './slice/types.ts.hbs',
      abortOnFail: true,
    });
    actions.push({
      type: 'modify',
      path: `${rootStatePath}`,
      pattern: new RegExp(/.*\/\/.*\[IMPORT NEW CONTAINERSTATE ABOVE\].+\n/),
      templateFile: './slice/importContainerState.hbs',
      abortOnFail: true,
    });
    actions.push({
      type: 'modify',
      path: `${rootStatePath}`,
      pattern: new RegExp(/.*\/\/.*\[INSERT NEW REDUCER KEY ABOVE\].+\n/),
      templateFile: './slice/appendRootState.hbs',
      abortOnFail: true,
    });

    actions.push({
      type: 'prettify',
      data: { path: `${slicePath}/**` },
    });

    return actions;
  },
};
