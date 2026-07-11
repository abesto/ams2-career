/**
 * Component Generator
 */

import inquirer from 'inquirer';
import path from 'path';
import { Actions, PlopGeneratorConfig } from 'node-plop';

import { baseGeneratorPath } from '../paths';
import {
  normalizeRelativeGeneratorPath,
  pathExists,
  validateRelativeGeneratorPath,
} from '../utils';

export enum ComponentProptNames {
  componentName = 'componentName',
  path = 'path',
}

type Answers = { [P in ComponentProptNames]: string };

export const componentGenerator: PlopGeneratorConfig = {
  description: 'Add a component',
  prompts: async () =>
    inquirer.prompt<Answers>([
      {
        type: 'input',
        name: ComponentProptNames.componentName,
        message: 'What should it be called?',
      },
      {
        type: 'input',
        name: ComponentProptNames.path,
        message: 'Where do you want it to be created? (relative to src/app)',
        default: '.',
        validate: input => validateRelativeGeneratorPath(input, baseGeneratorPath),
        filter: input => normalizeRelativeGeneratorPath(input),
      },
    ]),
  actions: data => {
    const answers = data as Answers;
    const targetDirectory = path.join(baseGeneratorPath, answers.path || '.');
    const componentPath = path.join(
      targetDirectory,
      `{{properCase ${ComponentProptNames.componentName}}}`,
    );
    const actualComponentPath = path.join(
      targetDirectory,
      answers.componentName,
    );

    if (pathExists(actualComponentPath)) {
      throw new Error(`Component '${answers.componentName}' already exists`);
    }
    const actions: Actions = [
      {
        type: 'add',
        path: `${componentPath}/index.tsx`,
        templateFile: './component/index.tsx.hbs',
        abortOnFail: true,
      },
    ];

    actions.push({
      type: 'prettify',
      data: { path: `${actualComponentPath}/**` },
    });

    return actions;
  },
};
