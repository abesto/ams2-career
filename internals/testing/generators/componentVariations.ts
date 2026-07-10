import { ComponentProptNames } from '../../generators/component';

type ComponentVariation = { [P in ComponentProptNames]: string };
type ComponentVariationType = ComponentVariation[];

const containerNameBase = `GeneratorTestingComponent`;

export const componentVariations = (): ComponentVariationType => {
  const variations: ComponentVariationType = [];
  variations.push({
    componentName: `${containerNameBase}0`,
    path: ``,
  });

  // Test some paths
  const paths = [
    '/components',
    '/pages/HomePage/Features',
    '/pages/HomePage/Features/GithubRepoForm',
  ];
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    variations.push({
      componentName: `${containerNameBase}${i + 1}`,
      path: `${path}`,
    });
  }
  return variations;
};
