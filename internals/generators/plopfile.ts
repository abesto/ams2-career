import { NodePlopAPI } from 'node-plop';
import { componentGenerator } from './component/index';
import shell from 'shelljs';
import { sliceGenerator } from './slice/index';
interface PrettifyCustomActionData {
  path: string;
}

export function registerGenerators(plop: NodePlopAPI) {
  plop.setGenerator('component', componentGenerator);
  plop.setGenerator('slice', sliceGenerator);

  plop.setActionType('prettify', (answers, config) => {
    const data = config!.data as PrettifyCustomActionData;
    shell.exec(`pnpm run prettify -- "${data.path}"`, { silent: true });
    return '';
  });
}

export default registerGenerators;
